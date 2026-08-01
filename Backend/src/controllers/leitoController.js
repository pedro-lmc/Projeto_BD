const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Estrutura real dos 20 leitos do hospital, divididos em 4 blocos de 5
const BLOCOS = [
  { prefixo: 'UTI', bloco: 'UTI Adulto', quantidade: 5 },
  { prefixo: 'ENF-F', bloco: 'Enfermaria Feminina', quantidade: 5 },
  { prefixo: 'ENF-M', bloco: 'Enfermaria Masculina', quantidade: 5 },
  { prefixo: 'PED', bloco: 'Pediatria', quantidade: 5 }
];

// Distribuição alvo dentro do total de 20: 11 ocupados, 6 livres, 3 em higienização
const STATUS_SEQUENCIA = [
  'OCUPADO', 'OCUPADO', 'OCUPADO', 'OCUPADO', 'OCUPADO',
  'OCUPADO', 'OCUPADO', 'OCUPADO', 'OCUPADO', 'OCUPADO', 'OCUPADO',
  'LIVRE', 'LIVRE', 'LIVRE', 'LIVRE', 'LIVRE', 'LIVRE',
  'HIGIENIZACAO', 'HIGIENIZACAO', 'HIGIENIZACAO'
];

async function seedLeitosSeNecessario() {
  const total = await prisma.leito.count();
  if (total > 0) return;

  let contador = 0;
  const leitosParaCriar = [];

  for (const grupo of BLOCOS) {
    for (let i = 1; i <= grupo.quantidade; i++) {
      leitosParaCriar.push({
        numero: `${grupo.prefixo}-${String(i).padStart(2, '0')}`,
        bloco: grupo.bloco,
        status: STATUS_SEQUENCIA[contador] || 'LIVRE'
      });
      contador++;
    }
  }

  await prisma.leito.createMany({ data: leitosParaCriar });
}

exports.listarLeitos = async (req, res) => {
  try {
    await seedLeitosSeNecessario();
    const leitos = await prisma.leito.findMany({ orderBy: { numero: 'asc' } });
    res.json(leitos);
  } catch (error) {
    console.error('Erro ao listar leitos:', error);
    res.status(500).json({ error: 'Erro ao buscar leitos.' });
  }
};

exports.atualizarStatusLeito = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const atualizado = await prisma.leito.update({
      where: { id },
      data: { status }
    });
    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar leito:', error);
    res.status(500).json({ error: 'Erro ao atualizar leito.' });
  }
};
