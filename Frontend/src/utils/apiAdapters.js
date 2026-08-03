const DEFAULT_MEDICO = 'Dra. Yuska Maritan';
const DEFAULT_STATUS = 'AGUARDANDO';

export function normalizarAtendimento(item) {
  if (!item) return null;

  const paciente =
    typeof item.paciente === 'string'
      ? item.paciente
      : item.paciente?.nome || item.nomePaciente || 'Paciente sem nome';

  const medico =
    typeof item.medico === 'string'
      ? item.medico
      : item.medico?.nome || item.nomeMedico || DEFAULT_MEDICO;

  const hora =
    item.hora ||
    (item.dataHora
      ? new Date(item.dataHora).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--');

  return {
    ...item,
    id: item.id,
    hora,
    paciente,
    medico,
    tipo: item.tipo || 'Consulta',
    status: item.status || DEFAULT_STATUS,
    dataHora: item.dataHora || null,
    queixaPrincipal: item.queixaPrincipal || item.tipo || 'Consulta',
    especialidade: item.especialidade || 'Cardiologia',
    convenio: item.convenio || 'Unimed',
    observacao: item.observacao || 'Consulta agendada para avaliação clínica.',
  };
}

export function normalizarAtendimentos(data) {
  return Array.isArray(data) ? data.map(normalizarAtendimento).filter(Boolean) : [];
}

export function normalizarPaciente(item) {
  if (!item) return null;

  return {
    ...item,
    id: item.id,
    nome: item.nome || item.pessoa?.nome || 'Paciente sem nome',
    cpf: item.cpf || item.pessoa?.cpf || '',
    dataNascimento: item.dataNascimento || item.pessoa?.dataNascimento || null,
    telefone: item.telefone || item.pessoa?.telefone || '',
    tipoSanguineo: item.tipoSanguineo || item.grupoSanguineo || item.pessoa?.tipoSanguineo || null,
    alergias: item.alergias || item.pessoa?.alergias || '',
    atendimentos: Array.isArray(item.atendimentos) ? item.atendimentos : [],
    createdAt: item.createdAt || item.created_at || null,
  };
}

export function normalizarPacientes(data) {
  return Array.isArray(data) ? data.map(normalizarPaciente).filter(Boolean) : [];
}

export function normalizarEvolucao(item) {
  if (!item) return null;

  return {
    ...item,
    texto: item.texto || '',
    responsavel: item.responsavel || DEFAULT_MEDICO,
    createdAt: item.createdAt || item.created_at || null,
  };
}

export function normalizarEvolucoes(data) {
  return Array.isArray(data) ? data.map(normalizarEvolucao).filter(Boolean) : [];
}

export function normalizarConfiguracao(item) {
  if (!item) return { nomeInstituicao: '', email: '' };

  return {
    ...item,
    nomeInstituicao: item.nomeInstituicao || '',
    email: item.email || '',
  };
}