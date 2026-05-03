// src/utils/api.js
// כל הקריאות ל-Backend במקום אחד

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ── Helper ──────────────────────────────────────────
function getToken() {
  return sessionStorage.getItem('td_token');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'שגיאת שרת');
  return data;
}

const get    = (path)        => request('GET',    path);
const post   = (path, body)  => request('POST',   path, body);
const patch  = (path, body)  => request('PATCH',  path, body);
const del    = (path)        => request('DELETE', path);

// ── Auth ─────────────────────────────────────────────
export const authAPI = {
  login:    (data) => post('/api/auth/login', data),
  register: (data) => post('/api/auth/register', data),
};

// ── Clients ───────────────────────────────────────────
export const clientsAPI = {
  getAll:   ()   => get('/api/clients'),
  getById:  (id) => get(`/api/clients/${id}`),
};

// ── Orders ────────────────────────────────────────────
export const ordersAPI = {
  getAll:   (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/orders${q ? '?' + q : ''}`);
  },
  getItems: (id)  => get(`/api/orders/${id}/items`),
  create:   (data) => post('/api/orders', data),
};

// ── Warehouses ────────────────────────────────────────
export const warehousesAPI = {
  getAll:   ()   => get('/api/warehouses'),
  getStock: (id) => get(`/api/warehouses/${id}/stock`),
};

// ── Workers ───────────────────────────────────────────
export const workersAPI = {
  getAll:          ()           => get('/api/workers'),
  getLeaveRequests: ()          => get('/api/workers/leave-requests'),
  submitLeave:     (data)       => post('/api/workers/leave', data),
  respondLeave:    (id, data)   => patch(`/api/workers/leave/${id}`, data),
};

// ── Deliveries ────────────────────────────────────────
export const deliveriesAPI = {
  getToday:     ()           => get('/api/deliveries/today'),
  updateStatus: (id, data)   => patch(`/api/deliveries/${id}/status`, data),
};
