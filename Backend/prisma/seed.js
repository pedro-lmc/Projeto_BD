// ============================================================================
// Seed — popula o banco com dados realistas para o frontend.
// Gera pacientes, profissionais, procedimentos, atendimentos, internações e
// 20 leitos nomeados para aparecerem nas telas de leitos e prontuário.
// ============================================================================
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const unidadesInfo = [
  { nome: 'Enfermaria Geral', tipo: 'Enfermaria', capacidadeLeitos: 12 },
  { nome: 'UTI Adulto', tipo: 'UTI', capacidadeLeitos: 8 },
  { nome: 'Pronto-Socorro', tipo: 'Pronto-Socorro', capacidadeLeitos: 10 }
];

const pacientesInfo = [
  ['Maria da Silva Souza', '10000000001', '1985-03-12', true, 'CONV-1001', 'Dipirona', 'O+'],
  ['Joao Pedro Almeida', '10000000002', '1990-07-22', false, 'CONV-1002', 'Nenhuma', 'A+'],
  ['Ana Beatriz Costa', '10000000003', '1978-11-05', true, 'CONV-1003', 'Penicilina', 'B-'],
  ['Carlos Eduardo Farias', '10000000004', '2001-01-30', false, null, 'Nenhuma', 'AB+'],
  ['Fernanda Lima Rocha', '10000000005', '1995-09-14', true, 'CONV-1005', 'Latex', 'O-'],
  ['Rafael Nunes', '10000000006', '1972-11-18', false, 'CONV-2001', 'Asa', 'A-'],
  ['Beatriz Carvalho', '10000000007', '1991-05-08', true, 'CONV-2002', 'Pólen', 'B+'],
  ['Thiago Moura', '10000000008', '1988-02-14', false, 'CONV-2003', 'Nenhuma', 'O-'],
  ['Lívia Andrade', '10000000009', '1997-09-24', true, 'CONV-2004', 'Penicilina', 'AB-'],
  ['Cláudio Rocha', '10000000010', '1969-12-01', false, null, 'Dipirona', 'A+']
];

const residentesInfo = [
  ['Bruno Henrique Nogueira', '20000000006', 'CRM-PB-10001', 'Clinica Medica', 'R1'],
  ['Larissa Menezes Duarte', '20000000007', 'CRM-PB-10002', 'Pediatria', 'R2'],
  ['Rafael Andrade Bezerra', '20000000008', 'CRM-PB-10003', 'Cirurgia Geral', 'R1'],
  ['Camila Torres Sales', '20000000009', 'CRM-PB-10004', 'Ortopedia', 'R3'],
  ['Diego Fernandes Cavalcante', '20000000010', 'CRM-PB-10005', 'Ginecologia', 'R2']
];

const preceptoresInfo = [
  ['Patricia Gouveia Melo', '20000000011', 'CRM-PB-20001', 'Clinica Medica', 'doutor'],
  ['Marcos Antonio Lira', '20000000012', 'CRM-PB-20002', 'Cirurgia Geral', 'mestre'],
  ['Renata Barbosa Xavier', '20000000013', 'CRM-PB-20003', 'Pediatria', 'doutor'],
  ['Eduardo Campos Freire', '20000000014', 'CRM-PB-20004', 'Ortopedia', 'mestre'],
  ['Juliana Prado Aragao', '20000000015', 'CRM-PB-20005', 'Ginecologia', 'doutor']
];

const procedimentosInfo = [
  ['PROC-001', 'Sutura simples', 20, 'MEDIO'],
  ['PROC-002', 'Coleta de sangue', 10, 'BAIXO'],
  ['PROC-003', 'Aplicacao de medicacao', 5, 'BAIXO'],
  ['PROC-004', 'Curativo complexo', 25, 'MEDIO'],
  ['PROC-005', 'Intubacao', 15, 'ALTO'],
  ['PROC-006', 'Tomografia de tórax', 30, 'MEDIO']
];

const leitosNomeados = [
  'Leito 01 - Sala A', 'Leito 02 - Sala A', 'Leito 03 - Sala A', 'Leito 04 - Sala A',
  'Leito 05 - Sala B', 'Leito 06 - Sala B', 'Leito 07 - Sala B', 'Leito 08 - Sala B',
  'Leito 09 - Sala C', 'Leito 10 - Sala C', 'Leito 11 - Sala C', 'Leito 12 - Sala C',
  'UTI 01 - Sala Intensiva', 'UTI 02 - Sala Intensiva', 'UTI 03 - Sala Intensiva',
  'UTI 04 - Sala Intensiva', 'PS 01 - Pronto Socorro', 'PS 02 - Pronto Socorro',
  'PS 03 - Pronto Socorro', 'PS 04 - Pronto Socorro'
];

async function main() {
  console.log('Limpando dados existentes...');
  await prisma.auditoriaAtendimento.deleteMany();
  await prisma.procedimentoRealizado.deleteMany();
  await prisma.escala.deleteMany();
  await prisma.internacao.deleteMany();
  await prisma.atendimento.deleteMany();
  await prisma.procedimento.deleteMany();
  await prisma.unidade.deleteMany();
  await prisma.residente.deleteMany();
  await prisma.preceptor.deleteMany();
  await prisma.profissional.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.pessoa.deleteMany();

  console.log('Criando unidades...');
  const unidades = [];
  for (const unidade of unidadesInfo) {
    unidades.push(await prisma.unidade.create({ data: unidade }));
  }

  console.log('Criando pacientes...');
  const pacientes = [];
  for (const [nome, cpf, nasc, flamengo, convenio, alergias, sangue] of pacientesInfo) {
    const paciente = await prisma.paciente.create({
      data: {
        pessoa: {
          create: { nome, cpf, dataNascimento: new Date(nasc), isFlamengo: flamengo, telefone: '83988880000' }
        },
        numConvenio: convenio,
        alergias,
        grupoSanguineo: sangue
      },
      include: { pessoa: true }
    });
    pacientes.push(paciente);
  }

  console.log('Criando residentes...');
  const residentes = [];
  for (const [nome, cpf, crm, esp, ano] of residentesInfo) {
    const residente = await prisma.residente.create({
      data: {
        profissional: {
          create: {
            pessoa: { create: { nome, cpf, dataNascimento: new Date('1996-01-01'), telefone: '83988880000' } },
            crm,
            dataAdmissao: new Date('2023-02-01'),
            especialidade: esp
          }
        },
        anoResidencia: ano
      }
    });
    residentes.push(residente);
  }

  console.log('Criando preceptores...');
  const preceptores = [];
  for (const [nome, cpf, crm, esp, titulacao] of preceptoresInfo) {
    const preceptor = await prisma.preceptor.create({
      data: {
        profissional: {
          create: {
            pessoa: { create: { nome, cpf, dataNascimento: new Date('1975-01-01'), telefone: '83988880000' } },
            crm,
            dataAdmissao: new Date('2010-03-15'),
            especialidade: esp
          }
        },
        titulacao
      }
    });
    preceptores.push(preceptor);
  }

  console.log('Criando procedimentos...');
  const procedimentos = [];
  for (const [codigo, nome, tempo, risco] of procedimentosInfo) {
    procedimentos.push(await prisma.procedimento.create({ data: { codigo, nome, tempoMedioMinutos: tempo, nivelRisco: risco } }));
  }

  console.log('Criando escalas...');
  const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
  const turnos = ['manha', 'tarde', 'noite'];
  for (let i = 0; i < residentes.length; i++) {
    await prisma.escala.create({
      data: {
        unidadeId: unidades[i % unidades.length].id,
        diaSemana: dias[i % dias.length],
        turno: turnos[i % turnos.length],
        residenteId: residentes[i].id,
        preceptorId: preceptores[i].id
      }
    });
  }

  console.log('Criando atendimentos e prontuários...');
  const observacoesInfo = [
    'Paciente evoluindo bem, sem sinais de intercorrência. Mantida conduta atual.',
    'Queixa de dor leve, controlada com analgesia habitual. Reavaliação em 48 horas.',
    'Sinais vitais estáveis. Mantido plano terapêutico e orientações gerais.',
    'Solicitado exame complementar para investigação adicional do quadro.',
    'Paciente orientado sobre cuidados pós-procedimento e sinais de alerta.',
    'Melhora do quadro clínico após início do tratamento. Segue em acompanhamento.',
    'Paciente encaminhado para acompanhamento ambulatorial especializado.',
    'Sem queixas no momento. Exame físico dentro da normalidade.',
    'Curativo trocado sem sinais de infecção. Ferida em bom processo de cicatrização.',
    'Ajuste de medicação realizado após avaliação da equipe médica.'
  ];

  // 3 atendimentos por paciente para garantir histórico no prontuário de todos
  const totalAtendimentos = pacientes.length * 3;
  for (let i = 0; i < totalAtendimentos; i++) {
    const paciente = pacientes[i % pacientes.length];
    const residente = residentes[i % residentes.length];
    const preceptor = preceptores[i % preceptores.length];
    const procedimento = procedimentos[i % procedimentos.length];

    const atendimento = await prisma.atendimento.create({
      data: {
        dataHora: new Date(2026, 6, 1 + (i % 28), 7 + (i % 10)),
        duracaoMinutos: 20 + (i % 5) * 5,
        pacienteId: paciente.id,
        residenteId: residente.id,
        preceptorId: preceptor.id
      }
    });

    await prisma.procedimentoRealizado.create({
      data: {
        atendimentoId: atendimento.id,
        procedimentoId: procedimento.id,
        quantidade: 1,
        tempoRealMinutos: procedimento.tempoMedioMinutos + (i % 3),
        horaInicio: new Date(2026, 6, 1 + (i % 28), 7 + (i % 10)),
        observacao: observacoesInfo[i % observacoesInfo.length]
      }
    });
  }

  console.log('Criando leitos nomeados em unidades...');
  const leitosPorNome = {};
  for (const nomeLeito of leitosNomeados) {
    const unidade = unidades.find((u) => nomeLeito.startsWith('UTI') ? u.tipo === 'UTI' : nomeLeito.startsWith('PS') ? u.tipo === 'Pronto-Socorro' : u.tipo === 'Enfermaria');
    const leito = await prisma.unidade.create({ data: { nome: nomeLeito, tipo: unidade.tipo, capacidadeLeitos: 1 } });
    leitosPorNome[nomeLeito] = leito;
  }

  console.log('Criando internações para leitos...');
  const internacoesInfo = [
    { pacienteIndex: 0, entrada: '2026-07-01T08:00:00', saida: null, nomeLeito: 'Leito 01 - Sala A' },
    { pacienteIndex: 1, entrada: '2026-07-02T09:30:00', saida: null, nomeLeito: 'Leito 02 - Sala A' },
    { pacienteIndex: 2, entrada: '2026-07-03T10:00:00', saida: null, nomeLeito: 'Leito 03 - Sala A' },
    { pacienteIndex: 3, entrada: '2026-07-04T14:00:00', saida: null, nomeLeito: 'Leito 04 - Sala A' },
    { pacienteIndex: 4, entrada: '2026-07-05T07:15:00', saida: null, nomeLeito: 'Leito 05 - Sala B' },
    { pacienteIndex: 5, entrada: '2026-07-06T12:00:00', saida: null, nomeLeito: 'UTI 01 - Sala Intensiva' },
    { pacienteIndex: 6, entrada: '2026-07-07T13:30:00', saida: null, nomeLeito: 'UTI 02 - Sala Intensiva' },
    { pacienteIndex: 7, entrada: '2026-07-08T15:00:00', saida: null, nomeLeito: 'UTI 03 - Sala Intensiva' },
    { pacienteIndex: 8, entrada: '2026-07-09T16:00:00', saida: null, nomeLeito: 'PS 01 - Pronto Socorro' },
    { pacienteIndex: 9, entrada: '2026-07-10T18:00:00', saida: null, nomeLeito: 'PS 02 - Pronto Socorro' }
  ];

  for (const item of internacoesInfo) {
    await prisma.internacao.create({
      data: {
        pacienteId: pacientes[item.pacienteIndex].id,
        unidadeId: leitosPorNome[item.nomeLeito].id,
        dataHoraEntrada: new Date(item.entrada),
        dataHoraSaida: item.saida ? new Date(item.saida) : null
      }
    });
  }

  console.log('Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });