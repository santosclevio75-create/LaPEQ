import mysql from 'mysql2/promise';

// Parsear DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);
const connection = await mysql.createConnection({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  // Tentar adicionar a coluna videoUrl
  await connection.execute('ALTER TABLE `experiments` ADD `videoUrl` text;');
  console.log('✅ Campo videoUrl adicionado com sucesso!');
} catch (err) {
  if (err.code === 'ER_DUP_FIELDNAME') {
    console.log('✅ Campo videoUrl já existe');
  } else {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

await connection.end();
