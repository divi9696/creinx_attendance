const mysql = require('mysql2/promise');
require('dotenv').config();

async function viewData() {
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

    console.log('\n=========================================');
    console.log('📊 CLOUD DATABASE VIEWER (AIVEN)');
    console.log('=========================================\n');

    // View Employees
    console.log('👥 EMPLOYEES');
    const [employees] = await conn.query('SELECT id, name, email, role, department, job_role, date_of_join FROM employees');
    console.table(employees);

    // View Attendance (Last 10 records)
    console.log('\n📍 ATTENDANCE (Last 10 Records)');
    const [attendance] = await conn.query(`
      SELECT a.id, e.name as employee, a.check_in, a.status, a.attendance_type 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.id 
      ORDER BY a.check_in DESC 
      LIMIT 10
    `);
    if (attendance.length > 0) {
      console.table(attendance);
    } else {
      console.log('No attendance records found.');
    }

    // View Leave Requests
    console.log('\n📅 LEAVE REQUESTS');
    const [leaves] = await conn.query(`
      SELECT l.id, e.name as employee, l.start_date, l.end_date, l.status, l.reason 
      FROM leave_requests l 
      JOIN employees e ON l.employee_id = e.id 
      ORDER BY l.requested_at DESC
    `);
    if (leaves.length > 0) {
      console.table(leaves);
    } else {
      console.log('No leave requests found.');
    }

    console.log('\n=========================================');
    console.log('✅ End of Data');
    console.log('=========================================\n');

  } catch (err) {
    console.error('\n❌ ERROR: Failed to connect to database');
    console.error(err.message);
  } finally {
    if (conn) await conn.end();
  }
}

viewData();
