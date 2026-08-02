-- CreateTable
CREATE TABLE "evolucao" (
    "id_evolucao" SERIAL NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "responsavel" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evolucao_pkey" PRIMARY KEY ("id_evolucao")
);

-- AddForeignKey
ALTER TABLE "evolucao" ADD CONSTRAINT "evolucao_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_pessoa") ON DELETE CASCADE ON UPDATE CASCADE;