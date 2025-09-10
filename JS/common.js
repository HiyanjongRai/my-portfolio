// JS/common.js
(() => {
  'use strict';

  const API_BASE = (window.API_BASE || "").replace(/\/+$/, "");
  if (!API_BASE) console.warn("[common] window.API_BASE is empty.");

  // === Utils ===
  const $  = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

  function getRawToken() {
    const v = (localStorage.getItem('jwtToken') || localStorage.getItem('authToken') || '').trim();
    return v.startsWith('Bearer ') ? v.slice(7) : v;
  }
  function getBearer() { return getRawToken() ? `Bearer ${getRawToken()}` : ''; }
  function authHeaders() { return getBearer() ? { Authorization: getBearer() } : {}; }

  async function http(path, { method='GET', body=null, expectJson=true, extraHeaders={} }={}) {
    const res = await fetch(API_BASE + path, { method, body, headers: { ...authHeaders(), ...extraHeaders } });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    if (!expectJson) return res;
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : {};
  }

  function assertAuthOrRedirect() {
    const raw = getRawToken();
    if (!raw) { localStorage.clear(); location.replace('index.html'); return false; }
    return true;
  }

  async function setWelcomeUsername() {
    try {
      const me = await http('/api/auth/profile');
      $('#welcomeUser').textContent = me?.username ?? '';
    } catch {}
  }

  function doLogout() {
    if (!confirm('Log out?')) return;
    localStorage.clear();
    location.replace('index.html');
  }
  $('#logoutBtn')?.addEventListener('click', doLogout);
  $('#logoutBtnTop')?.addEventListener('click', doLogout);

  // Sidebar toggle
  const sidebar  = $('#sidebar'), backdrop = $('#backdrop'), toggleBtn= $('#sidebarToggle');
  function openSidebar(){ sidebar?.classList.add('open'); backdrop.hidden=false; requestAnimationFrame(()=>backdrop.classList.add('show')); }
  function closeSidebar(){ sidebar?.classList.remove('open'); backdrop.classList.remove('show'); setTimeout(()=>backdrop.hidden=true,200); }
  toggleBtn?.addEventListener('click', ()=> sidebar?.classList.contains('open') ? closeSidebar() : openSidebar());
  backdrop?.addEventListener('click', closeSidebar);

  window.AppCommon = { $, $$, http, API_BASE, assertAuthOrRedirect, setWelcomeUsername };
})();
