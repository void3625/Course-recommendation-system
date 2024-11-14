// 引入必要的模組
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); // 引入用戶相關的路由
require('dotenv').config(); // 加載 .env 文件中的環境變量
const path = require('path');

// 創建 Express 應用程序
const app = express();
const port = 3000;

// 使用中間件
app.use(cors()); // 允許跨域請求
app.use(bodyParser.json()); // 使用 body-parser 來解析 JSON 請求

// 提供靜態資源
app.use(express.static(path.join(__dirname, 'public')));

// 設置根路徑的處理方式，使其返回 login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// 使用用戶路由
app.use('/api/users', userRoutes);

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

