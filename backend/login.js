// server.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(express.json());
app.use(cors());

// Database giả lập (trong thực tế nên dùng MongoDB, PostgreSQL, etc.)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$YourHashedPasswordHere', // password: 'admin123'
    email: 'admin@example.com'
  }
];

// Lưu trữ CAPTCHA tạm thời (trong thực tế nên dùng Redis)
const captchaStore = new Map();

// ===== API ENDPOINTS =====

// 1. Tạo CAPTCHA
app.get('/api/captcha/generate', (req, res) => {
  const captchaId = generateId();
  const captchaText = generateCaptcha();
  
  // Lưu captcha với thời gian hết hạn 5 phút
  captchaStore.set(captchaId, {
    text: captchaText,
    expiresAt: Date.now() + 5 * 60 * 1000
  });
  
  res.json({
    captchaId,
    captchaText // Trong thực tế nên trả về ảnh SVG/PNG
  });
});

// 2. API Đăng nhập
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, captcha, captchaId, rememberMe } = req.body;

    // Validate đầu vào
    if (!username || !password || !captcha || !captchaId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Kiểm tra CAPTCHA
    const storedCaptcha = captchaStore.get(captchaId);
    if (!storedCaptcha) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác nhận đã hết hạn'
      });
    }

    if (storedCaptcha.expiresAt < Date.now()) {
      captchaStore.delete(captchaId);
      return res.status(400).json({
        success: false,
        message: 'Mã xác nhận đã hết hạn'
      });
    }

    if (storedCaptcha.text.toLowerCase() !== captcha.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác nhận không đúng'
      });
    }

    // Xóa captcha đã sử dụng
    captchaStore.delete(captchaId);

    // Tìm user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra mật khẩu
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Tạo JWT token
    const tokenExpiry = rememberMe ? '7d' : '1d';
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Trả về thông tin đăng nhập thành công
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra, vui lòng thử lại'
    });
  }
});

// 3. API Đăng ký (tạo tài khoản mới)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Kiểm tra user đã tồn tại
    if (users.find(u => u.username === username)) {
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

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra, vui lòng thử lại'
    });
  }
});

// 4. Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy token'
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
};

// 5. API lấy thông tin user (cần authentication)
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy người dùng'
    });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

// ===== HELPER FUNCTIONS =====

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let captcha = '';
  for (let i = 0; i < 5; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Dọn dẹp captcha hết hạn mỗi 10 phút
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of captchaStore.entries()) {
    if (data.expiresAt < now) {
      captchaStore.delete(id);
    }
  }
}, 10 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log('\nCác API endpoints:');
  console.log('POST /api/auth/login - Đăng nhập');
  console.log('POST /api/auth/register - Đăng ký');
  console.log('GET  /api/captcha/generate - Tạo CAPTCHA');
  console.log('GET  /api/user/profile - Lấy thông tin user (cần token)');
});