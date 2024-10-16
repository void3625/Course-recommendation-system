const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg'); // 引入 pg 模組中的 Pool

const app = express();
const port = 3000;

app.use(cors()); // 允許跨域請求
app.use(bodyParser.json()); // 使用 body-parser 來解析 JSON 請求

// 配置 PostgreSQL 連接池
const pool = new Pool({
    user: 'postgres', // 你的 PostgreSQL 用戶名
    host: 'localhost', // 伺服器位址 (如果是本地資料庫，則使用 localhost)
    database: 'usermanagement', // 你的資料庫名稱
    password: '123', // 你的資料庫密碼
    port: 5432, // PostgreSQL 的默認端口號
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
