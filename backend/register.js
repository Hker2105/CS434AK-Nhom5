document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registerForm");

    if (!form) {
        console.error("Không tìm thấy form với id='registerForm'");
        return;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(this));
        console.log("Dữ liệu đăng ký:", data);

        // Kiểm tra mật khẩu khớp
        if (data.password !== data.repassword) {
            alert("Mật khẩu không khớp!");
            return;
        }

        // Kiểm tra mật khẩu hợp lệ
        if (data.password.length < 6) {
            alert("Mật khẩu phải từ 6 ký tự trở lên!");
            return;
        }

        // Lấy danh sách user từ localStorage
        let users = JSON.parse(localStorage.getItem("users") || "[]");

        // Kiểm tra username trùng
        if (users.some(u => u.username === data.username)) {
            alert("Tên đăng nhập đã tồn tại!");
            return;
        }

        // Kiểm tra email trùng
        if (users.some(u => u.email === data.email)) {
            alert("Email đã tồn tại!");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert("Email không hợp lệ!");
            return;
        }

        // Kiểm tra số điện thoại trùng
        if (users.some(u => u.phone === data.phone)) {
            alert("Số điện thoại đã được sử dụng!");
            return;
        }


        // Kiểm tra số điện hợp lệ
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(data.phone)) {
            alert("Số điện thoại không hợp lệ!");
            return;
        }


        // Tạo user object chuẩn
        const newUser = {
            id: Date.now(),
            username: data.username,
            fullname: data.fullname,
            phone: data.phone,
            address: {
                address1: data.address1,
                address2: data.address2,
                address3: data.address3,
                address4: data.address4
            },
            email: data.email,
            gender: data.gender,
            password: data.password
        };

        // Thêm user mới
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        // Lưu user hiện tại vào localStorage (để dùng cho login & hiển thị)
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        // Thông báo thành công
        alert("Đăng ký thành công!");

        // Reset form
        this.reset();

        // Chuyển sang trang login
        window.location.href = "login.html";
    });
    
    // Thoát về trang chủ
    const exitBtn = document.querySelector(".out-right");

    exitBtn.addEventListener("click", () => {
        const confirmExit = confirm("Bạn có muốn thoát khỏi trang này không?");
        if (confirmExit) {
            window.location.href = "index.html";
        }
    });

});
