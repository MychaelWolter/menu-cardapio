const menuList = document.getElementById("menuList");
const orderList = document.getElementById("orderList");
const addItemBtn = document.getElementById("addItem");
const sendOrderBtn = document.getElementById("sendOrder");
const clearOrderBtn = document.getElementById("clearOrder");
const currentTableSpan = document.getElementById("currentTable");
const logoutBtn = document.getElementById("logoutBtn");
const totalAmountSpan = document.getElementById("totalAmount");

// Obter número da mesa do token
let tableNumber;
try {
  const token = localStorage.getItem("token");
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    tableNumber = payload.tableNumber;
    currentTableSpan.textContent = tableNumber;
  }
} catch (error) {
  console.error("Erro ao obter número da mesa:", error);
}

let menuItems = [];
let orderItems = [];
let currentIndex = 0;

// Função para calcular e atualizar o total
function updateTotal() {
  const total = orderItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  totalAmountSpan.textContent = total.toFixed(2);
}

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "../index.html";
});

// ===== Carrega o cardápio =====
async function loadMenu() {
  try {
    menuItems = await apiGet("/menu");
    const carousel = document.getElementById("menuCarousel");
    carousel.innerHTML = "";

    menuItems.forEach((item, index) => {
      const card = document.createElement("div");
      card.classList.add("menu-card");
      card.innerHTML = `
        <div class="card-image-container">
          <img src="${item.image || "https://via.placeholder.com/280x180?text=Sem+Imagem"}" alt="${item.name}" class="menu-card-img" />
        </div>
        <h4>${index + 1}. ${item.name}</h4>
        <p class="menu-description">${item.description || "Sem descrição disponível."}</p>
        <p><strong>R$ ${item.price.toFixed(2)}</strong></p>
      `;
      carousel.appendChild(card);
    });

    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");

    function updateCarousel() {
      const cards = document.querySelectorAll(".menu-card");
      const len = cards.length;

      cards.forEach((c, i) => {
        c.classList.remove("active", "left", "right");
        if (i === currentIndex) c.classList.add("active");
        if (i === (currentIndex - 1 + len) % len) c.classList.add("left");
        if (i === (currentIndex + 1) % len) c.classList.add("right");
      });
    }

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % menuItems.length;
      updateCarousel();
    });

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
      updateCarousel();
    });

    updateCarousel();

    // ===== Leitor de voz =====
    const synth = window.speechSynthesis;
    const text = menuItems
      .map(i => `${i.name}, ${i.description || ""}, preço ${i.price.toFixed(2)} reais.`)
      .join(". ");
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    synth.speak(utter);

  } catch (error) {
    console.error("Erro ao carregar cardápio:", error);
    showError("Erro ao carregar cardápio. Tente novamente.");
  }
}

// ===== Adicionar item ao pedido =====
addItemBtn.addEventListener("click", () => {
  const id = parseInt(document.getElementById("itemId").value) - 1;
  const quantity = parseInt(document.getElementById("quantity").value);

  if (isNaN(id) || isNaN(quantity) || quantity < 1) {
    showAlert("Por favor, insira valores válidos para ID e quantidade.");
    return;
  }

  if (menuItems[id]) {
    orderItems.push({
      menuItem: menuItems[id]._id,
      quantity,
      name: menuItems[id].name,
      price: menuItems[id].price,
    });

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${menuItems[id].name} x${quantity}</span>
      <span>R$ ${(menuItems[id].price * quantity).toFixed(2)}</span>
    `;
    orderList.appendChild(li);

    updateTotal();
    document.getElementById("itemId").value = "";
    document.getElementById("quantity").value = "";
  } else {
    showAlert("Item inválido. Verifique o ID do item.");
  }
});

// ===== Limpar pedido =====
clearOrderBtn.addEventListener("click", () => {
  orderList.innerHTML = "";
  orderItems = [];
  updateTotal();
});

// ===== Enviar pedido =====
sendOrderBtn.addEventListener("click", async () => {
  if (orderItems.length === 0) {
    showAlert("Nenhum item adicionado ao pedido!");
    return;
  }

  try {
    await apiPost("/orders", {
      tableNumber,
      items: orderItems.map(({ menuItem, quantity }) => ({ menuItem, quantity })),
    });
    showSuccess("Pedido enviado com sucesso!");
    orderList.innerHTML = "";
    orderItems = [];
    updateTotal();
  } catch (error) {
    console.error("Erro ao enviar pedido:", error);
    showError("Erro ao enviar pedido. Tente novamente.");
  }
});

loadMenu();
