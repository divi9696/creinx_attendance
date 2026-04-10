const mysql = require('mysql2/promise');
require('dotenv').config();

async function deepFix() {
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

    console.log('🔄 DEEP CLEANING Foreign Keys...');

    // Get ALL fks referencing employees
    const [fks] = await conn.query(`
      SELECT TABLE_NAME, CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME = 'employees'
    `);

    for (const fk of fks) {
        console.log(`Dropping ${fk.CONSTRAINT_NAME} from ${fk.TABLE_NAME}...`);
        try { await conn.query(`ALTER TABLE ${fk.TABLE_NAME} DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``); } catch(e) {}
    }

    // Rewrite them with CASCADE or SET NULL
    console.log('Writing fresh constraints...');
    
    // Attendace -> Employee
    await conn.query('ALTER TABLE attendance ADD CONSTRAINT fk_att_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE');
    
    // Leave -> Employee (Requester)
    await conn.query('ALTER TABLE leave_requests ADD CONSTRAINT fk_leave_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE');
    
    // Leave -> Employee (Reviewer) - SET NULL so we don't lose the request if admin is deleted
    await conn.query('ALTER TABLE leave_requests ADD CONSTRAINT fk_leave_rev FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL');

    console.log('🚀 SUCCESS: You can now delete any employee, even if they are an Admin!');

  } catch (err) {
    console.error('FAIL:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

deepFix();
