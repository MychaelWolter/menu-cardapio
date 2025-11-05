// Elementos do DOM
const addItemBtn = document.getElementById("addItem");
const sendOrderBtn = document.getElementById("sendOrder");
const clearOrderBtn = document.getElementById("clearOrder");
const currentTableSpan = document.getElementById("currentTable");
const logoutBtn = document.getElementById("logoutBtn");
const totalAmountSpan = document.getElementById("totalAmount");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.querySelector(".theme-icon");

// Variáveis de estado
let menuItems = [];
let orderItems = [];
let currentMenuIndex = 0;
let currentOrderIndex = 0;

// ===== CONTROLE DE TEMA =====
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    document.body.classList.add("dark-mode");
    themeIcon.textContent = "☀️";
  } else {
    document.body.classList.remove("dark-mode");
    themeIcon.textContent = "🌙";
  }
}

// Alternar tema
themeToggle.addEventListener("click", () => {
  if (document.body.classList.contains("dark-mode")) {
    document.body.classList.remove("dark-mode");
    themeIcon.textContent = "🌙";
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.add("dark-mode");
    themeIcon.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  }
});

// ===== INICIALIZAÇÃO DA PÁGINA =====
function initializePage() {
  initializeTheme();
  initializeTableNumber();
  loadMenu();
  initializeOrderCarousel();
  setupEventListeners();
}

// Obter número da mesa do token
function initializeTableNumber() {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const tableNumber = payload.tableNumber;
      currentTableSpan.textContent = tableNumber;
    }
  } catch (error) {
    console.error("Erro ao obter número da mesa:", error);
    currentTableSpan.textContent = "?";
  }
}

// ===== CARREGAR CARDÁPIO =====
async function loadMenu() {
  try {
    menuItems = await apiGet("/menu");
    renderMenuCarousel();
    initializeMenuNavigation();
    announceMenuWithVoice();
  } catch (error) {
    console.error("Erro ao carregar cardápio:", error);
    showError("Erro ao carregar cardápio. Tente novamente.");
  }
}

function renderMenuCarousel() {
  const carousel = document.getElementById("menuCarousel");
  carousel.innerHTML = "";

  menuItems.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("menu-card");
    card.innerHTML = `
      <div class="card-image-container">
        <img src="${
          item.image || "https://via.placeholder.com/280x180?text=Sem+Imagem"
        }" 
             alt="${item.name}" 
             class="menu-card-img" />
      </div>
      <h4>${index + 1}. ${item.name}</h4>
      <p class="menu-description">${
        item.description || "Sem descrição disponível."
      }</p>
      <p><strong>R$ ${item.price.toFixed(2)}</strong></p>
    `;
    carousel.appendChild(card);
  });

  updateMenuCarousel();
}

function initializeMenuNavigation() {
  const prevBtn = document.querySelector(".menu-carousel .carousel-btn.prev");
  const nextBtn = document.querySelector(".menu-carousel .carousel-btn.next");

  prevBtn.addEventListener("click", () => {
    currentMenuIndex =
      (currentMenuIndex - 1 + menuItems.length) % menuItems.length;
    updateMenuCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentMenuIndex = (currentMenuIndex + 1) % menuItems.length;
    updateMenuCarousel();
  });
}

function updateMenuCarousel() {
  const cards = document.querySelectorAll(".menu-card");
  const totalCards = cards.length;

  cards.forEach((card, index) => {
    card.classList.remove("active", "left", "right");

    if (index === currentMenuIndex) {
      card.classList.add("active");
    } else if (index === (currentMenuIndex - 1 + totalCards) % totalCards) {
      card.classList.add("left");
    } else if (index === (currentMenuIndex + 1) % totalCards) {
      card.classList.add("right");
    }
  });
}

// ===== LEITOR DE VOZ DO CARDÁPIO =====
function announceMenuWithVoice() {
  const synth = window.speechSynthesis;
  const menuText = menuItems
    .map(
      (item) =>
        `${item.name}, ${item.description || ""}, preço ${item.price.toFixed(
          2
        )} reais.`
    )
    .join(". ");

  const utterance = new SpeechSynthesisUtterance(menuText);
  utterance.lang = "pt-BR";
  synth.speak(utterance);
}

// ===== CARROSSEL DO PEDIDO =====
function initializeOrderCarousel() {
  updateOrderCarousel();
}

function updateOrderCarousel() {
  const carousel = document.getElementById("orderCarousel");
  carousel.innerHTML = "";

  if (orderItems.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.classList.add("empty-order-message");
    emptyMessage.textContent = "🛒 Nenhum item no pedido";
    carousel.appendChild(emptyMessage);
    return;
  }

  orderItems.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("order-card");

    // Buscar a imagem original do item no cardápio
    const menuItem = menuItems.find(
      (menuItem) => menuItem._id === item.menuItem
    );
    const itemImage =
      menuItem?.image || "https://via.placeholder.com/280x180?text=Sem+Imagem";
    const subtotal = item.price * item.quantity;

    card.innerHTML = `
      <div class="card-image-container">
        <img src="${itemImage}" 
             alt="${item.name}" 
             class="menu-card-img" />
        <div class="order-quantity-badge">${item.quantity}x</div>
      </div>
      <h4>${item.name}</h4>
      <p class="order-quantity">Quantidade: ${item.quantity}</p>
      <p class="order-price">R$ ${item.price.toFixed(2)} cada</p>
      <p class="order-subtotal">Subtotal: R$ ${subtotal.toFixed(2)}</p>
    `;
    carousel.appendChild(card);
  });

  updateOrderCarouselNavigation();
}

function getItemIcon(itemName) {
  const name = itemName.toLowerCase();
  if (
    name.includes("bebida") ||
    name.includes("suco") ||
    name.includes("refri")
  )
    return "🥤";
  if (
    name.includes("prato") ||
    name.includes("comida") ||
    name.includes("arroz")
  )
    return "🍽️";
  if (
    name.includes("sobremesa") ||
    name.includes("doce") ||
    name.includes("bolo")
  )
    return "🍰";
  if (name.includes("café") || name.includes("cafe")) return "☕";
  if (name.includes("salada")) return "🥗";
  if (name.includes("hambúrguer") || name.includes("burger")) return "🍔";
  if (name.includes("pizza")) return "🍕";
  return "📦";
}

function updateOrderCarouselNavigation() {
  const cards = document.querySelectorAll(".order-card");
  const totalCards = cards.length;

  if (totalCards === 0) return;

  cards.forEach((card, index) => {
    card.classList.remove("active", "left", "right");

    if (index === currentOrderIndex) {
      card.classList.add("active");
    } else if (index === (currentOrderIndex - 1 + totalCards) % totalCards) {
      card.classList.add("left");
    } else if (index === (currentOrderIndex + 1) % totalCards) {
      card.classList.add("right");
    }
  });
}

// ===== CONTROLE DO PEDIDO =====
function addItemToOrder() {
  const itemIdInput = document.getElementById("itemId");
  const quantityInput = document.getElementById("quantity");

  const id = parseInt(itemIdInput.value) - 1;
  const quantity = parseInt(quantityInput.value);

  // Validação
  if (isNaN(id) || isNaN(quantity) || quantity < 1) {
    showAlert("Por favor, insira valores válidos para ID e quantidade.");
    return;
  }

  if (!menuItems[id]) {
    showAlert("Item inválido. Verifique o ID do item.");
    return;
  }

  // Adicionar item ao pedido
  const menuItem = menuItems[id];
  orderItems.push({
    menuItem: menuItem._id,
    quantity,
    name: menuItem.name,
    price: menuItem.price,
  });

  // Atualizar interface
  updateOrderCarousel();
  updateTotal();

  // Limpar campos
  itemIdInput.value = "";
  quantityInput.value = "";
  itemIdInput.focus();
}

function clearOrder() {
  orderItems = [];
  currentOrderIndex = 0;
  updateOrderCarousel();
  updateTotal();
}

async function sendOrder() {
  if (orderItems.length === 0) {
    showAlert("Nenhum item adicionado ao pedido!");
    return;
  }

  try {
    const tableNumber = currentTableSpan.textContent;
    await apiPost("/orders", {
      tableNumber,
      items: orderItems.map(({ menuItem, quantity }) => ({
        menuItem,
        quantity,
      })),
    });

    showSuccess("Pedido enviado com sucesso!");
    clearOrder();
  } catch (error) {
    console.error("Erro ao enviar pedido:", error);
    showError("Erro ao enviar pedido. Tente novamente.");
  }
}

function updateTotal() {
  const total = orderItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  totalAmountSpan.textContent = total.toFixed(2);

  // Resetar índice do carrossel se não há itens
  if (orderItems.length === 0) {
    currentOrderIndex = 0;
  }
}

// ===== CONFIGURAÇÃO DE EVENT LISTENERS =====
function setupEventListeners() {
  // Navegação do carrossel do pedido
  document.addEventListener("click", (event) => {
    if (
      event.target.classList.contains("order-next") ||
      event.target.closest(".order-next")
    ) {
      if (orderItems.length > 0) {
        currentOrderIndex = (currentOrderIndex + 1) % orderItems.length;
        updateOrderCarouselNavigation();
      }
    }

    if (
      event.target.classList.contains("order-prev") ||
      event.target.closest(".order-prev")
    ) {
      if (orderItems.length > 0) {
        currentOrderIndex =
          (currentOrderIndex - 1 + orderItems.length) % orderItems.length;
        updateOrderCarouselNavigation();
      }
    }
  });

  // Botões principais
  addItemBtn.addEventListener("click", addItemToOrder);
  clearOrderBtn.addEventListener("click", clearOrder);
  sendOrderBtn.addEventListener("click", sendOrder);

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../index.html";
  });

  // Enter nos campos de input
  document.getElementById("itemId").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      document.getElementById("quantity").focus();
    }
  });

  document.getElementById("quantity").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addItemToOrder();
    }
  });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", initializePage);

// ===== EXPORTAR FUNÇÕES PARA GESTOS =====
// Tornar funções disponíveis globalmente para o sistema de gestos
window.addItemToOrder = addItemToOrder;
window.sendOrder = sendOrder;

// Variáveis globais para gestos
window.menuItems = menuItems;
window.orderItems = orderItems;
window.currentMenuIndex = currentMenuIndex;
window.currentOrderIndex = currentOrderIndex;
window.updateMenuCarousel = updateMenuCarousel;
window.updateOrderCarousel = updateOrderCarousel;
window.updateTotal = updateTotal;