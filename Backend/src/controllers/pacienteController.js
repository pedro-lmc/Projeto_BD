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

exports.listarPacientes = async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      orderBy: { nome: 'asc' },
      include: {
        atendimentos: {
          orderBy: { dataHora: 'desc' },
          take: 1
        }
      }
    });
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pacientes.' });
  }
};

exports.criarPaciente = async (req, res) => {
  try {
    const { nome, cpf, dataNascimento, tipoSanguineo, alergias, telefone } = req.body;

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
        nome: String(nome).trim(),
        cpf: String(cpf).trim(),
        dataNascimento: nascimento,
        tipoSanguineo: tipoSanguineo ? String(tipoSanguineo).trim() : null,
        alergias: normalizarAlergias(alergias),
        telefone: String(telefone).trim()
      }
    });

    res.status(201).json(novoPaciente);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao cadastrar paciente.' });
  }
};