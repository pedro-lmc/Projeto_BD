# Sistema de Gestão Hospitalar Dra. Yuska Maritan Brito

Este repositório reúne a modelagem relacional do banco de dados e uma aplicação web full-stack para o Hospital Universitário Dra. Yuska Maritan Brito.

## Visão geral

O projeto atual inclui:

- um banco relacional em PostgreSQL com modelagem baseada em entidades como Pessoa, Paciente, Profissional, Preceptor, Residente, Unidade, Atendimento, Procedimento, Internação e Escala;
- integração com Prisma ORM para manipulação dos dados;
- uma API REST em Node.js e Express;
- um frontend em Next.js com páginas para agenda, pacientes, leitos, prontuário, financeiro e configurações.

## Stack utilizada

- Backend: Node.js, Express, Prisma, PostgreSQL
- Frontend: Next.js 14, React 18, Tailwind CSS, Recharts, Lucide React
- Infra: Docker Compose para o banco de dados

## Estrutura do repositório

```text
Projeto_BD/
├── Backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── sql/
│   │   ├── sql_legacy/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── orm/
│   │   ├── routes/
│   │   └── server.js
│   ├── docker-compose.yml
│   └── package.json
├── Frontend/
│   ├── src/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Pré-requisitos

- Node.js 18 ou superior
- npm
- Docker Desktop (opcional, para subir o banco via contêiner)
- PostgreSQL local (opcional, se não for usar Docker)

## Configuração do banco

### Opção 1: com Docker Compose

No diretório do backend, suba o container do PostgreSQL:

```bash
cd Backend
docker compose up -d
```

Isso cria um banco chamado Hospital_db com usuário postgres e senha vinicius07.

### Opção 2: com PostgreSQL local

1. Instale o PostgreSQL.
2. Crie o banco:

```sql
CREATE DATABASE "Hospital_db";
```

3. Crie um arquivo Backend/.env com a URL de conexão, por exemplo:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:vinicius07.:@localhost:5432/Hospital_db?schema=public"
```

## Configuração do backend

```bash
cd Backend
npm install
npm run db:setup
npm run db:seed
npm run dev
```

O comando npm run db:setup executa:

- prisma generate
- prisma migrate
- aplicação do SQL de procedures, triggers e views em 02_procedures_triggers_views.sql

O backend ficará disponível em http://localhost:4000.

Você também pode verificar a API com:

```bash
curl http://localhost:4000/api/health
```

## Configuração do frontend

Em outro terminal:

```bash
cd Frontend
npm install
npm run dev
```

O frontend ficará disponível em http://localhost:3000.

## Scripts úteis do backend

- npm run dev: inicia o servidor em modo desenvolvimento
- npm run start: inicia o servidor em modo produção
- npm run db:setup: gera o cliente Prisma, aplica migrações e carrega procedures/triggers/views
- npm run db:seed: popula o banco com dados de exemplo
- npm run orm:consultas: executa demonstrações de consultas avançadas
- npm run orm:concorrencia: executa a demonstração de concorrência

## Observação para Windows PowerShell

Se houver problemas com dependências antigas, pode ser útil limpar os diretórios locais antes de reinstalar:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
```
