import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: 'Amazon RDS',
});

try {
  // Check if email column already exists in loans
  const [loansColumns] = await connection.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'loans' AND COLUMN_NAME = 'email'
  `);
  
  if (loansColumns.length === 0) {
    // Add email column after institution
    await connection.query(`
      ALTER TABLE \`loans\` 
      ADD \`email\` varchar(255) NOT NULL 
      AFTER \`institution\`
    `);
    console.log('✓ Added email column to loans');
  } else {
    console.log('✓ email column already exists in loans');
  }
  
  // Check if email column already exists in bookLoans
  const [bookLoansColumns] = await connection.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'bookLoans' AND COLUMN_NAME = 'email'
  `);
  
  if (bookLoansColumns.length === 0) {
    // Add email column after institution
    await connection.query(`
      ALTER TABLE \`bookLoans\` 
      ADD \`email\` varchar(255) NOT NULL 
      AFTER \`institution\`
    `);
    console.log('✓ Added email column to bookLoans');
  } else {
    console.log('✓ email column already exists in bookLoans');
  }
  
  console.log('\n✓ All email migrations applied successfully!');
} catch (error) {
  console.error('Error applying migrations:', error.message);
} finally {
  await connection.end();
}
