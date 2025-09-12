// JS/dashboard.js

// preconnect-supabase.js
(function addPreconnect(url) {
  if (!url) return;
  const make = (rel) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = url;
    if (rel === 'preconnect') link.crossOrigin = '';
    document.head.appendChild(link);
  };
  make('preconnect');
  make('dns-prefetch');
})('https://brzzpwmuixjslgnwlgvw.supabase.co');

(() => {
  'use strict';
  const { $, http, assertAuthOrRedirect, setWelcomeUsername } = window.AppCommon;

  async function init() {
    if (!assertAuthOrRedirect()) return;
    await setWelcomeUsername();

    try {
      const posts = await http('/api/images');
      const projects = await http('/api/projects');
      $('#postCount').textContent = posts.length;
      $('#projectCount').textContent = projects.length;
      $('#navPostCount').textContent = posts.length;
      $('#navProjectCount').textContent = projects.length;
    } catch (e) {
      console.error('[dashboard]', e);
    }
  }
  init();
})();
