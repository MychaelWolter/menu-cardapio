const userType = document.getElementById('userType');
const adminLogin = document.getElementById('adminLogin');
const mesaLogin = document.getElementById('mesaLogin');
const loginBtn = document.getElementById('loginBtn');

userType.addEventListener('change', () => {
  if (userType.value === 'admin') {
    adminLogin.style.display = 'block';
    mesaLogin.style.display = 'none';
  } else {
    adminLogin.style.display = 'none';
    mesaLogin.style.display = 'block';
  }
});

loginBtn.addEventListener('click', async () => {
  const type = userType.value;

  let payload = { type };
  if (type === 'admin') {
    payload.username = document.getElementById('username').value;
    payload.password = document.getElementById('password').value;
  } else {
    payload.tableNumber = document.getElementById('tableNumber').value;
  }

  const res = await apiPost('/auth/login', payload);
  if (res.token) {
    localStorage.setItem('token', res.token);
    if (type === 'admin') window.location.href = './admin.html';
    else window.location.href = './menu.html';
  } else {
    alert(res.message || 'Erro ao fazer login');
  }
});
