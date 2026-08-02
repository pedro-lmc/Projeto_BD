// ============================================================================
// Seed — popula o banco com o mínimo exigido pelo enunciado:
// 5 pacientes, 5 residentes, 5 preceptores, 3 unidades, 10 atendimentos,
// 10 procedimentos realizados.
// ============================================================================
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  const unidades = await Promise.all([
    prisma.unidade.create({ data: { nome: 'Enfermaria Geral', tipo: 'Enfermaria', capacidadeLeitos: 40 } }),
    prisma.unidade.create({ data: { nome: 'UTI Adulto', tipo: 'UTI', capacidadeLeitos: 12 } }),
    prisma.unidade.create({ data: { nome: 'Pronto-Socorro', tipo: 'Pronto-Socorro', capacidadeLeitos: 20 } }),
  ]);

  console.log('Criando pacientes...');
  const pacientesInfo = [
    ['Maria da Silva Souza', '10000000001', '1985-03-12', true, 'CONV-1001', 'Dipirona', 'O+'],
    ['Joao Pedro Almeida', '10000000002', '1990-07-22', false, 'CONV-1002', 'Nenhuma', 'A+'],
    ['Ana Beatriz Costa', '10000000003', '1978-11-05', true, 'CONV-1003', 'Penicilina', 'B-'],
    ['Carlos Eduardo Farias', '10000000004', '2001-01-30', false, null, 'Nenhuma', 'AB+'],
    ['Fernanda Lima Rocha', '10000000005', '1995-09-14', true, 'CONV-1005', 'Latex', 'O-'],
  ];
  const pacientes = [];
  for (const [nome, cpf, nasc, flamengo, convenio, alergias, sangue] of pacientesInfo) {
    const p = await prisma.paciente.create({
      data: {
        pessoa: {
          create: { nome, cpf, dataNascimento: new Date(nasc), isFlamengo: flamengo, telefone: '83988880000' },
        },
        numConvenio: convenio,
        alergias,
        grupoSanguineo: sangue,
      },
      include: { pessoa: true },
    });
    pacientes.push(p);
  }

  console.log('Criando residentes...');
  const residentesInfo = [
    ['Bruno Henrique Nogueira', '20000000006', 'CRM-PB-10001', 'Clinica Medica', 'R1'],
    ['Larissa Menezes Duarte', '20000000007', 'CRM-PB-10002', 'Pediatria', 'R2'],
    ['Rafael Andrade Bezerra', '20000000008', 'CRM-PB-10003', 'Cirurgia Geral', 'R1'],
    ['Camila Torres Sales', '20000000009', 'CRM-PB-10004', 'Ortopedia', 'R3'],
    ['Diego Fernandes Cavalcante', '20000000010', 'CRM-PB-10005', 'Ginecologia', 'R2'],
  ];
  const residentes = [];
  for (const [nome, cpf, crm, esp, ano] of residentesInfo) {
    const r = await prisma.residente.create({
      data: {
        profissional: {
          create: {
            pessoa: { create: { nome, cpf, dataNascimento: new Date('1996-01-01'), telefone: '83988880000' } },
            crm,
            dataAdmissao: new Date('2023-02-01'),
            especialidade: esp,
          },
        },
        anoResidencia: ano,
      },
    });
    residentes.push(r);
  }

  console.log('Criando preceptores...');
  const preceptoresInfo = [
    ['Patricia Gouveia Melo', '20000000011', 'CRM-PB-20001', 'Clinica Medica', 'doutor'],
    ['Marcos Antonio Lira', '20000000012', 'CRM-PB-20002', 'Cirurgia Geral', 'mestre'],
    ['Renata Barbosa Xavier', '20000000013', 'CRM-PB-20003', 'Pediatria', 'doutor'],
    ['Eduardo Campos Freire', '20000000014', 'CRM-PB-20004', 'Ortopedia', 'mestre'],
    ['Juliana Prado Aragao', '20000000015', 'CRM-PB-20005', 'Ginecologia', 'doutor'],
  ];
  const preceptores = [];
  for (const [nome, cpf, crm, esp, titulacao] of preceptoresInfo) {
    const pr = await prisma.preceptor.create({
      data: {
        profissional: {
          create: {
            pessoa: { create: { nome, cpf, dataNascimento: new Date('1975-01-01'), telefone: '83988880000' } },
            crm,
            dataAdmissao: new Date('2010-03-15'),
            especialidade: esp,
          },
        },
        titulacao,
      },
    });
    preceptores.push(pr);
  }

  console.log('Criando procedimentos...');
  const procedimentosInfo = [
    ['PROC-001', 'Sutura simples', 20, 'MEDIO'],
    ['PROC-002', 'Coleta de sangue', 10, 'BAIXO'],
    ['PROC-003', 'Aplicacao de medicacao', 5, 'BAIXO'],
    ['PROC-004', 'Curativo complexo', 25, 'MEDIO'],
    ['PROC-005', 'Intubacao', 15, 'ALTO'],
  ];
  const procedimentos = [];
  for (const [codigo, nome, tempo, risco] of procedimentosInfo) {
    procedimentos.push(await prisma.procedimento.create({
      data: { codigo, nome, tempoMedioMinutos: tempo, nivelRisco: risco },
    }));
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
        preceptorId: preceptores[i].id,
      },
    });
  }

  console.log('Criando 10 atendimentos com procedimentos realizados...');
  for (let i = 0; i < 10; i++) {
    const paciente = pacientes[i % pacientes.length];
    const residente = residentes[i % residentes.length];
    const preceptor = preceptores[i % preceptores.length];

    const atendimento = await prisma.atendimento.create({
      data: {
        dataHora: new Date(2026, 5, 1 + i, 9 + (i % 8)),
        duracaoMinutos: 20 + i * 3,
        pacienteId: paciente.id,
        residenteId: residente.id,
        preceptorId: preceptor.id,
      },
    });

    const proc = procedimentos[i % procedimentos.length];
    await prisma.procedimentoRealizado.create({
      data: {
        atendimentoId: atendimento.id,
        procedimentoId: proc.id,
        quantidade: 1,
        tempoRealMinutos: proc.tempoMedioMinutos + (i % 5),
        observacao: i % 4 === 0 ? 'Sem intercorrencias' : null,
      },
    });
  }

  console.log('Criando internação de exemplo (paciente atualmente internado)...');
  await prisma.internacao.create({
    data: {
      pacienteId: pacientes[0].id,
      unidadeId: unidades[1].id,
      dataHoraEntrada: new Date('2026-06-15T08:00:00'),
      dataHoraSaida: null,
    },
  });

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
