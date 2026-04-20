import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: 'Amazon RDS',
});

try {
  // Check if quantity column already exists
  const [columns] = await connection.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'experiments' AND COLUMN_NAME = 'quantity'
  `);
  
  if (columns.length === 0) {
    await connection.query(`ALTER TABLE \`experiments\` ADD \`quantity\` int DEFAULT 1 NOT NULL`);
    console.log('✓ Added quantity column to experiments');
  } else {
    console.log('✓ quantity column already exists');
  }
  
  // Check if actualReturnDate column exists in loans
  const [loansColumns] = await connection.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'loans' AND COLUMN_NAME = 'actualReturnDate'
  `);
  
  if (loansColumns.length === 0) {
    await connection.query(`ALTER TABLE \`loans\` ADD \`actualReturnDate\` timestamp`);
    console.log('✓ Added actualReturnDate column to loans');
  } else {
    console.log('✓ actualReturnDate column already exists in loans');
  }
  
  // Check if actualReturnDate column exists in bookLoans
  const [bookLoansColumns] = await connection.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'bookLoans' AND COLUMN_NAME = 'actualReturnDate'
  `);
  
  if (bookLoansColumns.length === 0) {
    await connection.query(`ALTER TABLE \`bookLoans\` ADD \`actualReturnDate\` timestamp`);
    console.log('✓ Added actualReturnDate column to bookLoans');
  } else {
    console.log('✓ actualReturnDate column already exists in bookLoans');
  }
  
  console.log('\n✓ All migrations applied successfully!');
} catch (error) {
  console.error('Error applying migrations:', error.message);
} finally {
  await connection.end();
}
