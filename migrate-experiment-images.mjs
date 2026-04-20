import mysql from 'mysql2/promise';

const connectionConfig = {
  host: 'gateway05.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'ZKM87tZZSjZburi.root',
  password: '4I8g1Ho5EtNsLVM2RY6S',
  database: 'Sg53Qp3VHExKb8spk84Ana',
  ssl: { rejectUnauthorized: true }
};

async function migrate() {
  const connection = await mysql.createConnection(connectionConfig);
  
  try {
    // Check if table exists
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'experimentImages'",
      ['Sg53Qp3VHExKb8spk84Ana']
    );
    
    if (tables.length === 0) {
      console.log('Creating experimentImages table...');
      await connection.execute(`
        CREATE TABLE experimentImages (
          id int AUTO_INCREMENT NOT NULL,
          experimentId int NOT NULL,
          imageUrl text NOT NULL,
          caption text,
          \`order\` int DEFAULT 0,
          createdAt timestamp NOT NULL DEFAULT (now()),
          updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT experimentImages_id PRIMARY KEY(id)
        )
      `);
      console.log('✅ experimentImages table created successfully!');
    } else {
      console.log('✅ experimentImages table already exists!');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

migrate();
