const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ID_CONFIGURACAO = 'default';

exports.obterConfiguracao = async (req, res) => {
  try {
    let config = await prisma.configuracao.findUnique({ where: { id: ID_CONFIGURACAO } });

    if (!config) {
      config = await prisma.configuracao.create({
        data: {
          id: ID_CONFIGURACAO,
          nomeInstituicao: 'Dra. Yuska Maritan - Gestão Hospitalar',
          email: 'contato@yuskamaritan.com.br'
        }
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações.' });
  }
};

exports.atualizarConfiguracao = async (req, res) => {
  const { nomeInstituicao, email } = req.body;

  if (!nomeInstituicao || !String(nomeInstituicao).trim()) {
    return res.status(400).json({ error: 'Nome da instituição é obrigatório.' });
  }

  try {
    const config = await prisma.configuracao.upsert({
      where: { id: ID_CONFIGURACAO },
      update: {
        nomeInstituicao: String(nomeInstituicao).trim(),
        email: email ? String(email).trim() : null
      },
      create: {
        id: ID_CONFIGURACAO,
        nomeInstituicao: String(nomeInstituicao).trim(),
        email: email ? String(email).trim() : null
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    res.status(500).json({ error: 'Erro ao salvar configurações.' });
  }
};
