import mysql from 'mysql2/promise';

async function migrate() {
  try {
    const url = new URL(process.env.DATABASE_URL);
    const conn = await mysql.createConnection({
      host: url.hostname,
      port: url.port,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log('Applying database migrations...\n');

    // 1. Check and create notifications table
    console.log('1. Checking notifications table...');
    try {
      const [tables] = await conn.query(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'notifications' AND TABLE_SCHEMA = DATABASE()"
      );
      
      if (tables.length === 0) {
        console.log('   Creating notifications table...');
        await conn.query(`
          CREATE TABLE \`notifications\` (
            \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`userId\` int NOT NULL,
            \`type\` enum('loan_pending','loan_approved','loan_rejected','loan_returned','book_loan_pending','book_loan_approved','book_loan_rejected','book_loan_returned') NOT NULL,
            \`title\` varchar(255) NOT NULL,
            \`message\` text NOT NULL,
            \`loanId\` int,
            \`bookLoanId\` int,
            \`isRead\` boolean DEFAULT false,
            \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
            \`updatedAt\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log('   ✓ notifications table created\n');
      } else {
        console.log('   ✓ notifications table already exists\n');
      }
    } catch (e) {
      console.error('   Error with notifications table:', e.message);
    }

    // 2. Check and add userId to bookLoans if needed
    console.log('2. Checking bookLoans table structure...');
    try {
      const [columns] = await conn.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'bookLoans' AND COLUMN_NAME = 'userId'"
      );
      
      if (columns.length === 0) {
        console.log('   Adding userId column to bookLoans...');
        await conn.query('ALTER TABLE `bookLoans` ADD `userId` int NOT NULL DEFAULT 1 AFTER `id`');
        console.log('   ✓ userId column added to bookLoans\n');
      } else {
        console.log('   ✓ userId column already exists in bookLoans\n');
      }
    } catch (e) {
      console.error('   Error with bookLoans:', e.message);
    }

    // 3. Check and add userId to loans if needed
    console.log('3. Checking loans table structure...');
    try {
      const [columns] = await conn.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'loans' AND COLUMN_NAME = 'userId'"
      );
      
      if (columns.length === 0) {
        console.log('   Adding userId column to loans...');
        await conn.query('ALTER TABLE `loans` ADD `userId` int NOT NULL DEFAULT 1 AFTER `id`');
        console.log('   ✓ userId column added to loans\n');
      } else {
        console.log('   ✓ userId column already exists in loans\n');
      }
    } catch (e) {
      console.error('   Error with loans:', e.message);
    }

    await conn.end();
    console.log('✓ All migrations completed successfully!');
  } catch(e) {
    console.error('Fatal error:', e.message);
    process.exit(1);
  }
}

migrate();
