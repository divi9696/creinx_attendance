const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: { rejectUnauthorized: false }
    });

    console.log('--- TABLES ---');
    const [tables] = await conn.query('SHOW TABLES');
    console.log(tables);

    console.log('\n--- EMPLOYEE COLUMNS ---');
    const [cols] = await conn.query('DESCRIBE employees');
    console.table(cols);

    console.log('\n--- FOREIGN KEYS ON EMPLOYEES ---');
    const [fks] = await conn.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME = 'employees'
    `);
    console.table(fks);

  } catch (err) {
    console.error(err.message);
  } finally {
    if (conn) await conn.end();
  }
}

checkSchema();
