const menuList = document.getElementById('menuList');
const orderList = document.getElementById('orderList');
const addItemBtn = document.getElementById('addItem');
const sendOrderBtn = document.getElementById('sendOrder');
const tableNumber = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).tableNumber;

let menuItems = [];
let orderItems = [];

async function loadMenu() {
  menuItems = await apiGet('/menu');
  menuList.innerHTML = '';
  menuItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1} - ${item.name} - R$ ${item.price}`;
    menuList.appendChild(li);
  });

  // Leitor de voz do cardápio
  const synth = window.speechSynthesis;
  const text = menuItems.map(i => `${i.name}, preço ${i.price} reais.`).join('. ');
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'pt-BR';
  synth.speak(utter);
}

addItemBtn.addEventListener('click', () => {
  const id = parseInt(document.getElementById('itemId').value) - 1;
  const quantity = parseInt(document.getElementById('quantity').value);
  if (menuItems[id]) {
    orderItems.push({ menuItem: menuItems[id]._id, quantity });
    const li = document.createElement('li');
    li.textContent = `${menuItems[id].name} x${quantity}`;
    orderList.appendChild(li);
  } else {
    alert('Item inválido');
  }
});

sendOrderBtn.addEventListener('click', async () => {
  if (orderItems.length === 0) return alert('Nenhum item adicionado!');
  const res = await apiPost('/orders', { tableNumber, items: orderItems });
  alert('Pedido enviado com sucesso!');
  orderList.innerHTML = '';
  orderItems = [];
});

loadMenu();
