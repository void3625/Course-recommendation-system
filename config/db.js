const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('資料庫連接失敗:', err);
    } else {
      console.log('資料庫連接成功:', res.rows);
    }
  });
  