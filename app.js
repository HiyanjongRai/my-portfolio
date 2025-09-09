// app.js  (no imports needed; exposes helpers on window.api)
const API = (window.API_BASE || '').replace(/\/+$/, '');

function getToken() {
  // your site saves under "jwtToken"
  const t = (localStorage.getItem('jwtToken') || '').trim();
  return t && !t.startsWith('Bearer ') ? `Bearer ${t}` : t;
}

async function http(path, { method='GET', body=null, headers={} } = {}) {
  const h = new Headers(headers);
  if (body && !(body instanceof FormData) && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json');
  }
  h.set('Accept', 'application/json');
  const token = getToken();
  if (token) h.set('Authorization', token);

  const res = await fetch(API + path, { method, body, headers: h });
  if (!res.ok) {
    const txt = await res.text().catch(()=> '');
    throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ` – ${txt}` : ''}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res;
}

// --- Auth ---
async function signIn({ username, password }) {
  const data = await http('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  if (data?.token) {
    localStorage.setItem('jwtToken', data.token);
    if (data.username) localStorage.setItem('username', data.username);
  }
  return data;
}

// --- Convenience API calls (optional) ---
const api = {
  http,
  signIn,
  getProjects: () => http('/api/projects'),
  createProjectJSON: (project) =>
    http('/api/projects', { method: 'POST', body: JSON.stringify(project) }),
  // for file uploads use FormData directly with api.http(...)
};

window.api = api; // use as window.api.signIn({...})
