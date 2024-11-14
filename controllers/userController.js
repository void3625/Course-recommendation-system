const pool = require('../config/db');

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "users" WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: '用戶不存在' });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(400).json({ success: false, message: '密碼錯誤' });
    }

    res.json({ success: true, message: '登入成功' });
  } catch (error) {
    console.error('資料庫錯誤:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤，請稍後再試。' });
  }
};
