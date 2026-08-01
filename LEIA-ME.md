# Sistema de Gestão Hospitalar — Dra. Yuska Maritan

Projeto migrado de SQLite para **PostgreSQL**.

## Estrutura
```
Backend/     -> API (Node.js + Express + Prisma)
Frontend/    -> Interface (Next.js)
```

## 1. Banco de Dados (PostgreSQL)

Você precisa de um PostgreSQL rodando. Duas opções:

### Opção A — Docker (mais simples)
Se tiver o Docker Desktop instalado:
```
cd Backend
docker compose up -d
```
Isso já sobe um PostgreSQL local na porta 5432 com usuário/senha/banco prontos.

### Opção B — PostgreSQL instalado na máquina
Crie um banco chamado `hospital_db` e anote usuário/senha/porta.

## 2. Configurar o Backend

```
cd Backend
npm install
```

Copie o arquivo `.env.example` para `.env`:
```
copy .env.example .env      (Windows)
cp .env.example .env        (Mac/Linux)
```

Se você usou a Opção A (Docker), o `.env.example` já vem com a string de conexão certa,
não precisa mudar nada. Se usou a Opção B, edite a linha `DATABASE_URL` dentro do `.env`
com seu usuário/senha/porta reais.

Depois, crie as tabelas no banco (isso substitui o antigo `dev.db` do SQLite):
```
npx prisma migrate dev --name init
```

Suba o servidor:
```
npm run dev
```

Deve aparecer: `🏥 Servidor rodando com sucesso na porta 4000`

## 3. Configurar o Frontend

Em outro terminal:
```
cd Frontend
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Observações
- O arquivo `prisma/dev.db` (SQLite antigo) não é mais usado e foi removido.
- Toda a arquitetura, rotas, controllers e telas continuam as mesmas — só a
  camada de banco de dados mudou de SQLite para PostgreSQL.
