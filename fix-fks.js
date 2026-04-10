const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixForeignKeys() {
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

    console.log('🔗 Updating Foreign Key constraints to allow deletion...');

    // Fix Leave Requests FK
    try {
        const [fks] = await conn.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'leave_requests' AND COLUMN_NAME = 'employee_id' AND REFERENCED_TABLE_NAME = 'employees'
        `);
        for (const fk of fks) {
            await conn.query(`ALTER TABLE leave_requests DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
        }
        await conn.query('ALTER TABLE leave_requests ADD CONSTRAINT fk_leaves_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE');
        console.log('✅ Leave Requests constraints updated.');
    } catch (e) { console.error('Error updating leave_requests FK:', e.message); }

    // Fix Attendance FK
    try {
        const [fks] = await conn.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'attendance' AND COLUMN_NAME = 'employee_id' AND REFERENCED_TABLE_NAME = 'employees'
        `);
        for (const fk of fks) {
            await conn.query(`ALTER TABLE attendance DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
        }
        await conn.query('ALTER TABLE attendance ADD CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE');
        console.log('✅ Attendance constraints updated.');
    } catch (e) { console.error('Error updating attendance FK:', e.message); }

    console.log('\n🚀 ALL FIXES APPLIED!');

  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

fixForeignKeys();
