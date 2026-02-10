const mysql = require('mysql2/promise');

async function checkClinicians() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'haider1234',
    database: 'rpm_db'
  });

  try {
    const [rows] = await pool.query('SELECT id, username, role FROM users WHERE role = "clinician"');
    console.log('Clinicians:', rows);
    
    if (rows.length === 0) {
      console.log('No clinicians found. Checking all users:');
      const [allUsers] = await pool.query('SELECT id, username, role FROM users');
      console.log('All users:', allUsers);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkClinicians();

