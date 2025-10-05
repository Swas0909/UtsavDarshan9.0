const { Pool } = require('pg');

const pool = new Pool({
  database: "utsavdarshan",
  user: "postgres",
  password: "swas1234",
  host: "localhost",
  port: "9000"
});

async function updateAdminsAndSessions() {
  try {
    // First update the users table
    const result = await pool.query(
      `UPDATE users SET is_admin = true 
       WHERE email IN ('amolwfh20@gmail.com', 'jagtapmanish146@gmail.com') 
       RETURNING *`
    );
    console.log('Updated users:', result.rows);

    // Clear existing sessions to force users to re-login
    await pool.query(
      `DELETE FROM "session" WHERE 1=1`
    );
    console.log('Cleared all sessions');

  } catch (err) {
    console.error('Error updating admin users and sessions:', err);
  } finally {
    await pool.end();
  }
}

updateAdminsAndSessions();