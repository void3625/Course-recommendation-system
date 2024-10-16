const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg'); // 引入 pg 模組中的 Pool
require('dotenv').config(); // 加載 .env 文件中的環境變量
const app = express();
const port = 3000;

app.use(cors()); // 允許跨域請求
app.use(bodyParser.json()); // 使用 body-parser 來解析 JSON 請求

// 設置資料庫連接配置
const pool = new Pool({
    user: process.env.DB_USER,      // 使用環境變量
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

// 測試連接是否成功
pool.connect((err, client, done) => {
    if (err) {
      console.error('資料庫連接失敗', err);
    } else {
      console.log('資料庫連接成功');
      done(); // 關閉連接
    }
  });
  
// 定義登入的 API
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      // 使用正確的表名和雙引號
      const result = await pool.query('SELECT * FROM "user" WHERE username = $1', [username]);
      
      if (result.rows.length === 0) {
          return res.status(400).json({ success: false, message: '用戶不存在' });
      }

      const user = result.rows[0];

      // 驗證密碼
      if (user.password !== password) {
          return res.status(400).json({ success: false, message: '密碼錯誤' });
      }

      res.json({ success: true, message: '登入成功' });
  } catch (err) {
      console.error('資料庫錯誤:', err);
      res.status(500).json({ success: false, message: '伺服器錯誤，請稍後再試。' });
  }
});



// 啟動伺服器
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
