// ============================================================================
// ETAPA 2 — Consultas avançadas via ORM (Prisma), usando a DSL do Prisma
// (não SQL cru), conforme exigido no item 5 do enunciado.
// Rodar com: node src/orm/consultasAvancadas.js
// ============================================================================
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 5.1 Preceptores que supervisionaram residentes que atenderam pacientes
// flamenguistas (is_flamengo = TRUE).
async function preceptoresDeAtendimentosFlamenguistas() {
  const atendimentos = await prisma.atendimento.findMany({
    where: { paciente: { pessoa: { isFlamengo: true } } },
    include: {
      preceptor: { include: { profissional: { include: { pessoa: true } } } },
    },
  });

  const preceptoresUnicos = new Map();
  for (const a of atendimentos) {
    const pessoa = a.preceptor.profissional.pessoa;
    preceptoresUnicos.set(pessoa.id, pessoa.nome);
  }
  return [...preceptoresUnicos.entries()].map(([id, nome]) => ({ id, nome }));
}

// 5.2 Para cada paciente, seu último atendimento (data_hora, residente,
// preceptor, lista de procedimentos).
async function ultimoAtendimentoPorPaciente() {
  const pacientes = await prisma.paciente.findMany({
    include: { pessoa: true },
  });

  const resultado = [];
  for (const paciente of pacientes) {
    const ultimo = await prisma.atendimento.findFirst({
      where: { pacienteId: paciente.id },
      orderBy: { dataHora: 'desc' },
      include: {
        residente: { include: { profissional: { include: { pessoa: true } } } },
        preceptor: { include: { profissional: { include: { pessoa: true } } } },
        procedimentosRealizados: { include: { procedimento: true } },
      },
    });

    resultado.push({
      paciente: paciente.pessoa.nome,
      ultimoAtendimento: ultimo
        ? {
            dataHora: ultimo.dataHora,
            residente: ultimo.residente.profissional.pessoa.nome,
            preceptor: ultimo.preceptor.profissional.pessoa.nome,
            procedimentos: ultimo.procedimentosRealizados.map((pr) => pr.procedimento.nome),
          }
        : null,
    });
  }
  return resultado;
}

// 5.3 Percentual de procedimentos de alto risco realizados por cada residente.
async function percentualAltoRiscoPorResidente() {
  const residentes = await prisma.residente.findMany({
    include: { profissional: { include: { pessoa: true } } },
  });

  const resultado = [];
  for (const residente of residentes) {
    const total = await prisma.procedimentoRealizado.count({
      where: { atendimento: { residenteId: residente.id } },
    });
    const altoRisco = await prisma.procedimentoRealizado.count({
      where: {
        atendimento: { residenteId: residente.id },
        procedimento: { nivelRisco: 'ALTO' },
      },
    });

    resultado.push({
      residente: residente.profissional.pessoa.nome,
      totalProcedimentos: total,
      procedimentosAltoRisco: altoRisco,
      percentualAltoRisco: total > 0 ? Number(((altoRisco / total) * 100).toFixed(2)) : 0,
    });
  }
  return resultado;
}

async function main() {
  console.log('--- Preceptores que supervisionaram atendimentos a flamenguistas ---');
  console.log(await preceptoresDeAtendimentosFlamenguistas());

  console.log('\n--- Último atendimento por paciente ---');
  console.log(JSON.stringify(await ultimoAtendimentoPorPaciente(), null, 2));

  console.log('\n--- % de procedimentos de alto risco por residente ---');
  console.log(await percentualAltoRiscoPorResidente());
}

if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = {
  preceptoresDeAtendimentosFlamenguistas,
  ultimoAtendimentoPorPaciente,
  percentualAltoRiscoPorResidente,
};
