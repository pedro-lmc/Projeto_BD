-- Projeto Sistema de Gestão Hospitalar

-- obs: adicionei "endereco" em PESSOA, "nivel_risco" em PROCEDIMENTO e
-- "faturado" em PROCEDIMENTO_REALIZADO pq os requisitos da etapa 1 pedem
-- (atualizar endereco/convenio do paciente, filtrar risco alto, e checar
-- faturamento antes de deletar procedimento). O modelo original não tinha
-- essas colunas.

DROP TABLE IF EXISTS ESCALA CASCADE;
DROP TABLE IF EXISTS PROCEDIMENTO_REALIZADO CASCADE;
DROP TABLE IF EXISTS ATENDIMENTO CASCADE;
DROP TABLE IF EXISTS PROCEDIMENTO CASCADE;
DROP TABLE IF EXISTS UNIDADE CASCADE;
DROP TABLE IF EXISTS RESIDENTE CASCADE;
DROP TABLE IF EXISTS PRECEPTOR CASCADE;
DROP TABLE IF EXISTS PROFISSIONAL CASCADE;
DROP TABLE IF EXISTS PACIENTE CASCADE;
DROP TABLE IF EXISTS PESSOA CASCADE;

-- PESSOA
CREATE TABLE PESSOA (
    id_pessoa SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    is_flamengo BOOLEAN NOT NULL DEFAULT FALSE,
    telefone VARCHAR(20),
    endereco VARCHAR(200)
);

-- PACIENTE (herda de PESSOA)
CREATE TABLE PACIENTE (
    id_pessoa INTEGER PRIMARY KEY,
    num_convenio VARCHAR(50),
    alergias TEXT,
    grupo_sanguineo VARCHAR(3),
    FOREIGN KEY (id_pessoa) REFERENCES PESSOA(id_pessoa) ON DELETE CASCADE,
    CHECK (grupo_sanguineo IN ('A+','A-','B+','B-','AB+','AB-','O+','O-') OR grupo_sanguineo IS NULL)
);

-- PROFISSIONAL (herda de PESSOA)
CREATE TABLE PROFISSIONAL (
    id_pessoa INTEGER PRIMARY KEY,
    crm VARCHAR(20) NOT NULL UNIQUE,
    data_admissao DATE NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_pessoa) REFERENCES PESSOA(id_pessoa) ON DELETE CASCADE
);

-- PRECEPTOR (herda de PROFISSIONAL)
CREATE TABLE PRECEPTOR (
    id_profissional INTEGER PRIMARY KEY,
    titulacao VARCHAR(50) NOT NULL CHECK (titulacao IN ('Especialista','Mestre','Doutor','Livre-Docente')),
    FOREIGN KEY (id_profissional) REFERENCES PROFISSIONAL(id_pessoa) ON DELETE CASCADE
);

-- RESIDENTE (herda de PROFISSIONAL)
CREATE TABLE RESIDENTE (
    id_profissional INTEGER PRIMARY KEY,
    ano_residencia VARCHAR(2) NOT NULL CHECK (ano_residencia IN ('R1','R2','R3')),
    FOREIGN KEY (id_profissional) REFERENCES PROFISSIONAL(id_pessoa) ON DELETE CASCADE
);

-- UNIDADE
CREATE TABLE UNIDADE (
    id_unidade SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Enfermaria','UTI','Pronto-Socorro','Ambulatorio')),
    capacidade_leitos INTEGER NOT NULL CHECK (capacidade_leitos >= 0)
);

-- PROCEDIMENTO (catalogo)
CREATE TABLE PROCEDIMENTO (
    id_procedimento SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    tempo_medio_minutos INTEGER NOT NULL CHECK (tempo_medio_minutos > 0),
    nivel_risco VARCHAR(10) NOT NULL DEFAULT 'BAIXO' CHECK (nivel_risco IN ('BAIXO','MEDIO','ALTO')),
    media_tempo_procedimento NUMERIC(8,2) -- vai ser usado na etapa 2 com trigger
);

-- ATENDIMENTO
CREATE TABLE ATENDIMENTO (
    id_atendimento SERIAL PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL,
    duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos > 0),
    id_paciente INTEGER NOT NULL REFERENCES PACIENTE(id_pessoa),
    id_residente INTEGER NOT NULL REFERENCES RESIDENTE(id_profissional),
    id_preceptor INTEGER NOT NULL REFERENCES PRECEPTOR(id_profissional)
);

-- PROCEDIMENTO_REALIZADO (tabela associativa)
CREATE TABLE PROCEDIMENTO_REALIZADO (
    id_atendimento INTEGER NOT NULL REFERENCES ATENDIMENTO(id_atendimento) ON DELETE CASCADE,
    id_procedimento INTEGER NOT NULL REFERENCES PROCEDIMENTO(id_procedimento),
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    tempo_real_minutos INTEGER NOT NULL CHECK (tempo_real_minutos > 0),
    observacao TEXT,
    faturado BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id_atendimento, id_procedimento)
);

-- ESCALA
CREATE TABLE ESCALA (
    id_escala SERIAL PRIMARY KEY,
    id_unidade INTEGER NOT NULL REFERENCES UNIDADE(id_unidade),
    dia_semana VARCHAR(10) NOT NULL CHECK (dia_semana IN ('Segunda','Terca','Quarta','Quinta','Sexta','Sabado','Domingo')),
    turno VARCHAR(10) NOT NULL CHECK (turno IN ('Manha','Tarde','Noite')),
    id_residente INTEGER NOT NULL REFERENCES RESIDENTE(id_profissional),
    id_preceptor INTEGER NOT NULL REFERENCES PRECEPTOR(id_profissional),
    UNIQUE (id_unidade, dia_semana, turno, id_residente)
);
