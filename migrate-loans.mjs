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
    
    console.log('Checking loans table structure...');
    const [rows] = await conn.query('DESCRIBE loans');
    const hasUserId = rows.some(r => r.Field === 'userId');
    
    if (!hasUserId) {
      console.log('Adding userId column...');
      await conn.query('ALTER TABLE `loans` ADD `userId` int NOT NULL DEFAULT 1');
      console.log('✓ userId column added successfully');
    } else {
      console.log('✓ userId column already exists');
    }
    
    // Also check bookLoans table
    console.log('\nChecking bookLoans table structure...');
    const [bookRows] = await conn.query('DESCRIBE bookLoans');
    const hasBookUserId = bookRows.some(r => r.Field === 'userId');
    
    if (!hasBookUserId) {
      console.log('Adding userId column to bookLoans...');
      await conn.query('ALTER TABLE `bookLoans` ADD `userId` int NOT NULL DEFAULT 1');
      console.log('✓ userId column added to bookLoans successfully');
    } else {
      console.log('✓ userId column already exists in bookLoans');
    }
    
    await conn.end();
    console.log('\n✓ Migration completed successfully!');
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

migrate();
