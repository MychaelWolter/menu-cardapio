const API_URL = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ? 
                'http://localhost:5000/api' : 
                'https://menu-cardapio.onrender.com/api';

async function apiGet(endpoint) {
  const res = await fetch(API_URL + endpoint, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return res.json();
}

async function apiPost(endpoint, body, isFormData = false) {
  const token = localStorage.getItem("token");
  const headers = isFormData ? { Authorization: `Bearer ${token}` } : {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(API_URL + endpoint, {
    method: "POST",
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });

  return response.json();
}

async function apiPut(endpoint, body) {
  const res = await fetch(API_URL + endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function apiDelete(endpoint) {
  const res = await fetch(API_URL + endpoint, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return res.json();
}