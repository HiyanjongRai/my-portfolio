// JS/posts.js
(() => {
  'use strict';
  const { $, $$, http, API_BASE, assertAuthOrRedirect, setWelcomeUsername } = window.AppCommon;

  const ENDPOINTS = {
    posts: '/api/images',
    postById: id => `/api/images/${id}`,
    upload: '/api/images/upload'
  };
  const state = { posts: [], sort:{key:'id', dir:'desc'}, filter:'' };

  function renderPosts() {
    const body = $('#postRows');
    const items = [...state.posts].filter(p => JSON.stringify(p).toLowerCase().includes(state.filter.toLowerCase()));
    if (!items.length) { body.innerHTML = `<tr><td colspan="4">No posts.</td></tr>`; return; }
    body.innerHTML = items.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.description||''}</td>
        <td>${p.id ? `<img src="${API_BASE}/api/images/${p.id}" style="max-width:120px">` : '—'}</td>
        <td>
          <button data-edit="${p.id}">Edit</button>
          <button data-del="${p.id}">Delete</button>
        </td>
      </tr>`).join('');
  }

  async function loadPosts() {
    const rows = $('#postRows'); rows.innerHTML = `<tr><td colspan="4">Loading…</td></tr>`;
    try { state.posts = await http(ENDPOINTS.posts); renderPosts(); }
    catch (e){ rows.innerHTML=`<tr><td colspan="4">Failed: ${e.message}</td></tr>`; }
  }

  // upload form
  $('#postForm')?.addEventListener('submit', async ev=>{
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    try {
      const created = await http(ENDPOINTS.upload, { method:'POST', body:fd });
      state.posts.unshift(created); renderPosts();
      ev.currentTarget.reset();
    } catch(e){ alert('Upload failed: '+e.message); }
  });

  // edit/delete
  $('#postRows').addEventListener('click', async e=>{
    const id = e.target.dataset.edit || e.target.dataset.del;
    if (!id) return;
    if (e.target.dataset.del) {
      if (!confirm('Delete post?')) return;
      await http(ENDPOINTS.postById(id), { method:'DELETE', expectJson:false });
      state.posts = state.posts.filter(p=>p.id!=id); renderPosts();
    }
    // editing can be added here with a modal like original code
  });

  $('#postSearch').addEventListener('input', e=>{ state.filter=e.target.value; renderPosts(); });

  async function init(){
    if (!assertAuthOrRedirect()) return;
    await setWelcomeUsername();
    await loadPosts();
  }
  init();
})();
