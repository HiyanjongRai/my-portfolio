// JS/posts.js
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s = '') =>
    s.replaceAll('&','&amp;')
     .replaceAll('<','&lt;')
     .replaceAll('>','&gt;')
     .replaceAll('"','&quot;')
     .replaceAll("'", '&#39;');

  const API_BASE = (window.API_BASE || '').replace(/\/+$/,'');
  if (!API_BASE) console.warn('[posts] window.API_BASE not set. Did you include config.js?');

  function getToken() {
    return localStorage.getItem('jwtToken') || localStorage.getItem('authToken') || localStorage.getItem('jwt') || '';
  }
  function authHeaders() {
    const t = getToken();
    return t ? { Authorization: t.startsWith('Bearer ') ? t : `Bearer ${t}` } : {};
  }


  async function http(path, { method='GET', body=null, expectJson=true, headers={} } = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const isForm = (body instanceof FormData);
    const finalHeaders = new Headers({ ...authHeaders(), ...headers });
    if (!isForm && body && !finalHeaders.has('Content-Type')) {
      finalHeaders.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, { method, body, headers: finalHeaders });

    if (res.status === 401) {
      console.warn('[posts] 401 Unauthorized');
      throw new Error('HTTP 401 Unauthorized');
    }
    if (!res.ok) {
      const text = await res.text().catch(()=>'');
      throw new Error(text || `HTTP ${res.status} ${res.statusText}`);
    }

    if (!expectJson) return res;
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : {};
  }

  /* ----------------- API endpoints ----------------- */
  const ENDPOINTS = {
    list:   '/api/images',
    byId:   (id) => `/api/images/${id}`,
    upload: '/api/images/upload'
  };

  /* ----------------- State ----------------- */
  const state = {
    posts: [],
    filter: '',
    sort: { key: 'id', dir: 'desc' } // or 'name'
  };

  /* ----------------- Render ----------------- */
  function renderPosts() {
    const body = $('#postRows');
    if (!body) return;

    const filtered = state.posts.filter(p =>
      JSON.stringify(p).toLowerCase().includes(state.filter.toLowerCase())
    );

    const items = sortItems(filtered, state.sort.key, state.sort.dir);

    if (!items.length) {
      body.innerHTML = `<tr><td colspan="4">No images/posts found.</td></tr>`;
      return;
    }

    body.innerHTML = items.map(p => `
      <tr>
        <td><strong>${esc(p.name || '')}</strong></td>
        <td>${esc(p.description || '')}</td>
        <td>${
          p.id
            ? `<img src="${API_BASE}${ENDPOINTS.byId(p.id)}"
                    alt="${esc(p.name || '')}"
                    style="max-width:140px;max-height:100px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb" />`
            : '—'
        }</td>
        <td class="actions" style="display:flex; gap:8px;">
          <button class="btn secondary" data-edit="${p.id}">Edit</button>
          <button class="btn warn" data-del="${p.id}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function sortItems(arr, key, dir) {
    const copy = [...arr];
    const mul = dir === 'asc' ? 1 : -1;
    copy.sort((a, b) => {
      const va = (a?.[key] ?? '').toString().toLowerCase();
      const vb = (b?.[key] ?? '').toString().toLowerCase();
      const na = !isNaN(+va), nb = !isNaN(+vb);
      if (na && nb) return ((+va) - (+vb)) * mul;
      if (va < vb) return -1 * mul;
      if (va > vb) return  1 * mul;
      return 0;
    });
    return copy;
  }

  /* ----------------- Load ----------------- */
  async function loadPosts() {
    const rows = $('#postRows');
    if (rows) rows.innerHTML = `<tr><td colspan="4">Loading…</td></tr>`;
    try {
      const data = await http(ENDPOINTS.list);
      state.posts = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
      renderPosts();
      // optional badge update
      const badge = $('#navPostCount'); if (badge) badge.textContent = String(state.posts.length || 0);
    } catch (e) {
      console.error(e);
      if (rows) rows.innerHTML = `<tr><td colspan="4">Failed to load (${esc(e.message)}).</td></tr>`;
    }
  }

  /* ----------------- Upload ----------------- */
  $('#postForm')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = ev.currentTarget;
    const name = f.name.value.trim();
    const file = f.file.files[0];
    const desc = f.description.value.trim();
    const alertBox = $('#postAlert');

    if (!name) return toast(alertBox, 'Name is required.');
    if (!file) return toast(alertBox, 'Image file is required.');

    const fd = new FormData();
    fd.append('name', name);
    if (desc) fd.append('description', desc);
    fd.append('file', file);

    try {
      const created = await http(ENDPOINTS.upload, { method: 'POST', body: fd });
      if (created?.id) state.posts.unshift(created);
      renderPosts();
      f.reset();
      $('#postPreview').textContent = 'Uploaded ✓';
      setTimeout(() => $('#postPreview').textContent = '', 1500);
      toast(alertBox, 'Uploaded', 'success');
    } catch (e) {
      console.error(e);
      toast(alertBox, `Upload failed: ${e.message}`);
    }
  });

  // Live preview for upload form
  $('#postForm input[name="file"]')?.addEventListener('change', (e) => {
    const target = $('#postPreview');
    if (!target) return;
    const file = e.target.files?.[0];
    if (!file) { target.textContent=''; return; }
    const ok = ['image/jpeg','image/png','image/webp'].includes(file.type);
    target.textContent = ok ? `Selected: ${file.name}` : 'Only JPG, PNG, or WEBP allowed.';
    if (!ok) e.target.value = '';
  });

  /* ----------------- Edit ----------------- */
  const editDialog = $('#editDialog');
  const editForm   = $('#editForm');
  const editFields = $('#editFields');
  $('#cancelEdit')?.addEventListener('click', () => closeEdit());

  // open modal
  $('#postRows')?.addEventListener('click', (e) => {
    const id = e.target.dataset?.edit;
    const delId = e.target.dataset?.del;

    if (id) {
      const post = state.posts.find(p => String(p.id) === String(id));
      if (post) openEdit(post);
    } else if (delId) {
      confirmDelete(delId);
    }
  });

  function openEdit(post) {
    // Build fields (name, description, file + previews)
    editFields.innerHTML = `
      <div style="display:grid; gap:6px;">
        <label style="font-weight:600">Name *</label>
        <input id="editName" type="text" required value="${esc(post.name || '')}">
      </div>

      <div style="display:grid; gap:6px;">
        <label style="font-weight:600">Description</label>
        <textarea id="editDesc" rows="3">${esc(post.description || '')}</textarea>
      </div>

      <div style="display:grid; gap:8px;">
        <label style="font-weight:600">Replace Image (optional)</label>
        <input id="editFile" type="file" accept="image/png,image/jpeg,image/webp">
        <div style="display:flex; gap:14px; align-items:flex-start; margin-top:6px;">
          <div>
            <div style="font-size:12px; opacity:.7; margin-bottom:4px">Current</div>
            ${post.id ? `<img src="${API_BASE}${ENDPOINTS.byId(post.id)}"
                           style="width:140px;height:100px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb">` : '—'}
          </div>
          <div>
            <div style="font-size:12px; opacity:.7; margin-bottom:4px">New (preview)</div>
            <img id="newPreview"
                 style="width:140px;height:100px;object-fit:cover;border-radius:8px;border:1px dashed #cbd5e1; display:none">
          </div>
        </div>
      </div>
    `;

    $('#editTitle').textContent = `Edit: ${post.name ?? post.id}`;
    editDialog.dataset.postId = post.id;
    editDialog.showModal();

    // hook preview
    const fileInput = $('#editFile');
    const newPreview = $('#newPreview');
    fileInput?.addEventListener('change', () => {
      const f = fileInput.files?.[0];
      if (f) {
        const url = URL.createObjectURL(f);
        newPreview.src = url;
        newPreview.style.display = 'block';
      } else {
        newPreview.src = '';
        newPreview.style.display = 'none';
      }
    }, { once: true });
  }

  function closeEdit() {
    editDialog?.close();
    if (editDialog) editDialog.dataset.postId = '';
    if (editFields) editFields.innerHTML = '';
  }

  // submit edit (always multipart PUT; file optional)
  editForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editDialog?.dataset.postId;
    if (!id) return;

    const name = $('#editName')?.value?.trim() || '';
    const desc = $('#editDesc')?.value?.trim() || '';
    const file = $('#editFile')?.files?.[0];

    if (!name) { alert('Name is required.'); return; }

    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', desc);
    if (file) fd.append('file', file);

    try {
      const updated = await http(ENDPOINTS.byId(id), { method: 'PUT', body: fd });
      // replace in local state
      const ix = state.posts.findIndex(p => String(p.id) === String(id));
      if (ix > -1) state.posts[ix] = { ...state.posts[ix], ...updated };
      renderPosts();
      closeEdit();
    } catch (err) {
      console.error(err);
      alert('Update failed: ' + err.message);
    }
  });

  /* ----------------- Delete ----------------- */
  async function confirmDelete(id) {
    if (!confirm('Delete this image/post?')) return;
    try {
      await http(ENDPOINTS.byId(id), { method: 'DELETE', expectJson: false });
      state.posts = state.posts.filter(p => String(p.id) !== String(id));
      renderPosts();
    } catch (e) {
      console.error(e);
      alert('Delete failed: ' + e.message);
    }
  }

  /* ----------------- Search & Sort ----------------- */
  $('#postSearch')?.addEventListener('input', (e) => {
    state.filter = e.target.value || '';
    renderPosts();
  });

  $$('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sort || 'id';
      const cur = state.sort;
      const dir = (cur.key === key && cur.dir === 'asc') ? 'desc' : 'asc';
      state.sort = { key, dir };
      renderPosts();
    });
  });

  /* ----------------- Toast helper ----------------- */
  function toast(container, msg, type='error') {
    if (!container) { alert(msg); return; }
    const el = document.createElement('div');
    el.className = `alert ${type === 'success' ? 'success' : 'error'}`;
    el.textContent = msg;
    container.innerHTML = '';
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  /* ----------------- Init ----------------- */
  (async function init() {
    // if you guard auth on this page, you can add your own assert/redirect here
    await loadPosts();
  })();
})();
