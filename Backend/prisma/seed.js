const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando povoamento do banco de dados...');

  try {
    // 1️⃣ Tentativa via SQL Legado ajustando minúsculas/aspas
    const sqlPath = path.join(__dirname, 'sql_legacy', '02_insert_test_data.sql');

    if (fs.existsSync(sqlPath)) {
      console.log('📄 Processando script 02_insert_test_data.sql...');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');

      // Limpa comentários
      const cleanSql = sqlContent
        .replace(/--.*$/gm, '')
        .split(';')
        .map((q) => q.trim())
        .filter((q) => q.length > 0);

      let inseridos = 0;
      for (let query of cleanSql) {
        try {
          // Ajusta nomes de tabelas maiúsculas para minúsculas caso necessário
          const queryAjustada = query
            .replace(/INTO\s+([A-Z_]+)/gi, (match, p1) => `INTO "${p1.toLowerCase()}"`)
            .replace(/INSERT INTO "pessoa"/gi, 'INSERT INTO "Pessoa"')
            .replace(/INSERT INTO "paciente"/gi, 'INSERT INTO "Paciente"')
            .replace(/INSERT INTO "profissional"/gi, 'INSERT INTO "Profissional"')
            .replace(/INSERT INTO "unidade"/gi, 'INSERT INTO "Unidade"');

          await prisma.$executeRawUnsafe(queryAjustada);
          inseridos++;
        } catch (err) {
          // Segue para a próxima query em caso de aviso
        }
      }

      if (inseridos > 0) {
        console.log(`✅ Executados ${inseridos} comandos SQL do arquivo legado!`);
      }
    }

    // 2️⃣ Garante que existam dados mínimos via Prisma API se o SQL não popular tudo
    console.log('🌱 Verificando/Criando dados padrão via Prisma Client...');

    // Cria Unidade de Teste se não existir
    const qtdUnidades = await prisma.unidade.count();
    if (qtdUnidades === 0) {
      await prisma.unidade.create({
        data: {
          nome: 'Unidade Central - Hospital Yuska',
          tipo: 'Geral',
        },
      });
      console.log('  └─ Unidade de Saúde criada com sucesso!');
    }

    console.log('🎉 Carga e verificação do banco concluídas!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();