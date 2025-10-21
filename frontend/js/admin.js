const tabMenu = document.getElementById('tabMenu');
const tabOrders = document.getElementById('tabOrders');
const menuCrud = document.getElementById('menuCrud');
const ordersTab = document.getElementById('ordersTab');
const menuList = document.getElementById('menuList');
const orderList = document.getElementById('orderList');
const addMenuBtn = document.getElementById('addMenu');

tabMenu.addEventListener('click', () => {
  menuCrud.style.display = 'block';
  ordersTab.style.display = 'none';
});
tabOrders.addEventListener('click', () => {
  menuCrud.style.display = 'none';
  ordersTab.style.display = 'block';
  loadOrders();
});

async function loadMenu() {
  const data = await apiGet('/menu');
  menuList.innerHTML = '';
  data.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `${item.name} - R$${item.price} 
      <button onclick="deleteItem('${item._id}')">🗑</button>`;
    menuList.appendChild(li);
  });
}

async function deleteItem(id) {
  await apiDelete(`/menu/${id}`);
  loadMenu();
}

addMenuBtn.addEventListener('click', async () => {
  const name = document.getElementById('itemName').value;
  const description = document.getElementById('itemDesc').value;
  const price = document.getElementById('itemPrice').value;
  await apiPost('/menu', { name, description, price });
  loadMenu();
});

async function loadOrders() {
  const orders = await apiGet('/orders');
  orderList.innerHTML = '';
  orders.forEach(o => {
    const li = document.createElement('li');
    li.textContent = `Mesa ${o.tableNumber}: ${o.items.map(i => i.menuItem.name + ' x' + i.quantity).join(', ')}`;
    orderList.appendChild(li);
  });
}

loadMenu();
