-- AlterTable
ALTER TABLE "atendimento" ADD COLUMN     "convenio" VARCHAR(50),
ADD COLUMN     "especialidade" VARCHAR(100),
ADD COLUMN     "hora" VARCHAR(5),
ADD COLUMN     "medico_nome" VARCHAR(150),
ADD COLUMN     "observacao" TEXT;
