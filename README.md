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

Os dados de exemplo são usados apenas para demonstrar o fluxo do sistema em ambiente de desenvolvimento, sem envolver dados reais de pacientes.

---

## Evolução Full-Stack (Etapa 2)

Na Etapa 2, a infraestrutura relacional pura foi integrada a uma aplicação web moderna:
* **Banco de Dados Conteinerizado:** PostgreSQL orquestrado via Docker Compose.
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

## Como Instalar e Executar

### Pré-requisitos
* **Node.js** (v18+)
* **PostgreSQL** instalado e rodando **ou** **Docker** instalado e rodando (escolha uma das opções abaixo)

---

### Opção 1: Execução com Docker Compose

Recomendada se você já tem o Docker Desktop instalado e a virtualização habilitada na BIOS/Windows.

#### 1. Subir o Container do PostgreSQL
```bash
cd Backend
docker compose up -d
```
> Nas versões mais recentes do Docker, o comando é `docker compose` (sem hífen). O antigo `docker-compose` pode não estar disponível.

---

### Opção 2: Execução com PostgreSQL local (sem Docker)

Se preferir não usar Docker (ou não conseguir habilitar a virtualização), instale o PostgreSQL diretamente:

1. Baixe e instale em https://www.postgresql.org/download/
2. Crie o banco `Hospital_db` (atenção ao H maiúsculo):
```sql
   CREATE DATABASE "Hospital_db";
```
3. Ajuste o `Backend/.env` com o usuário/senha definidos na sua instalação.

---

### Configurando o Backend

```bash
cd Backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

> **No Windows (PowerShell)**, se precisar limpar uma instalação anterior (ex: `node_modules` copiado de outra máquina), use:
> ```powershell
> Remove-Item -Recurse -Force node_modules
> Remove-Item -Force package-lock.json
> ```
> (o comando `rm -rf` do Linux/Mac não funciona no PowerShell)

> ⚠️ **`npm run db:seed` está temporariamente quebrado** — o script referencia um modelo `Unidade` que não existe mais no `schema.prisma` atual. Pode ser ignorado por enquanto; a aplicação funciona normalmente sem os dados de exemplo.

### Configurando o Frontend

Em outro terminal:
```bash
cd Frontend
npm install
npm run dev
```

Acesse `http://localhost:3000` (com o Backend rodando em `http://localhost:4000`).