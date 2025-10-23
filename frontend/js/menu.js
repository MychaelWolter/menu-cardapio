const menuList = document.getElementById('menuList');
const orderList = document.getElementById('orderList');
const addItemBtn = document.getElementById('addItem');
const sendOrderBtn = document.getElementById('sendOrder');
const clearOrderBtn = document.getElementById('clearOrder');
const currentTableSpan = document.getElementById('currentTable');
const logoutBtn = document.getElementById('logoutBtn');
const totalAmountSpan = document.getElementById('totalAmount');

// Obter número da mesa do token
let tableNumber;
try {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    tableNumber = payload.tableNumber;
    currentTableSpan.textContent = tableNumber;
  }
} catch (error) {
  console.error('Erro ao obter número da mesa:', error);
}

let menuItems = [];
let orderItems = [];

// Função para calcular e atualizar o total
function updateTotal() {
  const total = orderItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  totalAmountSpan.textContent = total.toFixed(2);
}

// Função para voltar ao login - SEM CONFIRMAÇÃO
logoutBtn.addEventListener('click', () => {
  // Remove o token do localStorage
  localStorage.removeItem('token');
  // Redireciona diretamente para a página de login
  window.location.href = '../index.html'; // Ajuste o caminho conforme necessário
});

async function loadMenu() {
  try {
    menuItems = await apiGet('/menu');
    menuList.innerHTML = '';
    menuItems.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1} - ${item.name} - R$ ${item.price.toFixed(2)}`;
      menuList.appendChild(li);
    });

    // Leitor de voz do cardápio
    const synth = window.speechSynthesis;
    const text = menuItems.map(i => `${i.name}, preço ${i.price.toFixed(2)} reais.`).join('. ');
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    synth.speak(utter);
  } catch (error) {
    console.error('Erro ao carregar cardápio:', error);
    alert('Erro ao carregar cardápio. Tente novamente.');
  }
}

addItemBtn.addEventListener('click', () => {
  const id = parseInt(document.getElementById('itemId').value) - 1;
  const quantity = parseInt(document.getElementById('quantity').value);
  
  if (isNaN(id) || isNaN(quantity) || quantity < 1) {
    alert('Por favor, insira valores válidos para ID e quantidade.');
    return;
  }
  
  if (menuItems[id]) {
    orderItems.push({ 
      menuItem: menuItems[id]._id, 
      quantity,
      name: menuItems[id].name,
      price: menuItems[id].price
    });
    
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${menuItems[id].name} x${quantity}</span>
      <span>R$ ${(menuItems[id].price * quantity).toFixed(2)}</span>
    `;
    orderList.appendChild(li);
    
    // Atualizar o total
    updateTotal();
    
    // Limpar campos de input
    document.getElementById('itemId').value = '';
    document.getElementById('quantity').value = '';
  } else {
    alert('Item inválido. Verifique o ID do item.');
  }
});

clearOrderBtn.addEventListener('click', () => {
  orderList.innerHTML = '';
  orderItems = [];
  updateTotal(); // Atualiza o total para zero
});

sendOrderBtn.addEventListener('click', async () => {
  if (orderItems.length === 0) {
    alert('Nenhum item adicionado ao pedido!');
    return;
  }
  
  try {
    const res = await apiPost('/orders', { 
      tableNumber, 
      items: orderItems.map(({ menuItem, quantity }) => ({ menuItem, quantity }))
    });
    alert('Pedido enviado com sucesso!');
    orderList.innerHTML = '';
    orderItems = [];
    updateTotal(); // Atualiza o total para zero após enviar
  } catch (error) {
    console.error('Erro ao enviar pedido:', error);
    alert('Erro ao enviar pedido. Tente novamente.');
  }
});

loadMenu();