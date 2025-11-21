// server.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Thay đổi theo domain của frontend
  credentials: true
}));

app.use(session({
  secret: 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Đặt true nếu dùng HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 giờ
  }
}));

// Giả lập database (trong thực tế nên dùng MongoDB, MySQL, etc.)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$XQ3jXKzPwqhYfWZGXVJxvO.W8qvKGKJHG0xnhKxUHRl5QHKlPbqOW', // password: admin123
    email: 'admin@g5laptop.com'
  }
];

// JWT Secret
const JWT_SECRET = 'your-jwt-secret-key-change-this';

// Hàm tạo mã CAPTCHA đơn giản
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let captcha = '';
  for (let i = 0; i < 4; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

// API: Lấy mã CAPTCHA mới
app.get('/api/captcha', (req, res) => {
  const captcha = generateCaptcha();
  req.session.captcha = captcha;
  
  res.json({
    success: true,
    captcha: captcha
  });
});

// API: Đăng nhập
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, captcha, remember } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password || !captcha) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Kiểm tra CAPTCHA
    if (captcha.toLowerCase() !== req.session.captcha?.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác nhận không đúng'
      });
    }

    // Tìm user trong database
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Tạo JWT token
    const tokenExpiry = remember ? '30d' : '24h';
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Lưu thông tin user vào session
    req.session.userId = user.id;
    req.session.username = user.username;

    // Tạo CAPTCHA mới cho lần đăng nhập tiếp theo
    req.session.captcha = generateCaptcha();

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
});

// API: Đăng ký tài khoản mới
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Kiểm tra username đã tồn tại
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      email
    };

    users.push(newUser);

    res.json({
      success: true,
      message: 'Đăng ký thành công'
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
});

// Middleware xác thực JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    req.user = user;
    next();
  });
}

// API: Lấy thông tin user (cần xác thực)
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy user'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

// API: Đăng xuất
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi đăng xuất'
      });
    }
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});

// Export để testing
module.exports = app;
