const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  database: "utsavdarshan",
  user: "postgres",
  password: "swas1234",
  host: "localhost",
  port: "9000"
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};