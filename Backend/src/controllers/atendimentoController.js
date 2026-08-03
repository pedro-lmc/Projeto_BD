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
    medico: item.medicoNome
      || item.preceptor?.profissional?.pessoa?.nome
      || item.residente?.profissional?.pessoa?.nome
      || 'Dra. Yuska Maritan',
    tipo: item.procedimentosRealizados?.[0]?.procedimento?.nome || 'Consulta',
    status: item.status || 'AGUARDANDO',
    dataHora: item.dataHora,
    especialidade: item.especialidade || item.residente?.profissional?.especialidade || 'Cardiologia',
    convenio: item.convenio || item.paciente?.numConvenio || 'Unimed',
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
    const {
      dataHora,
      duracaoMinutos,
      procedimentos,
      pacienteId: pacienteIdBody,
      residenteId: residenteIdBody,
      preceptorId: preceptorIdBody,
      paciente: pacienteNome,
      medico,
      especialidade,
      convenio,
      hora,
      observacao,
      status
    } = req.body;

    let pacienteId = Number(pacienteIdBody || req.body.paciente?.id || req.body.paciente_id || 0);

    // Se não veio um pacienteId explícito, tenta localizar o paciente pelo nome
    // digitado/selecionado no formulário da agenda. Antes, quando nada disso era
    // enviado, o sistema caía sempre no "primeiro paciente do banco" — que era
    // exatamente o bug de trocar o nome da pessoa agendada.
    if (!pacienteId && pacienteNome) {
      const nomeBuscado = String(pacienteNome).trim();
      const pacienteEncontrado = await prisma.paciente.findFirst({
        where: { pessoa: { nome: { equals: nomeBuscado, mode: 'insensitive' } } },
        include: { pessoa: true }
      });

      if (!pacienteEncontrado) {
        return res.status(404).json({
          error: `Paciente "${nomeBuscado}" não encontrado. Cadastre-o na aba Pacientes antes de agendar a consulta.`
        });
      }

      pacienteId = pacienteEncontrado.id;
    }

    if (!pacienteId) {
      return res.status(400).json({ error: 'Informe o paciente (pacienteId ou nome já cadastrado) para o agendamento.' });
    }

    const pacienteExiste = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    if (!pacienteExiste) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    let residenteId = Number(residenteIdBody || req.body.residente?.id || req.body.residente_id || 0);
    let preceptorId = Number(preceptorIdBody || req.body.preceptor?.id || req.body.preceptor_id || 0);

    // A modelagem exige um residente e um preceptor responsáveis pelo atendimento.
    // O formulário simplificado da agenda só pede o nome do médico em texto livre,
    // então mantemos o vínculo técnico com o primeiro residente/preceptor
    // cadastrados — isso não afeta mais o nome exibido, que agora vem de "medico".
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

    // Monta a data/hora real do atendimento a partir do horário escolhido no
    // formulário. Antes, quando "dataHora" não vinha no corpo da requisição
    // (o que sempre acontecia, já que a agenda só envia "hora"), o campo
    // simplesmente virava "new Date()" — ou seja, sempre o horário atual,
    // ignorando o que a pessoa tinha escolhido no campo de horário.
    let dataHoraFinal;
    if (dataHora) {
      dataHoraFinal = new Date(dataHora);
    } else if (hora) {
      const hoje = new Date();
      const [horas, minutos] = String(hora).split(':').map(Number);
      dataHoraFinal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), horas || 0, minutos || 0, 0);
    } else {
      dataHoraFinal = new Date();
    }

    const atendimentoCriado = await prisma.atendimento.create({
      data: {
        dataHora: dataHoraFinal,
        duracaoMinutos: Number(duracaoMinutos || 20),
        status: status || 'AGUARDANDO',
        pacienteId,
        residenteId,
        preceptorId,
        medicoNome: medico ? String(medico).trim() : null,
        especialidade: especialidade ? String(especialidade).trim() : null,
        convenio: convenio ? String(convenio).trim() : null,
        observacao: observacao ? String(observacao).trim() : null,
        hora: hora || null,
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

const STATUS_VALIDOS = ['AGUARDANDO', 'EM_ATENDIMENTO', 'CONCLUIDO'];

exports.atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Use um dos: ${STATUS_VALIDOS.join(', ')}.` });
  }

  try {
    const atendimentoExistente = await prisma.atendimento.findUnique({ where: { id: Number(id) } });

    if (!atendimentoExistente) {
      return res.status(404).json({ error: 'Atendimento não encontrado.' });
    }

    const atendimentoAtualizado = await prisma.atendimento.update({
      where: { id: Number(id) },
      data: { status: status || atendimentoExistente.status },
      include: {
        paciente: { include: { pessoa: true } },
        residente: { include: { profissional: { include: { pessoa: true } } } },
        preceptor: { include: { profissional: { include: { pessoa: true } } } },
        procedimentosRealizados: { include: { procedimento: true } }
      }
    });

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