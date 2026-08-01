const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listarEvolucoesPorPaciente = async (req, res) => {
  const { pacienteId } = req.params;

  try {
    const evolucoes = await prisma.evolucao.findMany({
      where: { pacienteId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(evolucoes);
  } catch (error) {
    console.error('Erro ao listar evoluções:', error);
    res.status(500).json({ error: 'Erro ao buscar evoluções.' });
  }
};

exports.criarEvolucao = async (req, res) => {
  const { pacienteId, texto, responsavel } = req.body;

  if (!pacienteId || !texto || !String(texto).trim()) {
    return res.status(400).json({ error: 'pacienteId e texto são obrigatórios.' });
  }

  try {
    const evolucao = await prisma.evolucao.create({
      data: {
        pacienteId,
        texto: String(texto).trim(),
        responsavel: responsavel && String(responsavel).trim() ? String(responsavel).trim() : 'Dra. Yuska Maritan'
      }
    });
    res.status(201).json(evolucao);
  } catch (error) {
    console.error('Erro ao criar evolução:', error);
    res.status(500).json({ error: 'Erro ao salvar evolução.' });
  }
};
