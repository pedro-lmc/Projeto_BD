const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function mapearUnidade(unidade) {
  const internacaoAtiva = await prisma.internacao.findFirst({
    where: { unidadeId: unidade.id, dataHoraSaida: null },
    include: { paciente: { include: { pessoa: true } } },
    orderBy: { dataHoraEntrada: 'desc' }
  });

  let status = 'LIVRE';
  if (internacaoAtiva) {
    status = 'OCUPADO';
  } else if (unidade.statusLimpeza === 'SUJO') {
    status = 'HIGIENIZACAO';
  }

  return {
    id: unidade.id,
    numero: unidade.nome,
    nome: unidade.nome,
    bloco: unidade.tipo,
    tipo: unidade.tipo,
    capacidadeLeitos: unidade.capacidadeLeitos,
    status,
    ocupados: internacaoAtiva ? 1 : 0,
    paciente: internacaoAtiva
      ? { id: internacaoAtiva.paciente.id, nome: internacaoAtiva.paciente.pessoa.nome }
      : null,
    internacaoId: internacaoAtiva ? internacaoAtiva.id : null
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

// GET /api/leitos/pacientes-disponiveis — pacientes que NÃO estão internados
// em nenhum leito no momento (usado para popular a lista de "Adicionar paciente",
// já que um paciente só pode ocupar um único leito por vez).
exports.listarPacientesDisponiveis = async (req, res) => {
  try {
    const pacientesInternados = await prisma.internacao.findMany({
      where: { dataHoraSaida: null },
      select: { pacienteId: true }
    });
    const idsIndisponiveis = pacientesInternados.map((i) => i.pacienteId);

    const pacientes = await prisma.paciente.findMany({
      where: { id: { notIn: idsIndisponiveis } },
      include: { pessoa: true },
      orderBy: { id: 'desc' }
    });

    res.json(pacientes.map((p) => ({ id: p.id, nome: p.pessoa.nome, cpf: p.pessoa.cpf })));
  } catch (error) {
    console.error('Erro ao listar pacientes disponíveis:', error);
    res.status(500).json({ error: 'Erro ao listar pacientes disponíveis.' });
  }
};

// POST /api/leitos/:id/paciente — internar um paciente no leito.
// Só é permitido quando o leito está LIVRE (nem ocupado, nem sujo).
exports.adicionarPaciente = async (req, res) => {
  const { id } = req.params;
  const { pacienteId } = req.body;

  if (!pacienteId) {
    return res.status(400).json({ error: 'pacienteId é obrigatório.' });
  }

  try {
    const unidade = await prisma.unidade.findUnique({ where: { id: Number(id) } });
    if (!unidade) {
      return res.status(404).json({ error: 'Leito não encontrado.' });
    }

    const leitoAtual = await mapearUnidade(unidade);
    if (leitoAtual.status !== 'LIVRE') {
      return res.status(409).json({ error: 'Só é possível internar um paciente em um leito livre.' });
    }

    const paciente = await prisma.paciente.findUnique({ where: { id: Number(pacienteId) } });
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    // Regra: um paciente só pode estar internado em um único leito por vez.
    const internacaoExistente = await prisma.internacao.findFirst({
      where: { pacienteId: Number(pacienteId), dataHoraSaida: null },
      include: { unidade: true }
    });
    if (internacaoExistente) {
      return res.status(409).json({
        error: `Este paciente já está internado no leito ${internacaoExistente.unidade?.nome || '#' + internacaoExistente.unidadeId}. Remova-o de lá antes de internar em outro leito.`
      });
    }

    await prisma.internacao.create({
      data: {
        pacienteId: Number(pacienteId),
        unidadeId: unidade.id,
        dataHoraEntrada: new Date(),
        dataHoraSaida: null
      }
    });

    const leitoAtualizado = await mapearUnidade(unidade);
    res.status(201).json(leitoAtualizado);
  } catch (error) {
    console.error('Erro ao internar paciente no leito:', error);
    res.status(500).json({ error: 'Erro ao internar paciente no leito.' });
  }
};

// DELETE /api/leitos/:id/paciente — dar alta/remover o paciente do leito.
// Só é permitido quando o leito está OCUPADO. Depois de remover, o leito
// fica marcado como SUJO (precisa de higienização) até alguém "limpar".
exports.removerPaciente = async (req, res) => {
  const { id } = req.params;

  try {
    const unidade = await prisma.unidade.findUnique({ where: { id: Number(id) } });
    if (!unidade) {
      return res.status(404).json({ error: 'Leito não encontrado.' });
    }

    const internacaoAtiva = await prisma.internacao.findFirst({
      where: { unidadeId: unidade.id, dataHoraSaida: null },
      orderBy: { dataHoraEntrada: 'desc' }
    });

    if (!internacaoAtiva) {
      return res.status(409).json({ error: 'Este leito não está ocupado.' });
    }

    await prisma.$transaction([
      prisma.internacao.update({
        where: { id: internacaoAtiva.id },
        data: { dataHoraSaida: new Date() }
      }),
      prisma.unidade.update({
        where: { id: unidade.id },
        data: { statusLimpeza: 'SUJO' }
      })
    ]);

    const unidadeAtualizada = await prisma.unidade.findUnique({ where: { id: unidade.id } });
    const leitoAtualizado = await mapearUnidade(unidadeAtualizada);
    res.json(leitoAtualizado);
  } catch (error) {
    console.error('Erro ao remover paciente do leito:', error);
    res.status(500).json({ error: 'Erro ao remover paciente do leito.' });
  }
};

// POST /api/leitos/:id/limpar — marca o leito como higienizado (volta a ficar LIVRE).
// Só é permitido quando o leito está em HIGIENIZACAO (sujo) e não está ocupado.
exports.limparLeito = async (req, res) => {
  const { id } = req.params;

  try {
    const unidade = await prisma.unidade.findUnique({ where: { id: Number(id) } });
    if (!unidade) {
      return res.status(404).json({ error: 'Leito não encontrado.' });
    }

    const leitoAtual = await mapearUnidade(unidade);
    if (leitoAtual.status === 'OCUPADO') {
      return res.status(409).json({ error: 'Não é possível limpar um leito ocupado.' });
    }

    await prisma.unidade.update({
      where: { id: unidade.id },
      data: { statusLimpeza: 'LIVRE' }
    });

    const unidadeAtualizada = await prisma.unidade.findUnique({ where: { id: unidade.id } });
    const leitoAtualizado = await mapearUnidade(unidadeAtualizada);
    res.json(leitoAtualizado);
  } catch (error) {
    console.error('Erro ao limpar leito:', error);
    res.status(500).json({ error: 'Erro ao limpar leito.' });
  }
};