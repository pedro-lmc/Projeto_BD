-- ============================================================================
-- Etapa 1 - Seção 3: CRUD e Consultas Básicas (DML Essencial)
-- Pessoa 3 (Matheus) - Operações Diárias e Consultas Básicas
-- Projeto: Sistema de Gestão Hospitalar Dra. Yuska Maritan Brito
--
-- Pré-requisitos:
--   1) Executar 01_create_tables.sql (criação das tabelas)
--   2) Executar 02_insert_test_data.sql (carga de dados de teste)
--
-- SGBD: PostgreSQL
-- ============================================================================


-- ============================================================================
-- OPERAÇÃO 1: Inserir um novo atendimento
-- Valida a existência do paciente, residente e preceptor antes de inserir.
-- Utiliza bloco PL/pgSQL anônimo com RAISE EXCEPTION para validação robusta.
-- ============================================================================

-- Parâmetros do novo atendimento (altere conforme necessário):
--   p_data_hora       => data e hora do atendimento
--   p_duracao         => duração em minutos
--   p_id_paciente     => id do paciente (deve existir na tabela PACIENTE)
--   p_id_residente    => id do residente (deve existir na tabela RESIDENTE)
--   p_id_preceptor    => id do preceptor (deve existir na tabela PRECEPTOR)

DO $$
DECLARE
    p_data_hora       TIMESTAMP := '2026-07-01 10:00:00';
    p_duracao         INTEGER   := 35;
    p_id_paciente     INTEGER   := 1;
    p_id_residente    INTEGER   := 6;
    p_id_preceptor    INTEGER   := 11;
    v_novo_id         INTEGER;
BEGIN
    -- Validação 1: O paciente existe?
    IF NOT EXISTS (SELECT 1 FROM PACIENTE WHERE id_pessoa = p_id_paciente) THEN
        RAISE EXCEPTION 'ERRO: Paciente com id % não encontrado na tabela PACIENTE.', p_id_paciente;
    END IF;

    -- Validação 2: O residente existe?
    IF NOT EXISTS (SELECT 1 FROM RESIDENTE WHERE id_profissional = p_id_residente) THEN
        RAISE EXCEPTION 'ERRO: Residente com id % não encontrado na tabela RESIDENTE.', p_id_residente;
    END IF;

    -- Validação 3: O preceptor existe?
    IF NOT EXISTS (SELECT 1 FROM PRECEPTOR WHERE id_profissional = p_id_preceptor) THEN
        RAISE EXCEPTION 'ERRO: Preceptor com id % não encontrado na tabela PRECEPTOR.', p_id_preceptor;
    END IF;

    -- Todas as validações passaram: inserir o atendimento
    INSERT INTO ATENDIMENTO (data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor)
    VALUES (p_data_hora, p_duracao, p_id_paciente, p_id_residente, p_id_preceptor)
    RETURNING id_atendimento INTO v_novo_id;

    RAISE NOTICE 'Atendimento inserido com sucesso! ID: %', v_novo_id;
END;
$$;

-- Exemplo com paciente inexistente (id 999 - deve gerar erro):
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM PACIENTE WHERE id_pessoa = 999) THEN
--         RAISE EXCEPTION 'ERRO: Paciente com id 999 não encontrado.';
--     END IF;
-- END;
-- $$;


-- ============================================================================
-- OPERAÇÃO 2: Listar todos os atendimentos de um paciente específico
-- Ordenados por data (mais antigo primeiro).
-- Troca o id do paciente no WHERE para consultar outro paciente.
-- ============================================================================

-- Parâmetro: id do paciente a consultar
-- Exemplo: paciente id = 1 (Maria da Silva Souza)

SELECT
    a.id_atendimento,
    a.data_hora,
    a.duracao_minutos,
    pes_pac.nome       AS nome_paciente,
    pes_res.nome       AS nome_residente,
    pes_pre.nome       AS nome_preceptor
FROM ATENDIMENTO a
    INNER JOIN PACIENTE pac   ON a.id_paciente  = pac.id_pessoa
    INNER JOIN PESSOA pes_pac ON pac.id_pessoa  = pes_pac.id_pessoa
    INNER JOIN RESIDENTE res  ON a.id_residente = res.id_profissional
    INNER JOIN PESSOA pes_res ON res.id_profissional = pes_res.id_pessoa
    INNER JOIN PRECEPTOR pre  ON a.id_preceptor = pre.id_profissional
    INNER JOIN PESSOA pes_pre ON pre.id_profissional = pes_pre.id_pessoa
WHERE a.id_paciente = 1            -- << altere o id aqui para outro paciente
ORDER BY a.data_hora ASC;


-- ============================================================================
-- OPERAÇÃO 3: Listar os procedimentos realizados em um atendimento
-- Traz o nome do procedimento, a quantidade executada e o tempo real gasto.
-- ============================================================================

-- Parâmetro: id do atendimento a consultar
-- Exemplo: atendimento id = 1

SELECT
    pr.id_atendimento,
    p.codigo            AS codigo_procedimento,
    p.nome              AS nome_procedimento,
    pr.quantidade,
    pr.tempo_real_minutos,
    p.tempo_medio_minutos AS tempo_medio_esperado,
    pr.observacao
FROM PROCEDIMENTO_REALIZADO pr
    INNER JOIN PROCEDIMENTO p ON pr.id_procedimento = p.id_procedimento
WHERE pr.id_atendimento = 1       -- << altere o id aqui para outro atendimento
ORDER BY p.nome ASC;


-- ============================================================================
-- OPERAÇÃO 4: Atualizar os dados de um paciente (endereço ou convênio)
-- Permite atualizar o endereço (tabela PESSOA) e/ou o número do convênio
-- (tabela PACIENTE). Usa transação para garantir consistência.
-- ============================================================================

-- Parâmetro: id do paciente a atualizar
-- Exemplo: paciente id = 2 (Joao Pedro Almeida)

-- 4a) Atualizar o endereço do paciente (coluna em PESSOA)
UPDATE PESSOA
SET endereco = 'Rua Nova Esperanca, 750'
WHERE id_pessoa = 2                -- << altere o id aqui
  AND EXISTS (SELECT 1 FROM PACIENTE WHERE id_pessoa = 2);

-- 4b) Atualizar o número do convênio do paciente (coluna em PACIENTE)
UPDATE PACIENTE
SET num_convenio = 'CONV-2099'
WHERE id_pessoa = 2;               -- << altere o id aqui

-- Verificação: conferir os dados atualizados
SELECT
    pes.id_pessoa,
    pes.nome,
    pes.endereco,
    pac.num_convenio
FROM PESSOA pes
    INNER JOIN PACIENTE pac ON pes.id_pessoa = pac.id_pessoa
WHERE pes.id_pessoa = 2;


-- ============================================================================
-- OPERAÇÃO 5: Remover um procedimento realizado
-- Só é permitido remover se a flag 'faturado' for FALSE.
-- Se já estiver faturado, a operação é recusada com mensagem de erro.
-- ============================================================================

-- Parâmetros:
--   p_id_atendimento  => id do atendimento
--   p_id_procedimento => id do procedimento a remover

DO $$
DECLARE
    p_id_atendimento   INTEGER := 3;   -- Atendimento 3
    p_id_procedimento  INTEGER := 5;   -- Procedimento 5 (Intubacao orotraqueal)
    v_faturado         BOOLEAN;
    v_linhas           INTEGER;
BEGIN
    -- Verificar se o registro existe
    SELECT faturado INTO v_faturado
    FROM PROCEDIMENTO_REALIZADO
    WHERE id_atendimento = p_id_atendimento
      AND id_procedimento = p_id_procedimento;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ERRO: Procedimento realizado não encontrado (atendimento=%, procedimento=%).',
            p_id_atendimento, p_id_procedimento;
    END IF;

    -- Verificar flag de faturamento
    IF v_faturado = TRUE THEN
        RAISE EXCEPTION 'ERRO: Não é possível remover. O procedimento (atendimento=%, procedimento=%) já foi faturado.',
            p_id_atendimento, p_id_procedimento;
    END IF;

    -- Faturamento FALSE: permitir a remoção
    DELETE FROM PROCEDIMENTO_REALIZADO
    WHERE id_atendimento = p_id_atendimento
      AND id_procedimento = p_id_procedimento;

    GET DIAGNOSTICS v_linhas = ROW_COUNT;
    RAISE NOTICE 'Procedimento realizado removido com sucesso! (% registro(s) excluído(s))', v_linhas;
END;
$$;

-- Exemplo com procedimento já faturado (deve gerar erro):
-- O registro (atendimento=1, procedimento=1) tem faturado=TRUE
-- DO $$
-- BEGIN
--     IF (SELECT faturado FROM PROCEDIMENTO_REALIZADO
--         WHERE id_atendimento = 1 AND id_procedimento = 1) = TRUE THEN
--         RAISE EXCEPTION 'Não é possível remover: procedimento já faturado.';
--     END IF;
-- END;
-- $$;


-- ============================================================================
-- OPERAÇÃO 6: Calcular o tempo médio de duração dos atendimentos por residente
-- Agrupa por residente e calcula AVG(duracao_minutos).
-- ============================================================================

SELECT
    res.id_profissional                     AS id_residente,
    pes.nome                                AS nome_residente,
    r.ano_residencia,
    COUNT(a.id_atendimento)                 AS total_atendimentos,
    ROUND(AVG(a.duracao_minutos), 2)        AS tempo_medio_minutos
FROM ATENDIMENTO a
    INNER JOIN RESIDENTE r   ON a.id_residente = r.id_profissional
    INNER JOIN PROFISSIONAL res ON r.id_profissional = res.id_pessoa
    INNER JOIN PESSOA pes    ON res.id_pessoa = pes.id_pessoa
GROUP BY res.id_profissional, pes.nome, r.ano_residencia
ORDER BY tempo_medio_minutos DESC;
