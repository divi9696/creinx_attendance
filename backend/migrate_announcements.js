const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Adding targeted announcement columns...');
    
    // Add target_type
    try {
      await connection.query("ALTER TABLE announcements ADD COLUMN target_type ENUM('all', 'department', 'individual') DEFAULT 'all'");
      console.log('Added target_type column');
    } catch (e) { console.log('target_type already exists or error:', e.message); }

    // Add target_group
    try {
      await connection.query("ALTER TABLE announcements ADD COLUMN target_group VARCHAR(255) NULL");
      console.log('Added target_group column');
    } catch (e) { console.log('target_group already exists or error:', e.message); }

    // Add target_user_id
    try {
      await connection.query("ALTER TABLE announcements ADD COLUMN target_user_id INT NULL");
      console.log('Added target_user_id column');
    } catch (e) { console.log('target_user_id already exists or error:', e.message); }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
