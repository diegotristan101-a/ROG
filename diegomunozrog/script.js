const cart = [];

const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const clearCartBtn = document.getElementById("clear-cart");
const checkoutCartBtn = document.getElementById("checkout-cart");

const toastElement = document.getElementById("cartToast");
const cartToast = new bootstrap.Toast(toastElement);

const addButtons = document.querySelectorAll(".add-to-cart");
const buyNowButtons = document.querySelectorAll(".buy-now");

function applySystemTheme() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-bs-theme", isDark ? "dark" : "light");
}

applySystemTheme();

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applySystemTheme);

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    const existingProduct = cart.find((item) => item.id === id);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price,
        quantity: 1
      });
    }

    renderCart();
    cartToast.show();
  });
});

buyNowButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const item = {
      id: button.dataset.id,
      name: button.dataset.name,
      price: Number(button.dataset.price),
      quantity: 1
    };

    await startCheckout([item]);
  });
});

async function startCheckout(items) {
  try {
    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ items })
    });

    if (!response.ok) {
      throw new Error("No se pudo crear la sesión de pago");
    }

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("No se recibió la URL de pago.");
    }
  } catch (error) {
    console.error(error);
    alert("Hubo un error al iniciar el pago.");
  }
}

function renderCart() {
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="text-secondary" id="empty-cart">Tu carrito está vacío.</p>`;
    cartTotal.textContent = "$0.00";
    cartCount.textContent = "0";
    return;
  }

  let total = 0;
  let totalItems = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;
    totalItems += item.quantity;

    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";

    itemElement.innerHTML = `
      <div class="d-flex justify-content-between align-items-start gap-3">
        <div>
          <div class="cart-item-title">${item.name}</div>
          <div class="text-secondary small">$${item.price.toFixed(2)} USD</div>
        </div>
        <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">
          <i class="bi bi-trash"></i>
        </button>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="qty-controls">
          <button class="qty-btn decrease-item" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn increase-item" data-id="${item.id}">+</button>
        </div>
        <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
      </div>
    `;

    cartItemsContainer.appendChild(itemElement);
  });

  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartCount.textContent = totalItems;

  activateCartButtons();
}

function activateCartButtons() {
  const increaseButtons = document.querySelectorAll(".increase-item");
  const decreaseButtons = document.querySelectorAll(".decrease-item");
  const removeButtons = document.querySelectorAll(".remove-item");

  increaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const product = cart.find((item) => item.id === id);

      if (product) {
        product.quantity += 1;
        renderCart();
      }
    });
  });

  decreaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const product = cart.find((item) => item.id === id);

      if (product) {
        product.quantity -= 1;

        if (product.quantity <= 0) {
          removeFromCart(id);
        } else {
          renderCart();
        }
      }
    });
  });

  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      removeFromCart(id);
    });
  });
}

function removeFromCart(id) {
  const index = cart.findIndex((item) => item.id === id);

  if (index !== -1) {
    cart.splice(index, 1);
    renderCart();
  }
}

clearCartBtn.addEventListener("click", () => {
  cart.length = 0;
  renderCart();
});

checkoutCartBtn.addEventListener("click", async () => {
  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  await startCheckout(cart);
});

renderCart();