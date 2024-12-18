
// 引入必要的模組
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); // 引入用戶相關的路由
require('dotenv').config(); // 加載 .env 文件中的環境變量
const path = require('path');
const { Pool } = require('pg'); // 確保引入 pg 模組以建立資料庫連接池
// 創建 Express 應用程序
const { spawn } = require('child_process'); // 用於啟動子進程
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

// 啟動 backend 資料夾中的 app.py 子進程
const pythonProcess = spawn('python', ['backend/app.py']);

pythonProcess.stdout.on('data', (data) => {
  console.log(`app.py stdout: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`app.py stderr: ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`app.py process exited with code ${code}`);
});


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
          'UPDATE public.users SET "mbti" = $1, "ceec" = $2 WHERE id = $3',
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


// 獲取課程數據並檢查是否收藏
app.get('/api/courses', isAuthenticated, async (req, res) => {
    const userId = req.session.user.id;

    try {
        const courses = await pool.query('SELECT * FROM public.courses');
        const favorites = await pool.query(
            'SELECT course_id FROM collection WHERE user_id = $1',
            [userId]
        );

        const favoriteIds = favorites.rows.map(fav => fav.course_id);

        // 在每個課程中新增 is_favorited 屬性
        const coursesWithFavorites = courses.rows.map(course => ({
            ...course,
            is_favorited: favoriteIds.includes(course.id),
        }));

        res.json(coursesWithFavorites);
    } catch (error) {
        console.error('Error fetching courses with favorites:', error);
        res.status(500).json({ error: 'Error fetching courses' });
    }
});




// 儲存收藏課程API
app.post('/api/courses/collect', isAuthenticated, async (req, res) => {
    const userId = req.session.user.id;
    const { course_id, course_name, MBTI_type, CEEC_type, link, category } = req.body;

    // 檢查 course_name 是否存在
    if (!course_name) {
        return res.status(400).json({ error: '缺少課程名稱，無法收藏課程' });
    }

    try {
        // 檢查是否已存在收藏
        const existing = await pool.query(
            `SELECT * FROM collection WHERE user_id = $1 AND course_id = $2`,
            [userId, course_id]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: '課程已收藏' });
        }

        // 插入新的收藏記錄
        const result = await pool.query(
            `INSERT INTO collection (course_id, course_name, MBTI_type, CEEC_type, link, category, user_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [course_id, course_name, MBTI_type, CEEC_type, link, category, userId]
        );

        res.status(200).json({ message: '收藏成功', collection: result.rows[0] });
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
app.delete('/api/courses/favorites/:course_id', isAuthenticated, async (req, res) => {
    const userId = req.session.user.id;
    const { course_id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM collection WHERE course_id = $1 AND user_id = $2',
            [course_id, userId]
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

// 個人資料路由
app.get('/api/user/personality', async (req, res) => {
  // 確認用戶是否登入
  if (!req.session.user) {
      console.error('未檢測到會話或用戶資料');
      return res.status(401).json({ error: '尚未登入' });
  }

  const userId = req.session.user.id;

  try {
      // 查詢 MBTI 和 CEEC
      const result = await pool.query(
          'SELECT "mbti", "ceec" FROM users WHERE id = $1',
          [userId]
      );

      if (result.rows.length > 0) {
          const { mbti, ceec } = result.rows[0];
          res.json({
              mbti: mbti || '未指定', // 添加預設值
              ceec: ceec ? ceec.split(',') : [] // 確保返回空數組
          });
      } else {
          res.status(404).json({ error: '用戶資料未找到' });
      }
  } catch (err) {
      console.error('資料庫查詢錯誤:', err.message);
      res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});