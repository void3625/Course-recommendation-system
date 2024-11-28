// 引入必要的模組
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); // 引入用戶相關的路由
require('dotenv').config(); // 加載 .env 文件中的環境變量
const path = require('path');
const { Pool } = require('pg'); // 確保引入 pg 模組以建立資料庫連接池
// 創建 Express 應用程序
const app = express();
const port = 3000;
const session = require('express-session'); //啟詮的



const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',        // 替換為您的 PostgreSQL 使用者名稱
  password: process.env.DB_PASSWORD || '1234', // 替換為您的 PostgreSQL 密碼
  database: process.env.DB_NAME || 'usermanagement',
  port: process.env.DB_PORT || 5432,
});


// 使用中間件
app.use(cors()); // 允許跨域請求
app.use(bodyParser.json()); // 使用 body-parser 來解析 JSON 請求
app.use(session({
  secret: 'your_secret_key', // 替換成自己的密鑰
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // 若使用 HTTPS，將此設為 true
}));
function isAuthenticated(req, res, next) {
  if (req.session.user) {
      next();
  } else {
      res.status(401).json({ success: false, message: '尚未登入' });
  }
}
app.post('/api/data', isAuthenticated, (req, res) => {
  const userId = req.session.user.id; // 獲取當前登入用戶的 ID
  const { inputContent } = req.body;

  // 儲存用戶輸入內容到資料庫
  pool.query('INSERT INTO "user_inputs" (user_id, content) VALUES ($1, $2)', [userId, inputContent], (err) => {
      if (err) {
          console.error('資料庫錯誤:', err);
          res.status(500).json({ success: false, message: '伺服器錯誤' });
      } else {
          res.json({ success: true, message: '內容已儲存' });
      }
  });
});



// 提供靜態資源
app.use(express.static(path.join(__dirname, 'public')));

// 設置根路徑的處理方式，使其返回 login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/api/users/getUserId', (req, res) => {
  if (req.session.user) {
      res.json({ user_id: req.session.user.id });
  } else {
      res.status(401).json({ error: '尚未登入' });
  }
});


// 使用用戶路由
app.use('/api/users', userRoutes);

// 處理 POST 請求以保存使用者數據
app.post('/save-user-data', async (req, res) => {
  const { user_id, mbti, ceec_order } = req.body;
  const ceecOrderString = ceec_order.join(',');

  try {
      const result = await pool.query(
          'UPDATE public.users SET "MBTI" = $1, "CEEC" = $2 WHERE id = $3',
          [mbti, ceecOrderString, user_id]
      );
      
      if (result.rowCount > 0) {
          res.status(200).json({ message: '資料已成功儲存' });
      } else {
          res.status(404).json({ error: '找不到指定的使用者 ID' });
      }
  } catch (error) {
      console.error('儲存錯誤:', error);
      res.status(500).json({ error: '儲存資料時出錯', details: error.message });
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

