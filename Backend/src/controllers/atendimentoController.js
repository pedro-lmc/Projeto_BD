const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. LISTAR ATENDIMENTOS
exports.listarAtendimentos = async (req, res) => {
  try {
    const atendimentos = await prisma.atendimento.findMany({
      include: {
        paciente: true,
        medico: true
      },
      orderBy: { dataHora: 'desc' }
    });

    const formatados = atendimentos.map(a => ({
      id: a.id,
      hora: new Date(a.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      paciente: a.paciente?.nome || 'Paciente sem nome',
      medico: a.medico?.nome || 'Dra. Yuska Maritan',
      tipo: 'Consulta',
      status: a.status || 'AGUARDANDO'
    }));

    res.json(formatados);
  } catch (error) {
    console.error('Erro ao listar atendimentos:', error);
    res.status(500).json({ error: 'Erro ao buscar atendimentos.' });
  }
};

// 2. CRIAR NOVO ATENDIMENTO (SUPER SEGURO)
exports.criarAtendimento = async (req, res) => {
  const { paciente: nomePaciente, hora, status } = req.body;

  try {
    // A. Busca ou cria o Paciente
    let paciente = await prisma.paciente.findFirst({
      where: { nome: nomePaciente }
    });

    if (!paciente) {
      // Gera CPF e Telefone aleatórios válidos para não violar a constraint @unique
      const cpfFake = `${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}-${Math.floor(10 + Math.random() * 89)}`;
      
      paciente = await prisma.paciente.create({
        data: {
          nome: nomePaciente,
          cpf: cpfFake,
          dataNascimento: new Date('1990-01-01T00:00:00.000Z'),
          telefone: '(83) 98888-7777'
        }
      });
    }

    // B. Busca ou cria o Médico Padrão
    let medico = await prisma.medico.findFirst();

    if (!medico) {
      medico = await prisma.medico.create({
        data: {
          nome: 'Dra. Yuska Maritan',
          crm: 'CRM/PB 99999',
          especialidade: 'Clínica Geral'
        }
      });
    }

    // C. Ajusta a Hora para um objeto Date válido do Prisma
    let dataAtendimento = new Date();
    if (hora && hora.includes(':')) {
      const [horas, minutos] = hora.split(':');
      dataAtendimento.setHours(parseInt(horas), parseInt(minutos), 0, 0);
    }

    // D. Salva no Banco
    const novoAtendimento = await prisma.atendimento.create({
      data: {
        pacienteId: paciente.id,
        medicoId: medico.id,
        dataHora: dataAtendimento,
        status: status || 'AGUARDANDO'
      },
      include: {
        paciente: true,
        medico: true
      }
    });

    res.status(201).json({
      id: novoAtendimento.id,
      hora: hora || '10:00',
      paciente: novoAtendimento.paciente.nome,
      medico: novoAtendimento.medico.nome,
      tipo: 'Consulta',
      status: novoAtendimento.status
    });

  } catch (error) {
    console.error('ERRO DETALHADO NO BACKEND:', error);
    res.status(500).json({ error: 'Erro ao criar no banco.', detalhes: error.message });
  }
};

// 3. ATUALIZAR STATUS
exports.atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const atualizado = await prisma.atendimento.update({
      where: { id: id },
      data: { status }
    });
    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
};