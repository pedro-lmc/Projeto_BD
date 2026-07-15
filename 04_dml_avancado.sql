-- ====================================================================
-- PROJETO SISTEMA DE GESTÃO HOSPITALAR DRA. YUSKA MARITAN BRITO
-- ====================================================================

-- 1. Ranking dos residentes por número de atendimentos realizados (mostrar nome e total)
SELECT 
    p.nome AS nome_residente,
    COUNT(a.id_atendimento) AS total_atendimentos
FROM ATENDIMENTO a
JOIN RESIDENTE r ON a.id_residente = r.id_profissional
JOIN PESSOA p ON r.id_profissional = p.id_pessoa
GROUP BY p.id_pessoa, p.nome
ORDER BY total_atendimentos DESC;


-- 2. Preceptores que supervisionaram mais de 5 atendimentos em um determinado mês
-- (Nota: Ajustado para o mês de Junho/2026 que foi o utilizado na carga de dados de teste)
SELECT 
    p.nome AS nome_preceptor,
    COUNT(a.id_atendimento) AS total_supervisoes
FROM ATENDIMENTO a
JOIN PRECEPTOR prec ON a.id_preceptor = prec.id_profissional
JOIN PESSOA p ON prec.id_profissional = p.id_pessoa
WHERE a.data_hora >= '2026-06-01 00:00:00' 
  AND a.data_hora <= '2026-06-30 23:59:59'
GROUP BY p.id_pessoa, p.nome
HAVING COUNT(a.id_atendimento) > 5
ORDER BY total_supervisoes DESC;


-- 3. Para cada unidade, mostrar a quantidade de plantões escalados por residente
SELECT 
    u.nome AS nome_unidade,
    p.nome AS nome_residente,
    COUNT(e.id_escala) AS quantidade_plantoes
FROM ESCALA e
JOIN UNIDADE u ON e.id_unidade = u.id_unidade
JOIN RESIDENTE r ON e.id_residente = r.id_profissional
JOIN PESSOA p ON r.id_profissional = p.id_pessoa
GROUP BY u.id_unidade, u.nome, p.id_pessoa, p.nome
ORDER BY u.nome, quantidade_plantoes DESC;


-- 4. Listar pacientes que nunca realizaram nenhum procedimento de nível de risco 'ALTO'
SELECT 
    pac.id_pessoa AS id_paciente,
    p.nome AS nome_paciente,
    pac.num_convenio
FROM PACIENTE pac
JOIN PESSOA p ON pac.id_pessoa = p.id_pessoa
WHERE pac.id_pessoa NOT IN (
    SELECT DISTINCT a.id_paciente
    FROM PROCEDIMENTO_REALIZADO pr
    JOIN ATENDIMENTO a ON pr.id_atendimento = a.id_atendimento
    JOIN PROCEDIMENTO proc ON pr.id_procedimento = proc.id_procedimento
    WHERE proc.nivel_risco = 'ALTO'
);
