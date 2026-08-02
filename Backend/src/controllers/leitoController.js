const { getStore, saveStore } = require('../data/store');

const store = getStore();
const leitosEmMemoria = store.leitos;

exports.listarLeitos = async (req, res) => {
  res.json(leitosEmMemoria);
};

exports.atualizarStatusLeito = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const leito = leitosEmMemoria.find((item) => item.id === id || item.numero === id);

  if (!leito) {
    return res.status(404).json({ error: 'Leito não encontrado.' });
  }

  leito.status = status;
  saveStore();
  res.json(leito);
};
