const { getStore, saveStore } = require('../data/store');

const store = getStore();
const evolucoesEmMemoria = store.evolucoes;

exports.listarEvolucoesPorPaciente = async (req, res) => {
  const { pacienteId } = req.params;

  const evolucoes = evolucoesEmMemoria
    .filter((item) => String(item.pacienteId) === String(pacienteId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(evolucoes);
};

exports.criarEvolucao = async (req, res) => {
  const { pacienteId, texto, responsavel } = req.body;

  if (!pacienteId || !texto || !String(texto).trim()) {
    return res.status(400).json({ error: 'pacienteId e texto são obrigatórios.' });
  }

  const evolucao = {
    id: Date.now(),
    pacienteId: Number(pacienteId),
    texto: String(texto).trim(),
    responsavel: responsavel && String(responsavel).trim() ? String(responsavel).trim() : 'Dra. Yuska Maritan',
    createdAt: new Date().toISOString()
  };

  evolucoesEmMemoria.push(evolucao);
  saveStore();
  res.status(201).json(evolucao);
};
