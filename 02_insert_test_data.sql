-- Etapa 1 - Dados de teste
-- Pessoa 2
-- rodar depois do 01_create_tables.sql

-- pacientes (5)
INSERT INTO PESSOA (id_pessoa, nome, cpf, data_nascimento, is_flamengo, telefone, endereco) VALUES
(1, 'Maria da Silva Souza', '10000000001', '1985-03-12', TRUE, '83988880001', 'Rua das Flores, 100'),
(2, 'Joao Pedro Almeida', '10000000002', '1990-07-22', FALSE, '83988880002', 'Av Epitacio Pessoa, 200'),
(3, 'Ana Beatriz Costa', '10000000003', '1978-11-05', TRUE, '83988880003', 'Rua Rio Grande do Norte, 300'),
(4, 'Carlos Eduardo Farias', '10000000004', '2001-01-30', FALSE, '83988880004', 'Rua Almeida Barreto, 400'),
(5, 'Fernanda Lima Rocha', '10000000005', '1995-09-14', TRUE, '83988880005', 'Av Cabo Branco, 500');

INSERT INTO PACIENTE (id_pessoa, num_convenio, alergias, grupo_sanguineo) VALUES
(1, 'CONV-1001', 'Dipirona', 'O+'),
(2, 'CONV-1002', 'Nenhuma', 'A+'),
(3, 'CONV-1003', 'Penicilina', 'B-'),
(4, NULL, 'Nenhuma', 'AB+'),
(5, 'CONV-1005', 'Latex', 'O-');

-- residentes (5) e preceptores (5)
INSERT INTO PESSOA (id_pessoa, nome, cpf, data_nascimento, is_flamengo, telefone, endereco) VALUES
(6, 'Bruno Henrique Nogueira', '20000000006', '1997-02-18', TRUE, '83988880006', 'Rua Joao Cirilo, 10'),
(7, 'Larissa Menezes Duarte', '20000000007', '1996-06-09', FALSE, '83988880007', 'Rua Joao Cirilo, 20'),
(8, 'Rafael Andrade Bezerra', '20000000008', '1998-12-01', FALSE, '83988880008', 'Rua Joao Cirilo, 30'),
(9, 'Camila Torres Sales', '20000000009', '1995-04-27', TRUE, '83988880009', 'Rua Joao Cirilo, 40'),
(10, 'Diego Fernandes Cavalcante', '20000000010', '1994-08-16', FALSE, '83988880010', 'Rua Joao Cirilo, 50'),
(11, 'Patricia Gouveia Melo', '20000000011', '1975-05-03', FALSE, '83988880011', 'Av Beira Rio, 60'),
(12, 'Marcos Antonio Lira', '20000000012', '1970-10-21', TRUE, '83988880012', 'Av Beira Rio, 70'),
(13, 'Renata Barbosa Xavier', '20000000013', '1980-01-09', FALSE, '83988880013', 'Av Beira Rio, 80'),
(14, 'Eduardo Campos Freire', '20000000014', '1968-03-25', FALSE, '83988880014', 'Av Beira Rio, 90'),
(15, 'Juliana Prado Aragao', '20000000015', '1982-07-30', TRUE, '83988880015', 'Av Beira Rio, 100');

INSERT INTO PROFISSIONAL (id_pessoa, crm, data_admissao, especialidade) VALUES
(6, 'CRM-PB-10001', '2023-02-01', 'Clinica Medica'),
(7, 'CRM-PB-10002', '2023-02-01', 'Pediatria'),
(8, 'CRM-PB-10003', '2023-02-01', 'Cirurgia Geral'),
(9, 'CRM-PB-10004', '2023-02-01', 'Ortopedia'),
(10, 'CRM-PB-10005', '2023-02-01', 'Ginecologia'),
(11, 'CRM-PB-20001', '2010-03-15', 'Clinica Medica'),
(12, 'CRM-PB-20002', '2008-06-10', 'Cirurgia Geral'),
(13, 'CRM-PB-20003', '2012-09-01', 'Pediatria'),
(14, 'CRM-PB-20004', '2005-01-20', 'Ortopedia'),
(15, 'CRM-PB-20005', '2014-11-11', 'Ginecologia');

INSERT INTO RESIDENTE (id_profissional, ano_residencia) VALUES
(6, 'R1'), (7, 'R2'), (8, 'R3'), (9, 'R1'), (10, 'R2');

INSERT INTO PRECEPTOR (id_profissional, titulacao) VALUES
(11, 'Doutor'), (12, 'Doutor'), (13, 'Mestre'), (14, 'Livre-Docente'), (15, 'Mestre');

-- unidades (3)
INSERT INTO UNIDADE (id_unidade, nome, tipo, capacidade_leitos) VALUES
(1, 'UTI Geral', 'UTI', 10),
(2, 'Pronto-Socorro Central', 'Pronto-Socorro', 20),
(3, 'Enfermaria Clinica Medica', 'Enfermaria', 30);

-- procedimentos (catalogo)
INSERT INTO PROCEDIMENTO (id_procedimento, codigo, nome, tempo_medio_minutos, nivel_risco) VALUES
(1, 'PROC001', 'Sutura simples', 20, 'BAIXO'),
(2, 'PROC002', 'Coleta de sangue', 10, 'BAIXO'),
(3, 'PROC003', 'Aplicacao de medicacao', 5, 'BAIXO'),
(4, 'PROC004', 'Curativo complexo', 25, 'MEDIO'),
(5, 'PROC005', 'Intubacao orotraqueal', 15, 'ALTO'),
(6, 'PROC006', 'Drenagem toracica', 40, 'ALTO'),
(7, 'PROC007', 'Reanimacao cardiopulmonar', 30, 'ALTO'),
(8, 'PROC008', 'Gasometria arterial', 10, 'MEDIO'),
(9, 'PROC009', 'Sondagem vesical', 15, 'MEDIO'),
(10, 'PROC010', 'Eletrocardiograma', 10, 'BAIXO');

-- atendimentos (10)
INSERT INTO ATENDIMENTO (id_atendimento, data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor) VALUES
(1, '2026-06-01 08:30', 40, 1, 6, 11),
(2, '2026-06-02 09:15', 30, 2, 7, 13),
(3, '2026-06-02 14:00', 50, 3, 8, 12),
(4, '2026-06-03 10:00', 25, 4, 9, 14),
(5, '2026-06-04 07:45', 60, 5, 10, 15),
(6, '2026-06-05 11:30', 35, 1, 7, 13),
(7, '2026-06-06 16:20', 20, 2, 6, 11),
(8, '2026-06-07 13:10', 45, 3, 9, 14),
(9, '2026-06-08 09:00', 30, 4, 8, 12),
(10, '2026-06-09 15:40', 55, 5, 6, 11);

-- procedimentos realizados (10)
INSERT INTO PROCEDIMENTO_REALIZADO (id_atendimento, id_procedimento, quantidade, tempo_real_minutos, observacao, faturado) VALUES
(1, 1, 1, 22, 'Sem intercorrencias', TRUE),
(2, 2, 1, 8, 'Coleta tranquila', TRUE),
(3, 5, 1, 18, 'Paciente estavel', FALSE),
(4, 3, 2, 6, 'Duas aplicacoes', TRUE),
(5, 6, 1, 45, 'Leve sangramento', FALSE),
(6, 4, 1, 30, 'Curativo trocado ok', TRUE),
(7, 10, 1, 12, 'ECG normal', TRUE),
(8, 7, 1, 35, 'RCP bem sucedida', FALSE),
(9, 9, 1, 16, 'Sem intercorrencias', TRUE),
(10, 8, 1, 11, 'Coletado com sucesso', FALSE);

-- ajusta as sequences pq os ids foram inseridos na mao
SELECT setval('pessoa_id_pessoa_seq', (SELECT MAX(id_pessoa) FROM PESSOA));
SELECT setval('unidade_id_unidade_seq', (SELECT MAX(id_unidade) FROM UNIDADE));
SELECT setval('procedimento_id_procedimento_seq', (SELECT MAX(id_procedimento) FROM PROCEDIMENTO));
SELECT setval('atendimento_id_atendimento_seq', (SELECT MAX(id_atendimento) FROM ATENDIMENTO));
