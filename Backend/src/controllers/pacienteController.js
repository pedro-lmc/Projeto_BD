const { getStore, saveStore } = require('../data/store');

const store = getStore();
const pacientes = store.pacientes;
let proximoId = pacientes.length + 1;

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
    nome: item.nome,
    cpf: item.cpf,
    dataNascimento: item.dataNascimento,
    telefone: item.telefone,
    tipoSanguineo: item.tipoSanguineo || null,
    alergias: item.alergias || '',
    atendimentos: item.atendimentos || [],
    createdAt: item.createdAt
  };
}

exports.listarPacientes = async (req, res) => {
  res.json(pacientes.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map(mapearPaciente));
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

    const novoPaciente = {
      id: proximoId++,
      nome: String(nome).trim(),
      cpf: String(cpf).trim(),
      dataNascimento: nascimento.toISOString(),
      tipoSanguineo: tipoSanguineo ? String(tipoSanguineo).trim() : null,
      alergias: normalizarAlergias(alergias),
      telefone: String(telefone).trim(),
      atendimentos: [],
      createdAt: new Date().toISOString()
    };

    pacientes.push(novoPaciente);
    saveStore();
    res.status(201).json(mapearPaciente(novoPaciente));
  } catch (error) {
    console.error('Erro ao cadastrar paciente:', error);
    res.status(400).json({ error: 'Erro ao cadastrar paciente.' });
  }
};