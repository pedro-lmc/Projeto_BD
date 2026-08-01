-- ============================================================================
-- ETAPA 1 – Seção 3: Operações do dia a dia (CRUD + Consultas)
-- Matheus (Pessoa 3)
-- 
-- Lembrete: rode primeiro o 01_create_tables.sql e o 02_insert_test_data.sql!
-- ============================================================================

-- ============================================================================
-- OPERAÇÃO 1 – Inserir atendimento
-- Checamos se o paciente, residente e preceptor existem antes de inserir.
-- ============================================================================
SELECT '--- ANTES da inserção ---' AS status;

SELECT a.id_atendimento, a.data_hora, a.duracao_minutos, 
       pac.nome AS paciente, res.nome AS residente, pre.nome AS preceptor
FROM ATENDIMENTO a
    JOIN PESSOA pac ON a.id_paciente  = pac.id_pessoa
    JOIN PESSOA res ON a.id_residente = res.id_pessoa
    JOIN PESSOA pre ON a.id_preceptor = pre.id_pessoa
ORDER BY a.id_atendimento;

DO $$
DECLARE
    p_data_hora       TIMESTAMP := '2026-07-01 10:00:00';
    p_duracao         INTEGER   := 35;
    p_id_paciente     INTEGER   := 1;   
    p_id_residente    INTEGER   := 6;   
    p_id_preceptor    INTEGER   := 11;  
    v_novo_id         INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM PACIENTE WHERE id_pessoa = p_id_paciente) THEN
        RAISE EXCEPTION 'Erro: Paciente % não existe.', p_id_paciente;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM RESIDENTE WHERE id_profissional = p_id_residente) THEN
        RAISE EXCEPTION 'Erro: Residente % não existe.', p_id_residente;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM PRECEPTOR WHERE id_profissional = p_id_preceptor) THEN
        RAISE EXCEPTION 'Erro: Preceptor % não existe.', p_id_preceptor;
    END IF;

    INSERT INTO ATENDIMENTO (data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor)
    VALUES (p_data_hora, p_duracao, p_id_paciente, p_id_residente, p_id_preceptor)
    RETURNING id_atendimento INTO v_novo_id;

    RAISE NOTICE '✓ Sucesso! ID do atendimento: %', v_novo_id;
END;
$$;

SELECT '--- DEPOIS da inserção ---' AS status;

SELECT a.id_atendimento, a.data_hora, a.duracao_minutos, 
       pac.nome AS paciente, res.nome AS residente, pre.nome AS preceptor
FROM ATENDIMENTO a
    JOIN PESSOA pac ON a.id_paciente  = pac.id_pessoa
    JOIN PESSOA res ON a.id_residente = res.id_pessoa
    JOIN PESSOA pre ON a.id_preceptor = pre.id_pessoa
ORDER BY a.id_atendimento;


-- ============================================================================
-- OPERAÇÃO 2 – Histórico do paciente
-- Traz todos os atendimentos ordenados por data. 
-- ============================================================================
SELECT '--- Histórico de atendimentos do paciente 1 ---' AS consulta;

SELECT a.id_atendimento, TO_CHAR(a.data_hora, 'DD/MM/YYYY HH24:MI') AS data,
       a.duracao_minutos AS duracao, pes_pac.nome AS paciente,
       pes_res.nome AS residente, pes_pre.nome AS preceptor
FROM ATENDIMENTO a
    JOIN PACIENTE pac   ON a.id_paciente  = pac.id_pessoa
    JOIN PESSOA pes_pac ON pac.id_pessoa  = pes_pac.id_pessoa
    JOIN RESIDENTE res  ON a.id_residente = res.id_profissional
    JOIN PESSOA pes_res ON res.id_profissional = pes_res.id_pessoa
    JOIN PRECEPTOR pre  ON a.id_preceptor = pre.id_profissional
    JOIN PESSOA pes_pre ON pre.id_profissional = pes_pre.id_pessoa
WHERE a.id_paciente = 1
ORDER BY a.data_hora ASC;


-- ============================================================================
-- OPERAÇÃO 3 – Procedimentos do atendimento
-- O que foi feito, o tempo gasto e a comparação com o tempo médio.
-- ============================================================================
SELECT '--- Procedimentos do atendimento 1 ---' AS consulta;

SELECT pr.id_atendimento, p.codigo, p.nome AS procedimento, pr.quantidade, 
       pr.tempo_real_minutos AS tempo_real, p.tempo_medio_minutos AS esperado,
       CASE WHEN pr.tempo_real_minutos <= p.tempo_medio_minutos THEN 'Ok' ELSE 'Acima' END AS status,
       COALESCE(pr.observacao, '-')  AS observacao
FROM PROCEDIMENTO_REALIZADO pr
    JOIN PROCEDIMENTO p ON pr.id_procedimento = p.id_procedimento
WHERE pr.id_atendimento = 1
ORDER BY p.nome;


-- ============================================================================
-- OPERAÇÃO 4 – Atualizar cadastro (endereço e convênio)
-- Endereço fica em PESSOA, convênio em PACIENTE. Atualizamos ambos.
-- ============================================================================
SELECT '--- ANTES: Paciente 2 ---' AS status;

SELECT pes.nome, pes.endereco, pac.num_convenio
FROM PESSOA pes JOIN PACIENTE pac ON pes.id_pessoa = pac.id_pessoa
WHERE pes.id_pessoa = 2;

UPDATE PESSOA SET endereco = 'Rua Nova Esperanca, 750' WHERE id_pessoa = 2 AND EXISTS (SELECT 1 FROM PACIENTE WHERE id_pessoa = 2);
UPDATE PACIENTE SET num_convenio = 'CONV-2099' WHERE id_pessoa = 2;

SELECT '--- DEPOIS: Paciente 2 ---' AS status;

SELECT pes.nome, pes.endereco, pac.num_convenio
FROM PESSOA pes JOIN PACIENTE pac ON pes.id_pessoa = pac.id_pessoa
WHERE pes.id_pessoa = 2;


-- ============================================================================
-- OPERAÇÃO 5 – Remover procedimento
-- Só remove se a flag de faturamento for FALSE. Se não, bloqueia.
-- ============================================================================
SELECT '--- Procedimentos antes do Delete ---' AS consulta;

SELECT pr.id_atendimento, pr.id_procedimento, p.nome AS procedimento, pr.faturado
FROM PROCEDIMENTO_REALIZADO pr JOIN PROCEDIMENTO p ON pr.id_procedimento = p.id_procedimento
ORDER BY pr.id_atendimento, pr.id_procedimento;

DO $$
DECLARE
    p_id_atendimento   INTEGER := 3;
    p_id_procedimento  INTEGER := 5;
    v_faturado         BOOLEAN;
BEGIN
    SELECT faturado INTO v_faturado FROM PROCEDIMENTO_REALIZADO
    WHERE id_atendimento = p_id_atendimento AND id_procedimento = p_id_procedimento;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Procedimento não encontrado.';
    END IF;

    IF v_faturado THEN
        RAISE EXCEPTION 'Ops! Procedimento já faturado. Não pode excluir.';
    END IF;

    DELETE FROM PROCEDIMENTO_REALIZADO
    WHERE id_atendimento = p_id_atendimento AND id_procedimento = p_id_procedimento;

    RAISE NOTICE '✓ Procedimento excluído.';
END;
$$;

SELECT '--- Procedimentos após Delete ---' AS status;

SELECT pr.id_atendimento, pr.id_procedimento, p.nome AS procedimento, pr.faturado
FROM PROCEDIMENTO_REALIZADO pr JOIN PROCEDIMENTO p ON pr.id_procedimento = p.id_procedimento
ORDER BY pr.id_atendimento, pr.id_procedimento;


-- ============================================================================
-- OPERAÇÃO 6 – Desempenho dos Residentes
-- Média de tempo gasto nos atendimentos agrupado por residente.
-- ============================================================================
SELECT '--- Média de tempo por residente ---' AS consulta;

SELECT pes.nome AS residente, r.ano_residencia AS ano,
       COUNT(a.id_atendimento) AS total_atendimentos,
       ROUND(AVG(a.duracao_minutos), 2) AS media_minutos
FROM ATENDIMENTO a
    JOIN RESIDENTE r    ON a.id_residente   = r.id_profissional
    JOIN PROFISSIONAL prof ON r.id_profissional = prof.id_pessoa
    JOIN PESSOA pes     ON prof.id_pessoa   = pes.id_pessoa
GROUP BY pes.nome, r.ano_residencia
ORDER BY media_minutos DESC;
