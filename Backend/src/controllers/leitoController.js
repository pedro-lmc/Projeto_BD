const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function mapearUnidade(unidade) {
  const ocupados = await prisma.internacao.count({
    where: {
      unidadeId: unidade.id,
      dataHoraSaida: null
    }
  });

  return {
    id: unidade.id,
    numero: unidade.nome,
    nome: unidade.nome,
    bloco: unidade.tipo,
    tipo: unidade.tipo,
    capacidadeLeitos: unidade.capacidadeLeitos,
    status: ocupados > 0 ? 'OCUPADO' : 'LIVRE',
    ocupados
  };
}

exports.listarLeitos = async (req, res) => {
  try {
    // capacidadeLeitos = 1 identifica os leitos individuais nomeados
    // (as unidades "guarda-chuva", como UTI Adulto, têm capacidade > 1
    // e não devem aparecer como leitos avulsos na grade)
    const unidades = await prisma.unidade.findMany({
      where: { capacidadeLeitos: 1 },
      orderBy: { id: 'asc' }
    });
    const leitos = await Promise.all(unidades.map(mapearUnidade));
    res.json(leitos);
  } catch (error) {
    console.error('Erro ao listar leitos:', error);
    res.status(500).json({ error: 'Erro ao listar leitos.' });
  }
};

exports.atualizarStatusLeito = async (req, res) => {
  const { id } = req.params;

  try {
    const unidade = await prisma.unidade.findUnique({ where: { id: Number(id) } });

    if (!unidade) {
      return res.status(404).json({ error: 'Leito não encontrado.' });
    }

    const leito = await mapearUnidade(unidade);
    leito.status = req.body.status || leito.status;
    res.json(leito);
  } catch (error) {
    console.error('Erro ao atualizar status do leito:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do leito.' });
  }
};