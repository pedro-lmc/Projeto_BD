const { getStore, getNextId, saveStore } = require('../data/store');

const store = getStore();
const atendimentos = store.atendimentos;
let proximoId = getNextId(atendimentos);

function formatarHora(dataHora) {
  return new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function mapearAtendimento(item) {
  return {
    id: item.id,
    hora: item.hora || formatarHora(item.dataHora),
    paciente: item.paciente || 'Paciente sem nome',
    medico: item.medico || 'Dra. Yuska Maritan',
    tipo: item.tipo || 'Consulta',
    status: item.status || 'AGUARDANDO',
    dataHora: item.dataHora,
    especialidade: item.especialidade || 'Cardiologia',
    convenio: item.convenio || 'Unimed',
    observacao: item.observacao || 'Consulta agendada para avaliação clínica.'
  };
}

exports.listarAtendimentos = async (req, res) => {
  res.json(atendimentos.slice().sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora)).map(mapearAtendimento));
};

exports.criarAtendimento = async (req, res) => {
  const { paciente: nomePaciente, hora, status, especialidade, convenio, observacao } = req.body;

  if (!nomePaciente || !hora) {
    return res.status(400).json({ error: 'Paciente e hora são obrigatórios.' });
  }

  const dataAtendimento = new Date();
  if (hora.includes(':')) {
    const [horas, minutos] = hora.split(':');
    dataAtendimento.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0, 0);
  }

  const novoAtendimento = {
    id: proximoId++,
    paciente: String(nomePaciente).trim(),
    medico: 'Dra. Yuska Maritan',
    hora,
    tipo: 'Consulta',
    status: status || 'AGUARDANDO',
    dataHora: dataAtendimento.toISOString(),
    especialidade: especialidade || 'Cardiologia',
    convenio: convenio || 'Unimed',
    observacao: observacao || 'Consulta agendada para avaliação clínica.'
  };

  atendimentos.push(novoAtendimento);
  saveStore();
  res.status(201).json(mapearAtendimento(novoAtendimento));
};

exports.atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const atendimento = atendimentos.find((item) => item.id === Number(id));
  if (!atendimento) {
    return res.status(404).json({ error: 'Atendimento não encontrado.' });
  }

  atendimento.status = status;
  saveStore();
  res.json(mapearAtendimento(atendimento));
};

exports.excluirAtendimento = async (req, res) => {
  const { id } = req.params;
  const index = atendimentos.findIndex((item) => item.id === Number(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Atendimento não encontrado.' });
  }

  atendimentos.splice(index, 1);
  saveStore();
  res.json({ success: true });
};