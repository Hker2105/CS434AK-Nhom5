const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================= KẾT NỐI MONGODB ===================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

// ================= TẠO MODEL USER ====================
const User = mongoose.model("User", new mongoose.Schema({
    username: String,
    fullname: String,
    phone: String,
    address: String,
    email: String,
    gender: String,
    password: String,
    created_at: { type: Date, default: Date.now }
}));


// ================= API ĐĂNG KÝ =======================
app.post("/api/register", async (req, res) => {
    try {
        const {
            username, fullname, phone,
            address1, address2, address3, address4,
            email, gender, password, repassword
        } = req.body;

        // 1. Kiểm tra mật khẩu
        if (password !== repassword) {
            return res.status(400).json({ message: "Mật khẩu không khớp!" });
        }

        // 2. Kiểm tra username trùng
        const existsUser = await User.findOne({ username });
        if (existsUser) {
            return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
        }

        // 3. Kiểm tra email trùng
        const existsEmail = await User.findOne({ email });
        if (existsEmail) {
            return res.status(400).json({ message: "Email đã tồn tại!" });
        }

        // 4. Gộp địa chỉ
        const fullAddress = `${address1}, ${address2}, ${address3}, ${address4}`;

        // 5. Hash mật khẩu
        const hashedPass = await bcrypt.hash(password, 10);

        // 6. Lưu vào DB
        await User.create({
            username,
            fullname,
            phone,
            address: fullAddress,
            email,
            gender,
            password: hashedPass
        });

        return res.json({ message: "Đăng ký thành công!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi server!" });
    }
});


// =============== CHẠY SERVER ==================
app.listen(3000, () => {
    console.log("Backend đang chạy tại http://localhost:3000");
});
