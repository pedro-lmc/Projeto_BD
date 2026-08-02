/*
  Warnings:

  - You are about to drop the `Atendimento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Configuracao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Evolucao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Leito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Medico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Paciente` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Atendimento" DROP CONSTRAINT "Atendimento_medicoId_fkey";

-- DropForeignKey
ALTER TABLE "Atendimento" DROP CONSTRAINT "Atendimento_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "Evolucao" DROP CONSTRAINT "Evolucao_pacienteId_fkey";

-- DropTable
DROP TABLE "Atendimento";

-- DropTable
DROP TABLE "Configuracao";

-- DropTable
DROP TABLE "Evolucao";

-- DropTable
DROP TABLE "Leito";

-- DropTable
DROP TABLE "Medico";

-- DropTable
DROP TABLE "Paciente";

-- CreateTable
CREATE TABLE "pessoa" (
    "id_pessoa" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "cpf" CHAR(11) NOT NULL,
    "data_nascimento" DATE NOT NULL,
    "is_flamengo" BOOLEAN NOT NULL DEFAULT false,
    "telefone" VARCHAR(20),
    "endereco" VARCHAR(200),

    CONSTRAINT "pessoa_pkey" PRIMARY KEY ("id_pessoa")
);

-- CreateTable
CREATE TABLE "paciente" (
    "id_pessoa" INTEGER NOT NULL,
    "num_convenio" VARCHAR(50),
    "alergias" TEXT,
    "grupo_sanguineo" VARCHAR(3),

    CONSTRAINT "paciente_pkey" PRIMARY KEY ("id_pessoa")
);

-- CreateTable
CREATE TABLE "profissional" (
    "id_pessoa" INTEGER NOT NULL,
    "crm" VARCHAR(30) NOT NULL,
    "data_admissao" DATE NOT NULL,
    "especialidade" VARCHAR(100) NOT NULL,

    CONSTRAINT "profissional_pkey" PRIMARY KEY ("id_pessoa")
);

-- CreateTable
CREATE TABLE "preceptor" (
    "id_profissional" INTEGER NOT NULL,
    "titulacao" VARCHAR(50) NOT NULL,

    CONSTRAINT "preceptor_pkey" PRIMARY KEY ("id_profissional")
);

-- CreateTable
CREATE TABLE "residente" (
    "id_profissional" INTEGER NOT NULL,
    "ano_residencia" VARCHAR(2) NOT NULL,

    CONSTRAINT "residente_pkey" PRIMARY KEY ("id_profissional")
);

-- CreateTable
CREATE TABLE "unidade" (
    "id_unidade" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "capacidade_leitos" INTEGER,

    CONSTRAINT "unidade_pkey" PRIMARY KEY ("id_unidade")
);

-- CreateTable
CREATE TABLE "atendimento" (
    "id_atendimento" SERIAL NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "duracao_minutos" INTEGER NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "id_residente" INTEGER NOT NULL,
    "id_preceptor" INTEGER NOT NULL,

    CONSTRAINT "atendimento_pkey" PRIMARY KEY ("id_atendimento")
);

-- CreateTable
CREATE TABLE "procedimento" (
    "id_procedimento" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "tempo_medio_minutos" INTEGER NOT NULL,
    "nivel_risco" VARCHAR(10) NOT NULL DEFAULT 'BAIXO',
    "media_tempo_procedimento" DOUBLE PRECISION,

    CONSTRAINT "procedimento_pkey" PRIMARY KEY ("id_procedimento")
);

-- CreateTable
CREATE TABLE "procedimento_realizado" (
    "id_atendimento" INTEGER NOT NULL,
    "id_procedimento" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "tempo_real_minutos" INTEGER NOT NULL,
    "observacao" TEXT,
    "faturado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "procedimento_realizado_pkey" PRIMARY KEY ("id_atendimento","id_procedimento")
);

-- CreateTable
CREATE TABLE "escala" (
    "id_escala" SERIAL NOT NULL,
    "id_unidade" INTEGER NOT NULL,
    "dia_semana" VARCHAR(10) NOT NULL,
    "turno" VARCHAR(10) NOT NULL,
    "id_residente" INTEGER NOT NULL,
    "id_preceptor" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "escala_pkey" PRIMARY KEY ("id_escala")
);

-- CreateTable
CREATE TABLE "internacao" (
    "id_internacao" SERIAL NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "id_unidade" INTEGER,
    "data_hora_entrada" TIMESTAMP(3) NOT NULL,
    "data_hora_saida" TIMESTAMP(3),

    CONSTRAINT "internacao_pkey" PRIMARY KEY ("id_internacao")
);

-- CreateTable
CREATE TABLE "auditoria_atendimento" (
    "id_auditoria" SERIAL NOT NULL,
    "id_atendimento" INTEGER,
    "operacao" VARCHAR(10) NOT NULL,
    "usuario" VARCHAR(100),
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dados_antigos" JSONB,
    "dados_novos" JSONB,

    CONSTRAINT "auditoria_atendimento_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateIndex
CREATE UNIQUE INDEX "pessoa_cpf_key" ON "pessoa"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "profissional_crm_key" ON "profissional"("crm");

-- CreateIndex
CREATE UNIQUE INDEX "procedimento_codigo_key" ON "procedimento"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "escala_id_unidade_dia_semana_turno_id_residente_key" ON "escala"("id_unidade", "dia_semana", "turno", "id_residente");

-- AddForeignKey
ALTER TABLE "paciente" ADD CONSTRAINT "paciente_id_pessoa_fkey" FOREIGN KEY ("id_pessoa") REFERENCES "pessoa"("id_pessoa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissional" ADD CONSTRAINT "profissional_id_pessoa_fkey" FOREIGN KEY ("id_pessoa") REFERENCES "pessoa"("id_pessoa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preceptor" ADD CONSTRAINT "preceptor_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissional"("id_pessoa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residente" ADD CONSTRAINT "residente_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissional"("id_pessoa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento" ADD CONSTRAINT "atendimento_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_pessoa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento" ADD CONSTRAINT "atendimento_id_residente_fkey" FOREIGN KEY ("id_residente") REFERENCES "residente"("id_profissional") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento" ADD CONSTRAINT "atendimento_id_preceptor_fkey" FOREIGN KEY ("id_preceptor") REFERENCES "preceptor"("id_profissional") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedimento_realizado" ADD CONSTRAINT "procedimento_realizado_id_atendimento_fkey" FOREIGN KEY ("id_atendimento") REFERENCES "atendimento"("id_atendimento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedimento_realizado" ADD CONSTRAINT "procedimento_realizado_id_procedimento_fkey" FOREIGN KEY ("id_procedimento") REFERENCES "procedimento"("id_procedimento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala" ADD CONSTRAINT "escala_id_unidade_fkey" FOREIGN KEY ("id_unidade") REFERENCES "unidade"("id_unidade") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala" ADD CONSTRAINT "escala_id_residente_fkey" FOREIGN KEY ("id_residente") REFERENCES "residente"("id_profissional") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala" ADD CONSTRAINT "escala_id_preceptor_fkey" FOREIGN KEY ("id_preceptor") REFERENCES "preceptor"("id_profissional") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internacao" ADD CONSTRAINT "internacao_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_pessoa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internacao" ADD CONSTRAINT "internacao_id_unidade_fkey" FOREIGN KEY ("id_unidade") REFERENCES "unidade"("id_unidade") ON DELETE SET NULL ON UPDATE CASCADE;
