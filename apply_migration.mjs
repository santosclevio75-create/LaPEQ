import { getDb } from "./server/db.mjs";

async function applyMigration() {
  try {
    const db = await getDb();
    
    // Check if userId column already exists
    const result = await db.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'loans' AND COLUMN_NAME = 'userId'"
    );
    
    if (result[0].length === 0) {
      console.log("Adding userId column to loans table...");
      await db.execute("ALTER TABLE `loans` ADD `userId` int NOT NULL DEFAULT 1");
      console.log("✓ userId column added successfully");
      
      // Update existing records to have userId = 1 (admin user)
      await db.execute("UPDATE `loans` SET `userId` = 1 WHERE `userId` IS NULL");
      console.log("✓ Existing loans updated with userId = 1");
    } else {
      console.log("✓ userId column already exists");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

applyMigration();
