const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function normalizarAlergias(alergias) {
  if (Array.isArray(alergias)) {
    return alergias.map((item) => String(item).trim()).filter(Boolean).join(', ');
  }

  if (typeof alergias === 'string') {
    return alergias
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .join(', ');
  }

  return null;
}

function mapearPaciente(item) {
  return {
    id: item.id,
    nome: item.pessoa?.nome || item.nome,
    cpf: item.pessoa?.cpf || item.cpf,
    dataNascimento: item.pessoa?.dataNascimento ? new Date(item.pessoa.dataNascimento).toISOString() : item.dataNascimento,
    telefone: item.pessoa?.telefone || item.telefone,
    tipoSanguineo: item.grupoSanguineo || item.tipoSanguineo || null,
    alergias: item.alergias || '',
    atendimentos: item.atendimentos || [],
    createdAt: item.createdAt || new Date().toISOString()
  };
}

exports.listarPacientes = async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      include: { pessoa: true },
      orderBy: { pessoa: { nome: 'asc' } }
    });

    res.json(pacientes.map(mapearPaciente));
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    res.status(500).json({ error: 'Erro ao listar pacientes.' });
  }
};

exports.criarPaciente = async (req, res) => {
  try {
    const { nome, cpf, dataNascimento, tipoSanguineo, alergias, telefone, numConvenio, isFlamengo } = req.body;

    if (!nome || !cpf || !dataNascimento || !telefone) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome, cpf, dataNascimento e telefone.'
      });
    }

    const nascimento = new Date(dataNascimento);

    if (Number.isNaN(nascimento.getTime())) {
      return res.status(400).json({ error: 'dataNascimento inválida.' });
    }

    const novoPaciente = await prisma.paciente.create({
      data: {
        pessoa: {
          create: {
            nome: String(nome).trim(),
            cpf: String(cpf).trim(),
            dataNascimento: nascimento,
            isFlamengo: Boolean(isFlamengo),
            telefone: String(telefone).trim()
          }
        },
        numConvenio: numConvenio ? String(numConvenio).trim() : null,
        alergias: normalizarAlergias(alergias),
        grupoSanguineo: tipoSanguineo ? String(tipoSanguineo).trim() : null
      },
      include: { pessoa: true }
    });

    res.status(201).json(mapearPaciente(novoPaciente));
  } catch (error) {
    console.error('Erro ao cadastrar paciente:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe um paciente cadastrado com este CPF.' });
    }
    res.status(400).json({ error: 'Erro ao cadastrar paciente.' });
  }
};

exports.atualizarPaciente = async (req, res) => {
  const { id } = req.params;
  const { nome, cpf, dataNascimento, tipoSanguineo, alergias, telefone, numConvenio, isFlamengo } = req.body;

  try {
    const pacienteExistente = await prisma.paciente.findUnique({ where: { id: Number(id) } });

    if (!pacienteExistente) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    let nascimento;
    if (dataNascimento) {
      nascimento = new Date(dataNascimento);
      if (Number.isNaN(nascimento.getTime())) {
        return res.status(400).json({ error: 'dataNascimento inválida.' });
      }
    }

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id: Number(id) },
      data: {
        pessoa: {
          update: {
            ...(nome ? { nome: String(nome).trim() } : {}),
            ...(cpf ? { cpf: String(cpf).trim() } : {}),
            ...(nascimento ? { dataNascimento: nascimento } : {}),
            ...(telefone ? { telefone: String(telefone).trim() } : {}),
            ...(isFlamengo !== undefined ? { isFlamengo: Boolean(isFlamengo) } : {})
          }
        },
        ...(numConvenio !== undefined ? { numConvenio: numConvenio ? String(numConvenio).trim() : null } : {}),
        ...(alergias !== undefined ? { alergias: normalizarAlergias(alergias) } : {}),
        ...(tipoSanguineo !== undefined ? { grupoSanguineo: tipoSanguineo ? String(tipoSanguineo).trim() : null } : {})
      },
      include: { pessoa: true }
    });

    res.json(mapearPaciente(pacienteAtualizado));
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe um paciente cadastrado com este CPF.' });
    }
    res.status(400).json({ error: 'Erro ao atualizar paciente.' });
  }
};

// DELETE /api/pacientes/:id — a "lixeira" da tela de Pacientes.
// Exclusão forte: remove o paciente e tudo que está vinculado a ele
// (atendimentos, procedimentos realizados nesses atendimentos, internações
// e evoluções), sem exigir que o usuário limpe o histórico manualmente antes.
exports.excluirPaciente = async (req, res) => {
  const { id } = req.params;
  const pacienteId = Number(id);

  try {
    const pacienteExistente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    if (!pacienteExistente) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    await prisma.$transaction([
      // procedimento_realizado tem onDelete: Cascade a partir de atendimento,
      // então apagar os atendimentos já limpa os procedimentos realizados junto.
      prisma.atendimento.deleteMany({ where: { pacienteId } }),
      prisma.internacao.deleteMany({ where: { pacienteId } }),
      // pessoa tem onDelete: Cascade para paciente e para evolucao,
      // então isso remove o registro de Paciente e as evoluções vinculadas.
      prisma.pessoa.delete({ where: { id: pacienteId } })
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir paciente:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }
    res.status(400).json({ error: 'Erro ao excluir paciente.' });
  }
};