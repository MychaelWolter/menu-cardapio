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
    const description = card.querySelector('.menu-description');
    
    card.classList.remove("active", "left", "right");

    if (index === currentMenuIndex) {
      card.classList.add("active");
      // Card ativo - mostra a descrição
      if (description) description.style.display = "block";
    } else if (index === (currentMenuIndex - 1 + totalCards) % totalCards) {
      card.classList.add("left");
      // Card à esquerda - oculta descrição
      if (description) description.style.display = "none";
    } else if (index === (currentMenuIndex + 1) % totalCards) {
      card.classList.add("right");
      // Card à direita - oculta descrição
      if (description) description.style.display = "none";
    } else {
      // Cards não visíveis - oculta descrição
      if (description) description.style.display = "none";
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

  if (isNaN(id) || isNaN(quantity) || quantity < 1) {
    showAlert("Por favor, insira valores válidos para ID e quantidade.");
    return;
  }

  if (!menuItems[id]) {
    showAlert("Item inválido. Verifique o ID do item.");
    return;
  }

  const menuItem = menuItems[id];
  const existingItemIndex = orderItems.findIndex(
    (item) => item.menuItem === menuItem._id
  );

  if (existingItemIndex !== -1) {
    orderItems[existingItemIndex].quantity += quantity;
  } else {
    orderItems.push({
      menuItem: menuItem._id,
      quantity,
      name: menuItem.name,
      price: menuItem.price,
    });
  }

  updateOrderCarousel();
  updateTotal();

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

  if (orderItems.length === 0) {
    currentOrderIndex = 0;
  }
}

// ===== CONFIGURAÇÃO DE EVENT LISTENERS =====
function setupEventListeners() {
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

  addItemBtn.addEventListener("click", addItemToOrder);
  clearOrderBtn.addEventListener("click", clearOrder);
  sendOrderBtn.addEventListener("click", sendOrder);

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../index.html";
  });

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

// ============================================================
// ===== EXPORTAR FUNÇÕES PARA O SISTEMA DE GESTOS (SEGURO) ====
// ============================================================

window.addItemToOrder = addItemToOrder;
window.sendOrder = sendOrder;
window.clearOrder = clearOrder;

// Expor atualizações
window.updateMenuCarousel = updateMenuCarousel;
window.updateOrderCarousel = updateOrderCarousel;
window.updateTotal = updateTotal;

// Alternar carrossel para gestos
window.setActiveCarousel = function (name) {
  if (name === "menu") {
    updateMenuCarousel();
  } else {
    updateOrderCarousel();
  }
};

// Remover item atual (para gestures.js)
window.deleteCurrentOrderItem = function () {
  if (orderItems.length > 0) {
    const removed = orderItems.splice(currentOrderIndex, 1);

    updateOrderCarousel();
    updateTotal();

    if (removed[0]) {
      const u = new SpeechSynthesisUtterance(
        `Item ${removed[0].name} removido do pedido`
      );
      u.lang = "pt-BR";
      speechSynthesis.speak(u);
    }
  } else {
    const u = new SpeechSynthesisUtterance("Nenhum item para remover");
    u.lang = "pt-BR";
    speechSynthesis.speak(u);
  }
};

window.addItemFromGesture = function () {
  const id = currentMenuIndex;        // item atual do cardápio
  const quantity = 1;                 // sempre 1 unidade para gestos

  const menuItem = menuItems[id];
  if (!menuItem) {
    console.warn("Item inválido no gesto.");
    return;
  }

  // Verifica se já existe no pedido
  const existingItemIndex = orderItems.findIndex(
    (item) => item.menuItem === menuItem._id
  );

  if (existingItemIndex !== -1) {
    // soma +1
    orderItems[existingItemIndex].quantity += 1;
  } else {
    // adiciona novo item
    orderItems.push({
      menuItem: menuItem._id,
      quantity: 1,
      name: menuItem.name,
      price: menuItem.price,
    });
  }

  // Atualiza UI
  updateOrderCarousel();
  updateTotal();

  // Fala para o usuário
  const u = new SpeechSynthesisUtterance(
    `${menuItem.name} adicionado, quantidade 1`
  );
  u.lang = "pt-BR";
  speechSynthesis.speak(u);
};

// ============================================================
// =====  GETTERS / SETTERS SEGUROS PARA GESTURE.JS  ==========
// ============================================================

Object.defineProperty(window, "currentMenuIndex", {
  get() {
    return currentMenuIndex;
  },
  set(v) {
    currentMenuIndex = v;
  },
});

Object.defineProperty(window, "currentOrderIndex", {
  get() {
    return currentOrderIndex;
  },
  set(v) {
    currentOrderIndex = v;
  },
});

Object.defineProperty(window, "menuItems", {
  get() {
    return menuItems;
  },
});

Object.defineProperty(window, "orderItems", {
  get() {
    return orderItems;
  },
});

// Utilitários opcionais para sincronizar interface
window.forceMenuUpdate = function () {
  updateMenuCarousel();
};

window.forceOrderUpdate = function () {
  updateOrderCarousel();
};
