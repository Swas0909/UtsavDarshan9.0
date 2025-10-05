const { Pool } = require('pg');

const pool = new Pool({
  database: "utsavdarshan",
  user: "postgres",
  password: "swas1234",
  host: "localhost",
  port: "9000"
});

async function updateAdmins() {
  try {
    const result = await pool.query(
      `UPDATE users SET is_admin = true 
       WHERE email IN ('amolwfh20@gmail.com', 'jagtapmanish146@gmail.com') 
       RETURNING *`
    );
    console.log('Updated users:', result.rows);
  } catch (err) {
    console.error('Error updating admin users:', err);
  } finally {
    await pool.end();
  }
}

updateAdmins();