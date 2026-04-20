const mysql = require('mysql2/promise');

async function applyMigration() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Checking if userId column exists...");
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'loans' AND COLUMN_NAME = 'userId'"
    );

    if (columns.length === 0) {
      console.log("Adding userId column to loans table...");
      await connection.query("ALTER TABLE `loans` ADD `userId` int NOT NULL DEFAULT 1");
      console.log("✓ userId column added successfully");
    } else {
      console.log("✓ userId column already exists");
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

applyMigration();
