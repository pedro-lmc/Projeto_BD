// ============================================================================
// Demonstração de concorrência para escalas de plantão.
// O exemplo executa duas atualizações concorrentes sobre a mesma escala,
// usando lock otimista por versão para evitar inconsistências.
// ============================================================================
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarEscalaBase() {
  const unidade = await prisma.unidade.findFirst();
  const residente = await prisma.residente.findFirst();
  const preceptor = await prisma.preceptor.findFirst();

  if (!unidade || !residente || !preceptor) {
    throw new Error('Rode o seed antes (npm run db:seed) — faltam dados base.');
  }

  // remove a escala anterior, se existir, para manter o cenário reproduzível
  await prisma.escala.deleteMany({
    where: { unidadeId: unidade.id, diaSemana: 'sabado', turno: 'noite', residenteId: residente.id },
  });

  const escala = await prisma.escala.create({
    data: {
      unidadeId: unidade.id,
      diaSemana: 'sabado',
      turno: 'noite',
      residenteId: residente.id,
      preceptorId: preceptor.id,
      version: 0,
    },
  });
  return escala;
}

// Cada "transação" lê a escala, espera um pouco (simulando processamento),
// e tenta atualizar condicionando ao `version` lido. Quem perde a corrida
// recebe count = 0 no updateMany e sabe que precisa tentar de novo.
async function tentarAtualizarComLockOtimista(nomeTransacao, escalaId, delayMs) {
  const escalaLida = await prisma.escala.findUnique({ where: { id: escalaId } });
  console.log(`[${nomeTransacao}] leu escala id=${escalaId} version=${escalaLida.version}`);

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const resultado = await prisma.escala.updateMany({
    where: { id: escalaId, version: escalaLida.version },
    data: { turno: 'manha', version: { increment: 1 } },
  });

  if (resultado.count === 1) {
    console.log(`[${nomeTransacao}] SUCESSO — atualizou a escala (version ${escalaLida.version} -> ${escalaLida.version + 1})`);
    return true;
  } else {
    console.log(`[${nomeTransacao}] CONFLITO — version mudou entre leitura e escrita, atualização rejeitada`);
    return false;
  }
}

async function main() {
  const escala = await criarEscalaBase();
  console.log(`Escala criada: id=${escala.id} (unidade=${escala.unidadeId}, residente=${escala.residenteId})`);

  // Dispara as duas "transações" concorrentes contra a MESMA escala.
  // Transação A lê e espera 300ms antes de gravar; Transação B lê quase
  // junto mas grava mais rápido (100ms) — logo B vence a corrida e A falha
  // o updateMany por version desatualizada, evitando inconsistência.
  const [resultadoA, resultadoB] = await Promise.all([
    tentarAtualizarComLockOtimista('Transacao A', escala.id, 300),
    tentarAtualizarComLockOtimista('Transacao B', escala.id, 100),
  ]);

  console.log('\nResultado final:', { A: resultadoA, B: resultadoB });
  console.log('Apenas uma atualização deve ser aceita, comprovando que o lock otimista evitou uma escrita simultânea inconsistente.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
