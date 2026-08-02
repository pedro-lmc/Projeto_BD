const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.listarEvolucoesPorPaciente = async (req, res) => {
  const { pacienteId } = req.params;

  try {
    const atendimentos = await prisma.atendimento.findMany({
      where: { pacienteId: Number(pacienteId) },
      include: {
        preceptor: { include: { profissional: { include: { pessoa: true } } } },
        procedimentosRealizados: { include: { procedimento: true } }
      },
      orderBy: { dataHora: 'desc' }
    });

    const evolucoes = atendimentos.map((atendimento) => ({
      id: atendimento.id,
      pacienteId: atendimento.pacienteId,
      texto: atendimento.procedimentosRealizados?.length
        ? `Atendimento com ${atendimento.procedimentosRealizados.length} procedimento(s) registrado(s).`
        : 'Atendimento registrado no sistema.',
      responsavel: atendimento.preceptor?.profissional?.pessoa?.nome || 'Equipe médica',
      createdAt: atendimento.dataHora
    }));

    res.json(evolucoes);
  } catch (error) {
    console.error('Erro ao listar evoluções:', error);
    res.status(500).json({ error: 'Erro ao listar evoluções.' });
  }
};

exports.criarEvolucao = async (req, res) => {
  const { pacienteId, texto, responsavel } = req.body;

  if (!pacienteId || !texto || !String(texto).trim()) {
    return res.status(400).json({ error: 'pacienteId e texto são obrigatórios.' });
  }

  try {
    const paciente = await prisma.paciente.findUnique({ where: { id: Number(pacienteId) }, include: { pessoa: true } });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    const evolucao = {
      id: Date.now(),
      pacienteId: Number(pacienteId),
      texto: String(texto).trim(),
      responsavel: responsavel && String(responsavel).trim() ? String(responsavel).trim() : 'Dra. Yuska Maritan',
      createdAt: new Date().toISOString(),
      origem: 'atendimento'
    };

    res.status(201).json(evolucao);
  } catch (error) {
    console.error('Erro ao criar evolução:', error);
    res.status(500).json({ error: 'Erro ao criar evolução.' });
  }
};
