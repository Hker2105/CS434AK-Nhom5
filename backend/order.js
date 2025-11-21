// =========================
// JS ĐẶT HÀNG KHÔNG CẦN BACKEND
// =========================

const inputs = {
    name: document.querySelector('input[placeholder="Nhập họ và tên"]'),
    phone: document.querySelector('input[placeholder="Nhập số điện thoại"]'),
    email: document.querySelector('input[placeholder="Nhập email"]'),
    address: document.querySelector('input[placeholder="Nhập địa chỉ"]'),
    note: document.querySelector('input[placeholder="Ghi chú đơn hàng"]'),
};

const orderBtn = document.querySelector(".order-btn");
const invoiceBox = document.querySelector(".invoice-box");

const validate = () => {
    if (!inputs.name.value.trim()) return alert("Vui lòng nhập họ và tên");
    if (!inputs.phone.value.trim()) return alert("Vui lòng nhập số điện thoại");
    if (!inputs.email.value.trim()) return alert("Vui lòng nhập email");
    if (!inputs.address.value.trim()) return alert("Vui lòng nhập địa chỉ");
    return true;
};

const format = (n) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

orderBtn.addEventListener("click", () => {
    if (!validate()) return;

    const order = {
        product: "Laptop ABC",
        price: 25000000,
        shipping: 30000,
        total: 25000000 + 30000,
        name: inputs.name.value,
        phone: inputs.phone.value,
        email: inputs.email.value,
        address: inputs.address.value,
        note: inputs.note.value
    };

    // Lưu vào localStorage
    localStorage.setItem("order", JSON.stringify(order));

    // Xóa nội dung cũ
    invoiceBox.querySelectorAll(".invoice-item").forEach(e => e.remove());

    const html = `
        <div class="invoice-item"><strong>Sản phẩm:</strong> ${order.product}</div>
        <div class="invoice-item"><strong>Giá:</strong> ${format(order.price)}</div>
        <div class="invoice-item"><strong>Phí ship:</strong> ${format(order.shipping)}</div>
        <div class="invoice-item"><strong>Tổng cộng:</strong> ${format(order.total)}</div>
        <div class="invoice-item"><strong>Tên:</strong> ${order.name}</div>
        <div class="invoice-item"><strong>SĐT:</strong> ${order.phone}</div>
        <div class="invoice-item"><strong>Email:</strong> ${order.email}</div>
        <div class="invoice-item"><strong>Địa chỉ:</strong> ${order.address}</div>
        <div class="invoice-item"><strong>Ghi chú:</strong> ${order.note}</div>
    `;

    invoiceBox.insertAdjacentHTML("beforeend", html);

    alert("Đặt hàng thành công!");
});
