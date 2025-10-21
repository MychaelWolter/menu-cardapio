const API_URL = 'http://localhost:5000/api';

async function apiGet(endpoint) {
  const res = await fetch(API_URL + endpoint, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return res.json();
}

async function apiPost(endpoint, body) {
  const res = await fetch(API_URL + endpoint, {
    method: 'POST',
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
