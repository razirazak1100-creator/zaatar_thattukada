/* ===================================================
   Zaatar Thattukada Restaurant - Interactive Scripts
   =================================================== */

// Global Cart State
let cart = [];
const RESTAURANT_WHATSAPP = "971503609647";

// DOM Elements
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartCount = document.getElementById("cartCount");
const cartItemsList = document.getElementById("cartItemsList");
const cartSubtotal = document.getElementById("cartSubtotal");
const checkoutWhatsappBtn = document.getElementById("checkoutWhatsappBtn");
const filterBtns = document.querySelectorAll(".filter-btn");
const menuCards = document.querySelectorAll(".menu-card");
const toastNotice = document.getElementById("toastNotice");

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS (Animate on Scroll)
  if (typeof AOS !== "undefined") {
    AOS.init({
      once: true,
      duration: 800,
      offset: 60
    });
  }

  setupEventListeners();
});

function setupEventListeners() {
  // Mobile Nav Toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    // Close mobile nav on item click
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
    });
  }

  // Cart Drawer open/close
  openCartBtn.addEventListener("click", openCart);
  closeCartBtn.addEventListener("click", closeCart);
  cartBackdrop.addEventListener("click", closeCart);

  // Category Filtering
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedCategory = btn.getAttribute("data-filter");

      menuCards.forEach(card => {
        if (selectedCategory === "all" || card.getAttribute("data-category") === selectedCategory) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // WhatsApp Checkout Trigger
  checkoutWhatsappBtn.addEventListener("click", sendWhatsAppOrder);
}

// ---------------- Cart Actions ----------------

function openCart() {
  cartDrawer.classList.add("open");
  cartBackdrop.classList.add("open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartBackdrop.classList.remove("open");
}

function addToCart(name, price, img) {
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      name: name,
      price: price,
      img: img,
      qty: 1
    });
  }

  updateCartUI();
  showToast(`${name} added to your tray!`);
}

function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.name !== name);
  }

  updateCartUI();
}

function updateCartUI() {
  // Update badge count
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalCount;

  // Calculate Total
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  cartSubtotal.textContent = `AED ${subtotal}`;

  // Enable/Disable Checkout Button
  checkoutWhatsappBtn.disabled = cart.length === 0;

  // Render Items List
  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div class="empty-cart-state">
        <i class="fa-solid fa-bowl-food"></i>
        <p>Your tray is empty.</p>
        <span>Add some delicious items from our menu!</span>
      </div>
    `;
    return;
  }

  cartItemsList.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <span class="item-cost">AED ${item.price * item.qty}</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${item.name}', -1)">-</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
      </div>
    </div>
  `).join("");
}

// ---------------- WhatsApp Order Formatter ----------------

function sendWhatsAppOrder() {
  if (cart.length === 0) return;

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  let message = `*NEW ORDER - ZAATAR THATTUKADA*\n`;
  message += `----------------------------\n`;
  
  cart.forEach((item, index) => {
    message += `${index + 1}. *${item.name}* x ${item.qty} = AED ${item.price * item.qty}\n`;
  });

  message += `----------------------------\n`;
  message += `*Total Amount:* AED ${total}\n\n`;
  message += `Please confirm my order and share the preparation time. Thank you!`;

  const encodedUrl = `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(encodedUrl, "_blank");
}

// ---------------- Quick View Modal ----------------

let currentModalItem = null;

function openDishModal(title, priceStr, description, imgSrc) {
  const modal = document.getElementById("dishModal");
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalPrice").innerText = priceStr;
  document.getElementById("modalDesc").innerText = description;
  document.getElementById("modalImg").src = imgSrc;

  const numericPrice = parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
  currentModalItem = { name: title, price: numericPrice, img: imgSrc };

  const addBtn = document.getElementById("modalAddBtn");
  addBtn.onclick = () => {
    addToCart(currentModalItem.name, currentModalItem.price, currentModalItem.img);
    closeDishModal();
  };

  modal.classList.add("open");
}

function closeDishModal() {
  const modal = document.getElementById("dishModal");
  modal.classList.remove("open");
}

// Close Modal when clicking outside the card
document.getElementById("dishModal").addEventListener("click", (e) => {
  if (e.target.id === "dishModal") {
    closeDishModal();
  }
});

// ---------------- Toast Notification ----------------

let toastTimeout;
function showToast(text) {
  clearTimeout(toastTimeout);
  toastNotice.textContent = text;
  toastNotice.classList.add("show");

  toastTimeout = setTimeout(() => {
    toastNotice.classList.remove("show");
  }, 2400);
}