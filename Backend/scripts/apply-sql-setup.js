const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const sqlPath = path.join(__dirname, '..', 'prisma', 'sql', '02_procedures_triggers_views.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('Aplicando procedures, triggers e views no banco...');
    // client.query com protocolo simples aceita múltiplos comandos (CREATE FUNCTION/PROCEDURE/TRIGGER/VIEW)
    await client.query(sql);
    console.log('Procedures, triggers e views aplicados com sucesso.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Erro ao aplicar setup SQL:', error);
  process.exit(1);
});