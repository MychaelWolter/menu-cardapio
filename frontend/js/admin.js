const tabMenu = document.getElementById("tabMenu");
const tabOrders = document.getElementById("tabOrders");
const menuCrud = document.getElementById("menuCrud");
const ordersTab = document.getElementById("ordersTab");
const menuList = document.getElementById("menuList");
const orderList = document.getElementById("orderList");
const addMenuBtn = document.getElementById("addMenu");

logoutBtn.addEventListener("click", () => {
  // Remove o token do localStorage
  localStorage.removeItem("token");
  // Redireciona diretamente para a página de login
  window.location.href = "../index.html"; // Ajuste o caminho conforme necessário
});

tabMenu.addEventListener("click", () => {
  menuCrud.style.display = "block";
  ordersTab.style.display = "none";
  loadMenu();
});

tabOrders.addEventListener("click", () => {
  menuCrud.style.display = "none";
  ordersTab.style.display = "block";
  loadOrders();
});

// ==================== CRUD MENU ====================

async function loadMenu() {
  const data = await apiGet("/menu");
  menuList.innerHTML = "";

  data.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
  <div class="menu-info">
    <span class="menu-name"><b>${item.name}</b></span>
    <span class="menu-desc">${
      item.description ? item.description : "<i>Sem descrição</i>"
    }</span>
    <span class="menu-price">R$${item.price.toFixed(2)}</span>
  </div>
  <div class="menu-actions">
    <button class="action-btn" onclick="editItem('${item._id}', '${
      item.name
    }', '${item.description}', ${item.price})">✏️</button>
    <button class="action-btn" onclick="deleteItem('${item._id}')">🗑</button>
  </div>
`;

    menuList.appendChild(li);
  });
}

async function deleteItem(id) {
  await apiDelete(`/menu/${id}`);
  loadMenu();
}

addMenuBtn.addEventListener("click", async () => {
  const name = document.getElementById("itemName").value;
  const description = document.getElementById("itemDesc").value;
  const price = parseFloat(document.getElementById("itemPrice").value);

  if (!name || !price) {
    alert("Preencha os campos obrigatórios!");
    return;
  }

  await apiPost("/menu", { name, description, price });
  clearForm();
  loadMenu();
});

function clearForm() {
  document.getElementById("itemName").value = "";
  document.getElementById("itemDesc").value = "";
  document.getElementById("itemPrice").value = "";
}

async function editItem(id, name, description, price) {
  const newName = prompt("Novo nome:", name);
  const newDesc = prompt("Nova descrição:", description);
  const newPrice = prompt("Novo preço:", price);

  if (!newName || !newPrice) return;

  await apiPut(`/menu/${id}`, {
    name: newName,
    description: newDesc,
    price: parseFloat(newPrice),
  });

  loadMenu();
}

// ==================== CRUD COMANDAS ====================

async function loadOrders() {
  const orders = await apiGet("/orders");
  orderList.innerHTML = "";

  orders.forEach((o) => {
    const li = document.createElement("li");
    const items = o.items
      .map((i) => `${i.menuItem?.name || "Item removido"} x${i.quantity}`)
      .join(", ");
    li.innerHTML = `
  <div>
    <b>Mesa ${o.tableNumber}</b><br>
  <i style="font-size: 0.9rem;">${items}</i><br>
  <span style="font-size: 0.95rem;; font-weight: 600; color: #9c1c28;">Status: ${o.status}</span>
  </div>
  <div>
    <select onchange="updateOrderStatus('${o._id}', this.value)">
      <option value="">Alterar</option>
      <option value="pendente">Pendente</option>
      <option value="preparando">Preparando</option>
      <option value="entregue">Entregue</option>
    </select>
    <button class="action-btn" onclick="deleteOrder('${o._id}')">🗑</button>
  </div>
`;
    orderList.appendChild(li);
  });
}

async function updateOrderStatus(id, status) {
  if (!status) return;
  await apiPut(`/orders/${id}`, { status });
  loadOrders();
}

async function deleteOrder(id) {
  if (!confirm("Deseja deletar esta comanda?")) return;
  await apiDelete(`/orders/${id}`);
  loadOrders();
}

// ==================== EXECUÇÃO INICIAL ====================
loadMenu();
