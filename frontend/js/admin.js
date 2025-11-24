const tabMenu = document.getElementById("tabMenu");
const tabOrders = document.getElementById("tabOrders");
const menuCrud = document.getElementById("menuCrud");
const ordersTab = document.getElementById("ordersTab");
const menuList = document.getElementById("menuList");
const orderList = document.getElementById("orderList");
const addMenuBtn = document.getElementById("addMenu");
const logoutBtn = document.getElementById("logoutBtn");

const itemName = document.getElementById("itemName");
const itemDesc = document.getElementById("itemDesc");
const itemPrice = document.getElementById("itemPrice");
const itemImage = document.getElementById("itemImage");

let editingId = null;

// 🔹 CONFIGURAÇÃO DA URL DA API
const API_BASE_URL = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ? 
                     'http://localhost:5000' : 
                     'https://menu-cardapio.onrender.com';

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "../index.html";
});

// ==================== TROCA DE ABAS ====================
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
        <div class="menu-item">
          <img src="${item.imageUrl || item.image || 'https://via.placeholder.com/60x60?text=Sem+Imagem'}" 
               alt="${item.name}" class="menu-thumb">
          <div class="menu-text">
            <span class="menu-name"><b>${item.name}</b></span>
            <span class="menu-desc">${item.description || "<i>Sem descrição</i>"}</span>
            <span class="menu-price">R$${item.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div class="menu-actions">
        <button class="action-btn" onclick="startEdit('${item._id}', '${item.name}', '${item.description}', ${item.price})">✏️</button>
        <button class="action-btn" onclick="deleteItem('${item._id}')">🗑</button>
      </div>
    `;
    menuList.appendChild(li);
  });
}

// ==================== ADICIONAR OU ATUALIZAR ITEM ====================
addMenuBtn.addEventListener("click", async () => {
  const name = itemName.value.trim();
  const description = itemDesc.value.trim();
  const price = parseFloat(itemPrice.value);
  const imageFile = itemImage.files[0];

  if (!name || isNaN(price)) {
    showAlert("Preencha o nome e o preço corretamente!");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("price", price);
  if (imageFile) formData.append("image", imageFile);

  try {
    if (editingId) {
      // 🔹 CORREÇÃO: Usar API_BASE_URL dinâmica
      const response = await fetch(`${API_BASE_URL}/api/menu/${editingId}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      showSuccess("Item atualizado com sucesso!");
    } else {
      // 🔹 Criando novo item (já usa apiPost que foi corrigido)
      await apiPost("/menu", formData, true);
      showSuccess("Item adicionado com sucesso!");
    }

    clearForm();
    loadMenu();
  } catch (err) {
    console.error("Erro ao salvar item:", err);
    showError("Ocorreu um erro ao salvar o item: " + err.message);
  }
});

// ==================== INICIAR EDIÇÃO ====================
function startEdit(id, name, description, price) {
  editingId = id;
  itemName.value = name;
  itemDesc.value = description;
  itemPrice.value = price;
  itemImage.value = "";

  addMenuBtn.textContent = "Salvar Alterações";
  addMenuBtn.style.backgroundColor = "#7e1620";
  addMenuBtn.style.transition = "0.3s";

  itemName.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ==================== LIMPAR FORMULÁRIO ====================
function clearForm() {
  itemName.value = "";
  itemDesc.value = "";
  itemPrice.value = "";
  itemImage.value = "";
  editingId = null;
  addMenuBtn.textContent = "Adicionar";
  addMenuBtn.style.backgroundColor = "#9c1c28";
}

// ==================== DELETAR ITEM ====================
async function deleteItem(id) {
  const confirmed = await showConfirm("Deseja deletar este item do cardápio?");
  if (!confirmed) return;
  
  try {
    // 🔹 CORREÇÃO: Usar URL dinâmica para DELETE também
    const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
      method: "DELETE",
      headers: { 
        Authorization: `Bearer ${localStorage.getItem("token")}` 
      }
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    loadMenu();
    clearForm();
    showSuccess("Item deletado com sucesso!");
  } catch (err) {
    console.error("Erro ao deletar item:", err);
    showError("Erro ao deletar item: " + err.message);
  }
}

// ==================== COMANDAS ====================
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
        <span style="font-size: 0.95rem; font-weight: 600; color: #9c1c28;">Status: ${o.status}</span>
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
  
  try {
    // 🔹 CORREÇÃO: Usar URL dinâmica para atualizar status
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    await response.json();
    loadOrders();
    showSuccess("Status atualizado com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    showError("Erro ao atualizar status: " + err.message);
  }
}

async function deleteOrder(id) {
  const confirmed = await showConfirm("Deseja deletar esta comanda?");
  if (!confirmed) return;
  
  try {
    // 🔹 CORREÇÃO: Usar URL dinâmica para deletar pedidos
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: "DELETE",
      headers: { 
        Authorization: `Bearer ${localStorage.getItem("token")}` 
      }
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    loadOrders();
    showSuccess("Comanda deletada com sucesso!");
  } catch (err) {
    console.error("Erro ao deletar comanda:", err);
    showError("Erro ao deletar comanda: " + err.message);
  }
}

// 🔹 Adicionar função de debug para testar
function debugAPI() {
  console.log('🔍 Debug Admin:');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Hostname:', window.location.hostname);
  console.log('Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
}

// Inicializa a tela
loadMenu();
debugAPI(); // Para testar no console