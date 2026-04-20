import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: 'Amazon RDS',
});

try {
  await connection.query(`ALTER TABLE \`bookLoans\` ADD \`actualReturnDate\` timestamp`);
  console.log('✓ Added actualReturnDate to bookLoans');
  
  await connection.query(`ALTER TABLE \`experiments\` ADD \`quantity\` int DEFAULT 1 NOT NULL`);
  console.log('✓ Added quantity to experiments');
  
  await connection.query(`ALTER TABLE \`loans\` ADD \`actualReturnDate\` timestamp`);
  console.log('✓ Added actualReturnDate to loans');
  
  console.log('\n✓ All migrations applied successfully!');
} catch (error) {
  if (error.code === 'ER_DUP_FIELDNAME') {
    console.log('✓ Columns already exist, skipping...');
  } else {
    console.error('Error applying migrations:', error.message);
  }
} finally {
  await connection.end();
}
