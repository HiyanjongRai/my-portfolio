// JS/projects.js
(() => {
  'use strict';
  const { $, $$, http, API_BASE, assertAuthOrRedirect, setWelcomeUsername } = window.AppCommon;

  const ENDPOINTS = {
    projects: '/api/projects',
    projectById: id => `/api/projects/${id}`,
    projectImage: id => `/api/projects/image/${id}`
  };
  const state = { projects: [], sort:{key:'id', dir:'desc'}, filter:'' };

  function renderProjects() {
    const body = $('#projectRows');
    const items = [...state.projects].filter(p => JSON.stringify(p).toLowerCase().includes(state.filter.toLowerCase()));
    if (!items.length) { body.innerHTML = `<tr><td colspan="6">No projects.</td></tr>`; return; }
    body.innerHTML = items.map(pr => `
      <tr>
        <td>${pr.title}</td>
        <td>${pr.description}</td>
        <td>${pr.techStack||''}</td>
        <td>${pr.demoLink?`<a href="${pr.demoLink}" target="_blank">demo</a>`:''}</td>
        <td>${pr.id? `<img src="${API_BASE}${ENDPOINTS.projectImage(pr.id)}" style="max-width:120px">` : '—'}</td>
        <td><button data-del="${pr.id}">Delete</button></td>
      </tr>`).join('');
  }

  async function loadProjects(){
    const rows=$('#projectRows'); rows.innerHTML=`<tr><td colspan="6">Loading…</td></tr>`;
    try { state.projects = await http(ENDPOINTS.projects); renderProjects(); }
    catch(e){ rows.innerHTML=`<tr><td colspan="6">Failed: ${e.message}</td></tr>`; }
  }

  $('#projectForm')?.addEventListener('submit', async ev=>{
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    try {
      const created = await http(ENDPOINTS.projects, { method:'POST', body:fd });
      state.projects.unshift(created); renderProjects();
      ev.currentTarget.reset();
    } catch(e){ alert('Create failed: '+e.message); }
  });

  $('#projectRows').addEventListener('click', async e=>{
    const id=e.target.dataset.del; if(!id) return;
    if (!confirm('Delete project?')) return;
    await http(ENDPOINTS.projectById(id), { method:'DELETE', expectJson:false });
    state.projects=state.projects.filter(p=>p.id!=id); renderProjects();
  });

  $('#projectSearch').addEventListener('input', e=>{ state.filter=e.target.value; renderProjects(); });

  async function init(){
    if (!assertAuthOrRedirect()) return;
    await setWelcomeUsername();
    await loadProjects();
  }
  init();
})();
