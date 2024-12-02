
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
  password: process.env.DB_PASSWORD || '123', // 替換為您的 PostgreSQL 密碼
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

// 新增：獲取課程數據的API接口
app.get('/api/courses', (req, res) => {
  pool.query('SELECT * FROM public.courses', (err, result) => {
    if (err) {
      console.error('Error fetching courses:', err);
      res.status(500).json({ error: 'Error fetching courses' });
    } else {
      res.json(result.rows);
    }
  });
});

// 儲存收藏課程API
app.post('/api/courses/collect', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id; // 獲取當前登入用戶的 ID
  const { course_name, MBTI_type, CEEC_type, link, category } = req.body;

  try {
      const result = await pool.query(
          `INSERT INTO collection (course_name, MBTI_type, CEEC_type, link, category, user_id) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [course_name, MBTI_type, CEEC_type, link, category, userId]
      );
      res.status(200).json({ message: '課程已收藏', collection: result.rows[0] });
  } catch (error) {
      console.error('收藏課程錯誤:', error);
      res.status(500).json({ error: '儲存收藏時發生錯誤' });
  }
});

// 獲取當前使用者的收藏課程
app.get('/api/courses/favorites', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;

  try {
      const result = await pool.query(
          'SELECT * FROM collection WHERE user_id = $1',
          [userId]
      );
      res.status(200).json(result.rows);
  } catch (error) {
      console.error('獲取收藏課程錯誤:', error);
      res.status(500).json({ error: '獲取收藏課程時發生錯誤' });
  }
});

// 刪除收藏的課程
app.delete('/api/courses/favorites/:id', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;

  try {
      const result = await pool.query(
          'DELETE FROM collection WHERE id = $1 AND user_id = $2',
          [id, userId]
      );

      if (result.rowCount > 0) {
          res.status(200).json({ message: '收藏已刪除' });
      } else {
          res.status(404).json({ error: '未找到對應的收藏或無權限刪除' });
      }
  } catch (error) {
      console.error('刪除收藏課程錯誤:', error);
      res.status(500).json({ error: '刪除收藏課程時發生錯誤' });
  }
});


// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
