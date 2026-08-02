-- ============================================================================
-- ETAPA 2 — Stored Procedures, Triggers e Views
-- Rodar depois de 01_create_tables.sql (e idealmente após popular dados)
-- ============================================================================

-- ============================================================================
-- 1. STORED PROCEDURES
-- ============================================================================

-- 1.1 sp_registrar_atendimento_completo
-- Insere o atendimento + a lista de procedimentos realizados numa única
-- transação. Se qualquer procedimento falhar (ex.: id_procedimento inexistente,
-- quantidade <= 0), a função inteira é revertida (ROLLBACK automático, pois
-- toda function/procedure do Postgres já roda dentro de uma transação implícita
-- e um RAISE EXCEPTION desfaz tudo que a procedure fez).
CREATE OR REPLACE PROCEDURE sp_registrar_atendimento_completo(
    p_data_hora        TIMESTAMP,
    p_duracao_minutos  INTEGER,
    p_id_paciente      INTEGER,
    p_id_residente     INTEGER,
    p_id_preceptor     INTEGER,
    p_procedimentos    JSONB  -- ex: '[{"id_procedimento":1,"quantidade":1,"tempo_real_minutos":20,"observacao":"ok"}]'
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_atendimento INTEGER;
    v_item           JSONB;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM PACIENTE WHERE id_pessoa = p_id_paciente) THEN
        RAISE EXCEPTION 'Paciente % não existe', p_id_paciente;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM RESIDENTE WHERE id_profissional = p_id_residente) THEN
        RAISE EXCEPTION 'Residente % não existe', p_id_residente;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM PRECEPTOR WHERE id_profissional = p_id_preceptor) THEN
        RAISE EXCEPTION 'Preceptor % não existe', p_id_preceptor;
    END IF;

    INSERT INTO ATENDIMENTO (data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor)
    VALUES (p_data_hora, p_duracao_minutos, p_id_paciente, p_id_residente, p_id_preceptor)
    RETURNING id_atendimento INTO v_id_atendimento;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_procedimentos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM PROCEDIMENTO WHERE id_procedimento = (v_item->>'id_procedimento')::INTEGER) THEN
            RAISE EXCEPTION 'Procedimento % não existe — revertendo atendimento', v_item->>'id_procedimento';
        END IF;

        INSERT INTO PROCEDIMENTO_REALIZADO (id_atendimento, id_procedimento, quantidade, tempo_real_minutos, observacao)
        VALUES (
            v_id_atendimento,
            (v_item->>'id_procedimento')::INTEGER,
            COALESCE((v_item->>'quantidade')::INTEGER, 1),
            (v_item->>'tempo_real_minutos')::INTEGER,
            v_item->>'observacao'
        );
    END LOOP;

    RAISE NOTICE 'Atendimento % registrado com sucesso', v_id_atendimento;
END;
$$;

-- 1.2 sp_calcular_tempo_medio_espera
-- Para cada unidade, tempo médio entre a chegada do paciente (data_hora do
-- atendimento) e o início do primeiro procedimento daquele atendimento.
-- Como ATENDIMENTO não tem id_unidade diretamente no modelo (o vínculo com
-- unidade acontece via ESCALA do residente que atendeu), agregamos pela
-- unidade do plantão do residente no dia/turno mais próximo do atendimento.
-- Aqui simplificamos: cada procedimento realizado grava apenas tempo_real,
-- não um horário de início próprio — então usamos duracao_minutos acumulada
-- até o procedimento como proxy do "início do primeiro procedimento" = 0min
-- (o primeiro procedimento começa junto com o atendimento). Deixamos a
-- função pronta para caso o modelo passe a registrar hora de início por
-- procedimento (extensão natural: adicionar coluna hora_inicio em
-- PROCEDIMENTO_REALIZADO).
CREATE OR REPLACE FUNCTION sp_calcular_tempo_medio_espera()
RETURNS TABLE(id_unidade INTEGER, nome_unidade VARCHAR, tempo_medio_espera_minutos NUMERIC)
LANGUAGE sql
AS $$
    SELECT
        u.id_unidade,
        u.nome,
        ROUND(AVG(0)::NUMERIC, 2) AS tempo_medio_espera_minutos
        -- placeholder de 0 min até o modelo registrar hora_inicio por procedimento;
        -- a estrutura da consulta (join atendimento -> escala -> unidade) já está pronta.
    FROM UNIDADE u
    LEFT JOIN ESCALA e ON e.id_unidade = u.id_unidade
    LEFT JOIN ATENDIMENTO a ON a.id_residente = e.id_residente
    GROUP BY u.id_unidade, u.nome
    ORDER BY u.id_unidade;
$$;

-- 1.3 sp_reajustar_escala
-- Move todas as escalas de um residente de um dia/turno para outro,
-- desde que não gere conflito (mesma unidade+dia+turno+residente já
-- ocupada por outra escala).
CREATE OR REPLACE PROCEDURE sp_reajustar_escala(
    p_id_residente     INTEGER,
    p_dia_semana_atual VARCHAR,
    p_turno_atual      VARCHAR,
    p_dia_semana_novo  VARCHAR,
    p_turno_novo       VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_escala RECORD;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RESIDENTE WHERE id_profissional = p_id_residente) THEN
        RAISE EXCEPTION 'Residente % não existe', p_id_residente;
    END IF;

    FOR v_escala IN
        SELECT * FROM ESCALA
        WHERE id_residente = p_id_residente
          AND dia_semana = p_dia_semana_atual
          AND turno = p_turno_atual
    LOOP
        IF EXISTS (
            SELECT 1 FROM ESCALA
            WHERE id_unidade = v_escala.id_unidade
              AND dia_semana = p_dia_semana_novo
              AND turno = p_turno_novo
              AND id_residente = p_id_residente
              AND id_escala <> v_escala.id_escala
        ) THEN
            RAISE EXCEPTION 'Conflito: residente % já possui escala em %/% na unidade %',
                p_id_residente, p_dia_semana_novo, p_turno_novo, v_escala.id_unidade;
        END IF;

        UPDATE ESCALA
        SET dia_semana = p_dia_semana_novo,
            turno = p_turno_novo,
            version = version + 1
        WHERE id_escala = v_escala.id_escala;
    END LOOP;

    RAISE NOTICE 'Escalas do residente % reajustadas de %/% para %/%',
        p_id_residente, p_dia_semana_atual, p_turno_atual, p_dia_semana_novo, p_turno_novo;
END;
$$;

-- ============================================================================
-- 2. TRIGGERS
-- ============================================================================

-- 2.1 trg_check_sobreposicao_escala
-- Impede que o mesmo residente seja escalado no mesmo dia/turno em
-- unidades DIFERENTES.
CREATE OR REPLACE FUNCTION fn_check_sobreposicao_escala()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM ESCALA
        WHERE id_residente = NEW.id_residente
          AND dia_semana = NEW.dia_semana
          AND turno = NEW.turno
          AND id_unidade <> NEW.id_unidade
          AND id_escala <> COALESCE(NEW.id_escala, -1)
    ) THEN
        RAISE EXCEPTION 'Residente % já está escalado em outra unidade no %/%',
            NEW.id_residente, NEW.dia_semana, NEW.turno;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_sobreposicao_escala ON ESCALA;
CREATE TRIGGER trg_check_sobreposicao_escala
BEFORE INSERT OR UPDATE ON ESCALA
FOR EACH ROW EXECUTE FUNCTION fn_check_sobreposicao_escala();

-- 2.2 trg_audita_atendimento
-- Registra INSERT/UPDATE/DELETE em ATENDIMENTO na tabela AUDITORIA_ATENDIMENTO.
CREATE OR REPLACE FUNCTION fn_audita_atendimento()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO AUDITORIA_ATENDIMENTO (id_atendimento, operacao, dados_antigos, dados_novos)
        VALUES (NEW.id_atendimento, 'INSERT', NULL, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO AUDITORIA_ATENDIMENTO (id_atendimento, operacao, dados_antigos, dados_novos)
        VALUES (NEW.id_atendimento, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO AUDITORIA_ATENDIMENTO (id_atendimento, operacao, dados_antigos, dados_novos)
        VALUES (OLD.id_atendimento, 'DELETE', to_jsonb(OLD), NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audita_atendimento ON ATENDIMENTO;
CREATE TRIGGER trg_audita_atendimento
AFTER INSERT OR UPDATE OR DELETE ON ATENDIMENTO
FOR EACH ROW EXECUTE FUNCTION fn_audita_atendimento();

-- 2.3 trg_atualiza_media_procedimentos
-- Após inserir um PROCEDIMENTO_REALIZADO, recalcula a média de
-- tempo_real_minutos daquele procedimento em todos os atendimentos.
CREATE OR REPLACE FUNCTION fn_atualiza_media_procedimentos()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE PROCEDIMENTO
    SET media_tempo_procedimento = (
        SELECT AVG(tempo_real_minutos)
        FROM PROCEDIMENTO_REALIZADO
        WHERE id_procedimento = NEW.id_procedimento
    )
    WHERE id_procedimento = NEW.id_procedimento;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualiza_media_procedimentos ON PROCEDIMENTO_REALIZADO;
CREATE TRIGGER trg_atualiza_media_procedimentos
AFTER INSERT ON PROCEDIMENTO_REALIZADO
FOR EACH ROW EXECUTE FUNCTION fn_atualiza_media_procedimentos();

-- ============================================================================
-- 3. VIEWS
-- ============================================================================

-- 3.1 vw_pacientes_internados
CREATE OR REPLACE VIEW vw_pacientes_internados AS
SELECT
    p.id_pessoa,
    pe.nome,
    i.id_internacao,
    i.id_unidade,
    u.nome AS nome_unidade,
    i.data_hora_entrada
FROM INTERNACAO i
JOIN PACIENTE p ON p.id_pessoa = i.id_paciente
JOIN PESSOA pe ON pe.id_pessoa = p.id_pessoa
LEFT JOIN UNIDADE u ON u.id_unidade = i.id_unidade
WHERE i.data_hora_saida IS NULL
  AND i.id_internacao = (
      SELECT i2.id_internacao FROM INTERNACAO i2
      WHERE i2.id_paciente = i.id_paciente
      ORDER BY i2.data_hora_entrada DESC
      LIMIT 1
  );

-- 3.2 vw_residentes_sem_supervisor
-- Residentes escalados em algum plantão cujo preceptor não tem titulação
-- de doutor.
CREATE OR REPLACE VIEW vw_residentes_sem_supervisor AS
SELECT DISTINCT
    r.id_profissional AS id_residente,
    pe.nome AS nome_residente,
    e.id_escala,
    prec.id_profissional AS id_preceptor,
    pe2.nome AS nome_preceptor,
    prec.titulacao
FROM ESCALA e
JOIN RESIDENTE r ON r.id_profissional = e.id_residente
JOIN PESSOA pe ON pe.id_pessoa = r.id_profissional
JOIN PRECEPTOR prec ON prec.id_profissional = e.id_preceptor
JOIN PESSOA pe2 ON pe2.id_pessoa = prec.id_profissional
WHERE prec.titulacao <> 'doutor';

-- 3.3 vw_estatisticas_atendimentos_mensal
-- Agregação por mês e por unidade (via escala do residente que atendeu):
-- total de atendimentos, média de duração, procedimento mais comum.
CREATE OR REPLACE VIEW vw_estatisticas_atendimentos_mensal AS
WITH atend_unidade AS (
    SELECT
        a.id_atendimento,
        date_trunc('month', a.data_hora) AS mes,
        a.duracao_minutos,
        e.id_unidade
    FROM ATENDIMENTO a
    LEFT JOIN ESCALA e ON e.id_residente = a.id_residente
),
proc_mais_comum AS (
    SELECT
        au.mes,
        au.id_unidade,
        pr.id_procedimento,
        proc.nome AS nome_procedimento,
        COUNT(*) AS qtd,
        ROW_NUMBER() OVER (PARTITION BY au.mes, au.id_unidade ORDER BY COUNT(*) DESC) AS rn
    FROM atend_unidade au
    JOIN PROCEDIMENTO_REALIZADO pr ON pr.id_atendimento = au.id_atendimento
    JOIN PROCEDIMENTO proc ON proc.id_procedimento = pr.id_procedimento
    GROUP BY au.mes, au.id_unidade, pr.id_procedimento, proc.nome
)
SELECT
    au.mes,
    au.id_unidade,
    u.nome AS nome_unidade,
    COUNT(DISTINCT au.id_atendimento) AS total_atendimentos,
    ROUND(AVG(au.duracao_minutos)::NUMERIC, 2) AS media_duracao_minutos,
    pmc.nome_procedimento AS procedimento_mais_comum
FROM atend_unidade au
LEFT JOIN UNIDADE u ON u.id_unidade = au.id_unidade
LEFT JOIN proc_mais_comum pmc ON pmc.mes = au.mes AND pmc.id_unidade = au.id_unidade AND pmc.rn = 1
GROUP BY au.mes, au.id_unidade, u.nome, pmc.nome_procedimento
ORDER BY au.mes, au.id_unidade;
