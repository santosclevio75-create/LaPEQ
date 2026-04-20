import mysql from 'mysql2/promise';
import fs from 'fs';

async function migrate() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'chemistry_lab',
      multipleStatements: true
    });

    const sql = fs.readFileSync('drizzle/0006_eminent_scorpion.sql', 'utf-8');
    await conn.query(sql);
    
    console.log('✓ Notifications table created successfully');
    await conn.end();
    process.exit(0);
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('✓ Notifications table already exists');
      process.exit(0);
    }
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
