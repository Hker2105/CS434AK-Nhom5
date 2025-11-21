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

        // Kiểm tra số điện thoại trùng
        if (users.some(u => u.phone === data.phone)) {
            alert("Số điện thoại đã được sử dụng!");
            return;
        }

        // Lưu user mới
        users.push(data);
        localStorage.setItem("users", JSON.stringify(users));

        alert("Đăng ký thành công!");

        // Reset form
        this.reset();
    });

});
