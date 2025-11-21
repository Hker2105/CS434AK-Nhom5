const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// ⭐ FIX CORS HOẠT ĐỘNG VỚI FE 127.0.0.1:15501
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================= MYSQL CONNECT ==================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "g5shop"
});

db.connect(err => {
    if (err) {
        console.log("Lỗi kết nối MySQL:", err);
    } else {
        console.log("Kết nối MySQL thành công!");
    }
});

// ================= API ĐĂNG KÝ ======================
app.post("/register", (req, res) => {
    const {
        username, fullname, phone,
        address1, address2, address3, address4,
        email, gender, password, repassword
    } = req.body;

    if (password !== repassword) {
        return res.status(400).json({ message: "Mật khẩu không khớp!" });
    }

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi server!" });

        if (result.length > 0) {
            return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
        }

        db.query("SELECT * FROM users WHERE email = ?", [email], async (err2, result2) => {
            if (err2) return res.status(500).json({ message: "Lỗi server!" });

            if (result2.length > 0) {
                return res.status(400).json({ message: "Email đã tồn tại!" });
            }

            const fullAddress = `${address1}, ${address2}, ${address3}, ${address4}`;
            const hashed = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO users (username, fullname, phone, address, email, gender, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [username, fullname, phone, fullAddress, email, gender, hashed],
                err3 => {
                    if (err3) {
                        console.log(err3);
                        return res.status(500).json({ message: "Lỗi server!" });
                    }
                    return res.json({ message: "Đăng ký thành công!" });
                }
            );
        });
    });
});

// =============== RUN SERVER ===================
app.listen(3000, () => {
    console.log("Backend đang chạy tại http://localhost:3000");
});
