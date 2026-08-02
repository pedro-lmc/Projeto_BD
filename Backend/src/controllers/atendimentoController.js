const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function formatarHora(dataHora) {
  return new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function mapearAtendimento(item) {
  return {
    id: item.id,
    hora: item.hora || formatarHora(item.dataHora),
    paciente: item.paciente?.pessoa?.nome || 'Paciente sem nome',
    medico: item.preceptor?.profissional?.pessoa?.nome || item.residente?.profissional?.pessoa?.nome || 'Dra. Yuska Maritan',
    tipo: item.procedimentosRealizados?.[0]?.procedimento?.nome || 'Consulta',
    status: 'AGUARDANDO',
    dataHora: item.dataHora,
    especialidade: item.residente?.profissional?.especialidade || 'Cardiologia',
    convenio: item.paciente?.numConvenio || 'Unimed',
    observacao: item.observacao || 'Consulta agendada para avaliação clínica.'
  };
}

exports.listarAtendimentos = async (req, res) => {
  try {
    const atendimentos = await prisma.atendimento.findMany({
      include: {
        paciente: { include: { pessoa: true } },
        residente: { include: { profissional: { include: { pessoa: true } } } },
        preceptor: { include: { profissional: { include: { pessoa: true } } } },
        procedimentosRealizados: { include: { procedimento: true } }
      },
      orderBy: { dataHora: 'desc' }
    });

    res.json(atendimentos.map(mapearAtendimento));
  } catch (error) {
    console.error('Erro ao listar atendimentos:', error);
    res.status(500).json({ error: 'Erro ao listar atendimentos.' });
  }
};

exports.criarAtendimento = async (req, res) => {
  try {
    const { dataHora, duracaoMinutos, procedimentos, pacienteId: pacienteIdBody, residenteId: residenteIdBody, preceptorId: preceptorIdBody } = req.body;

    let pacienteId = Number(pacienteIdBody || req.body.paciente?.id || req.body.paciente_id || 0);
    let residenteId = Number(residenteIdBody || req.body.residente?.id || req.body.residente_id || 0);
    let preceptorId = Number(preceptorIdBody || req.body.preceptor?.id || req.body.preceptor_id || 0);

    if (!pacienteId) {
      const pacienteFallback = await prisma.paciente.findFirst({ include: { pessoa: true } });
      if (!pacienteFallback) {
        return res.status(404).json({ error: 'Nenhum paciente encontrado para vincular ao atendimento.' });
      }
      pacienteId = pacienteFallback.id;
    }

    if (!residenteId) {
      const residenteFallback = await prisma.residente.findFirst({ include: { profissional: { include: { pessoa: true } } } });
      if (!residenteFallback) {
        return res.status(404).json({ error: 'Nenhum residente encontrado para vincular ao atendimento.' });
      }
      residenteId = residenteFallback.id;
    }

    if (!preceptorId) {
      const preceptorFallback = await prisma.preceptor.findFirst({ include: { profissional: { include: { pessoa: true } } } });
      if (!preceptorFallback) {
        return res.status(404).json({ error: 'Nenhum preceptor encontrado para vincular ao atendimento.' });
      }
      preceptorId = preceptorFallback.id;
    }

    const atendimentoCriado = await prisma.atendimento.create({
      data: {
        dataHora: dataHora ? new Date(dataHora) : new Date(),
        duracaoMinutos: Number(duracaoMinutos || 20),
        pacienteId,
        residenteId,
        preceptorId,
        procedimentosRealizados: Array.isArray(procedimentos) && procedimentos.length > 0
          ? {
              create: procedimentos.map((procedimento) => ({
                procedimentoId: Number(procedimento.procedimentoId || procedimento.id || 1),
                quantidade: Number(procedimento.quantidade || 1),
                tempoRealMinutos: Number(procedimento.tempoRealMinutos || procedimento.tempoReal || 10),
                observacao: procedimento.observacao || null,
                horaInicio: procedimento.horaInicio ? new Date(procedimento.horaInicio) : null
              }))
            }
          : undefined
      },
      include: {
        paciente: { include: { pessoa: true } },
        residente: { include: { profissional: { include: { pessoa: true } } } },
        preceptor: { include: { profissional: { include: { pessoa: true } } } },
        procedimentosRealizados: { include: { procedimento: true } }
      }
    });

    res.status(201).json(mapearAtendimento(atendimentoCriado));
  } catch (error) {
    console.error('Erro ao criar atendimento:', error);
    res.status(400).json({ error: 'Erro ao criar atendimento.' });
  }
};

exports.atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const atendimento = await prisma.atendimento.findUnique({
      where: { id: Number(id) },
      include: {
        paciente: { include: { pessoa: true } },
        residente: { include: { profissional: { include: { pessoa: true } } } },
        preceptor: { include: { profissional: { include: { pessoa: true } } } },
        procedimentosRealizados: { include: { procedimento: true } }
      }
    });

    if (!atendimento) {
      return res.status(404).json({ error: 'Atendimento não encontrado.' });
    }

    const atendimentoAtualizado = {
      ...atendimento,
      status: status || 'AGUARDANDO'
    };

    res.json(mapearAtendimento(atendimentoAtualizado));
  } catch (error) {
    console.error('Erro ao atualizar status do atendimento:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do atendimento.' });
  }
};

exports.excluirAtendimento = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.atendimento.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir atendimento:', error);
    res.status(404).json({ error: 'Atendimento não encontrado.' });
  }
};