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
    res.status(400).json({ error: 'Erro ao cadastrar paciente.' });
  }
};