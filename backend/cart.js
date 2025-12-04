document.addEventListener("DOMContentLoaded", () => {
    
    const cartItems = [];

    const cartContainer = document.querySelector(".info_cart-title"); 
    const SHIPPING_FEE = 200000;

    
    let cartRowsContainer = document.createElement("div");
    cartRowsContainer.classList.add("cart-rows-container");
    cartContainer.parentNode.appendChild(cartRowsContainer);

    const totalPriceElem = document.querySelector(".total_price-number");
    const costCartElems = document.querySelectorAll(".cost_cart-number");

    
    function renderCart() {
        cartRowsContainer.innerHTML = "";

        if(cartItems.length === 0){
            
            totalPriceElem.textContent = "0 VNĐ";
            if(costCartElems.length >= 2){
                costCartElems[0].textContent = "0 VNĐ"; 
                costCartElems[1].textContent = SHIPPING_FEE.toLocaleString() + " VNĐ"; 
            }
            return;
        }

      
        cartItems.forEach((item, index) => {
            const row = document.createElement("div");
            row.classList.add("cart_row");
            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.marginTop = "10px";

            row.innerHTML = `
                <div style="width:150px;">${item.name}</div>
                <div style="width:120px;">${item.price.toLocaleString()} VNĐ</div>
                <div style="width:100px;">
                    <input type="number" min="1" value="${item.quantity}" class="qty-input" data-index="${index}" style="width:50px;">
                </div>
                <div style="width:120px;" class="item-total">${(item.price * item.quantity).toLocaleString()} VNĐ</div>
                <div style="width:60px;">
                    <button class="btn-remove" data-index="${index}">Xóa</button>
                </div>
            `;
            cartRowsContainer.appendChild(row);
        });

        updateTotal();
        attachEvents();
    }
  
    function updateTotal() {
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if(costCartElems.length >= 2){
            costCartElems[0].textContent = subtotal.toLocaleString() + " VNĐ";
            costCartElems[1].textContent = SHIPPING_FEE.toLocaleString() + " VNĐ";
        }
        totalPriceElem.textContent = (subtotal + SHIPPING_FEE).toLocaleString() + " VNĐ";
    }

    function attachEvents() {
        document.querySelectorAll(".qty-input").forEach(input => {
            input.addEventListener("change", e => {
                const idx = e.target.dataset.index;
                let val = parseInt(e.target.value);
                if(val < 1) val = 1;
                cartItems[idx].quantity = val;
                renderCart();
            });
        });

        document.querySelectorAll(".btn-remove").forEach(btn => {
            btn.addEventListener("click", e => {    
                const idx = e.target.dataset.index;
                cartItems.splice(idx, 1);
                renderCart();
            });
        });
    }

    const checkoutBtn = document.querySelector(".button_buy");
    checkoutBtn.addEventListener("click", () => {
        if(cartItems.length === 0){
            alert("Bạn chưa nhập sản phẩm vào!");
        } else {
            alert("Đang tiến hành thanh toán...");
        }
    });

    const exitBtn = document.querySelector(".out-right");

    exitBtn.addEventListener("click", () => {
        const confirmExit = confirm("Bạn có muốn thoát khỏi trang này không?");
        if (confirmExit) {
            window.location.href = "index.html";
        }
    });

    renderCart();
});

