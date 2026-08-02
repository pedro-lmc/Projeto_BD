const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.listarEvolucoesPorPaciente = async (req, res) => {
  const { pacienteId } = req.params;

  try {
    const [atendimentos, evolucoesRegistradas] = await Promise.all([
      prisma.atendimento.findMany({
        where: { pacienteId: Number(pacienteId) },
        include: {
          preceptor: { include: { profissional: { include: { pessoa: true } } } },
          procedimentosRealizados: { include: { procedimento: true } }
        },
        orderBy: { dataHora: 'desc' }
      }),
      prisma.evolucao.findMany({
        where: { pacienteId: Number(pacienteId) },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const evolucoesDeAtendimento = atendimentos.map((atendimento) => ({
      id: `atendimento-${atendimento.id}`,
      pacienteId: atendimento.pacienteId,
      texto: atendimento.procedimentosRealizados?.length
        ? `Atendimento com ${atendimento.procedimentosRealizados.length} procedimento(s) registrado(s).`
        : 'Atendimento registrado no sistema.',
      responsavel: atendimento.preceptor?.profissional?.pessoa?.nome || 'Equipe médica',
      createdAt: atendimento.dataHora
    }));

    const evolucoesManuais = evolucoesRegistradas.map((ev) => ({
      id: `evolucao-${ev.id}`,
      pacienteId: ev.pacienteId,
      texto: ev.texto,
      responsavel: ev.responsavel,
      createdAt: ev.createdAt
    }));

    const evolucoes = [...evolucoesManuais, ...evolucoesDeAtendimento].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

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
    const paciente = await prisma.paciente.findUnique({ where: { id: Number(pacienteId) } });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    const evolucaoCriada = await prisma.evolucao.create({
      data: {
        pacienteId: Number(pacienteId),
        texto: String(texto).trim(),
        responsavel: responsavel && String(responsavel).trim() ? String(responsavel).trim() : 'Dra. Yuska Maritan'
      }
    });

    res.status(201).json({
      id: `evolucao-${evolucaoCriada.id}`,
      pacienteId: evolucaoCriada.pacienteId,
      texto: evolucaoCriada.texto,
      responsavel: evolucaoCriada.responsavel,
      createdAt: evolucaoCriada.createdAt
    });
  } catch (error) {
    console.error('Erro ao criar evolução:', error);
    res.status(500).json({ error: 'Erro ao criar evolução.' });
  }
};