const { getStore, saveStore } = require('../data/store');

const store = getStore();
const configuracaoEmMemoria = store.configuracao;

exports.obterConfiguracao = async (req, res) => {
  res.json(configuracaoEmMemoria);
};

exports.atualizarConfiguracao = async (req, res) => {
  const { nomeInstituicao, email } = req.body;

  if (!nomeInstituicao || !String(nomeInstituicao).trim()) {
    return res.status(400).json({ error: 'Nome da instituição é obrigatório.' });
  }

  configuracaoEmMemoria.nomeInstituicao = String(nomeInstituicao).trim();
  configuracaoEmMemoria.email = email ? String(email).trim() : null;

  saveStore();
  res.json(configuracaoEmMemoria);
};
