# Sistema de Gestão Hospitalar Dra. Yuska Maritan Brito

Este repositório contém a evolução completa da infraestrutura de banco de dados e aplicação web para o Hospital Universitário Dra. Yuska Maritan Brito, dividida e organizada em duas etapas integradas.

---

## Arquitetura e Modelagem (Etapa 1)

O banco de dados foi normalizado até à **3ª Forma Normal (3FN)**, com as seguintes entidades principais:

* **Paciente** — dados pessoais, CPF, tipo sanguíneo, alergias e histórico de contato.
* **Medico** — dados profissionais e CRM.
* **Atendimento** — vincula Paciente e Medico, com status, diagnóstico e prescrição.
* **Leito** — controle de ocupação por bloco/status.
* **Evolucao** — registros de evolução clínica do paciente.
* **Configuracao** — parâmetros administrativos da instituição.

Toda a carga inicial foi gerada utilizando dados 100% simulados. O banco roda num ambiente restrito de desenvolvimento, sem a recolha de dados reais de pacientes, assegurando a total privacidade e segurança das informações durante a fase de testes da infraestrutura.

---

## Evolução Full-Stack (Etapa 2)

Na Etapa 2, a infraestrutura relacional pura foi integrada a uma aplicação web moderna:
* **Banco de Dados:** PostgreSQL (via Docker Compose ou instalação local).
* **Mapeamento Objeto-Relacional (ORM):** Prisma ORM integrando os scripts legados em SQL puro da Etapa 1.
* **Backend:** API RESTful robusta desenvolvida em Node.js e Express.
* **Frontend:** Interface e Painel Administrativo em Next.js (React) estilizados com Tailwind CSS.

---

## 📂 Estrutura do Repositório

```text
Projeto-Hospital-PostgreSQL/
├── Backend/
│   ├── prisma/
│   │   ├── sql_legacy/              <-- Scripts SQL Originais da Etapa 1
│   │   │   ├── 01_create_tables.sql
│   │   │   ├── 02_insert_test_data.sql
│   │   │   ├── 03_dml_operacoes.sql
│   │   │   └── 04_dml_avancado.sql
│   │   ├── schema.prisma
│   │   └── seed.js                  <-- Carga automática dos dados da Etapa 1
│   ├── src/                         <-- Controllers e Rotas em Node.js
│   ├── docker-compose.yml
│   └── package.json
├── Frontend/                        <-- Interface Web em Next.js
└── README.md
```

---

## Como Instalar e Executar

### Pré-requisitos
* **Node.js** (v18+)
* **PostgreSQL** — via **Docker** (Opção 1) **ou** instalado localmente (Opção 2)

Escolha uma das duas opções abaixo para subir o banco de dados.

---

### Opção 1: Usando Docker

Recomendada se você já tem o Docker Desktop instalado e a virtualização habilitada na BIOS/Windows.

#### 1. Suba o container do PostgreSQL
```bash
cd Backend
docker compose up -d
```
> Nas versões mais recentes do Docker, o comando é `docker compose` (sem hífen, com espaço). O antigo `docker-compose` pode não estar mais disponível.

#### 2. Confirme que o container subiu
```bash
docker ps
```
Deve aparecer o container `hospital_postgres` com status `Up`.

#### 3. As credenciais do banco (usuário, senha, nome) precisam bater entre dois arquivos:
- `Backend/docker-compose.yml` (variáveis `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`)
- `Backend/.env` (variável `DATABASE_URL`)

Confira se ambos estão alinhados antes de seguir.

---

### Opção 2: Usando PostgreSQL local (sem Docker)

Alternativa caso não tenha Docker instalado ou não consiga habilitar a virtualização no seu computador.

#### 1. Instale o PostgreSQL
Baixe em: https://www.postgresql.org/download/

#### 2. Crie o banco de dados
Abra o `psql` (ou "SQL Shell") e rode:
```sql
CREATE DATABASE "Hospital_db";
```
> Atenção às aspas duplas e ao "H" maiúsculo — o nome do banco é *case-sensitive*.

#### 3. Ajuste o `Backend/.env`
Configure a `DATABASE_URL` com o usuário/senha definidos na sua instalação local:
```
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/Hospital_db?schema=public"
```

---

### Configurando o Backend

Depois de ter o banco no ar (por qualquer uma das opções acima):

```bash
cd Backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

O servidor deve subir em `http://localhost:4000`.

> **No Windows (PowerShell)**, se precisar limpar uma instalação anterior (por exemplo, um `node_modules` copiado de outra máquina/sistema operacional, o que causa erro de engine do Prisma incompatível), use:
> ```powershell
> Remove-Item -Recurse -Force node_modules
> Remove-Item -Force package-lock.json
> ```
> (o comando `rm -rf` do Linux/Mac não funciona no PowerShell)

> ⚠️ **`npm run db:seed` está temporariamente quebrado** — o script referencia um modelo `Unidade` que não existe mais no `schema.prisma` atual. Pode ser ignorado por enquanto; a aplicação funciona normalmente sem os dados de exemplo.

---

### Configurando o Frontend

Em um **segundo terminal** (deixe o Backend rodando no primeiro):

```bash
cd Frontend
npm install
npm run dev
```

Acesse **http://localhost:3000** no navegador. O Frontend consome a API em `http://localhost:4000`, então o Backend precisa estar rodando ao mesmo tempo.
