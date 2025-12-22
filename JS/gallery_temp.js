
(() => {
    // Run after config.js (defer) has set window.API_BASE
    const onReady = (fn) =>
      (document.readyState === 'loading'
        ? window.addEventListener('DOMContentLoaded', fn, { once: true })
        : fn());
  
    onReady(start);
  
    function resolveApiBase() {
      const meta = document.querySelector('meta[name="api-base"]')?.getAttribute('content');
      // Order: config.js -> <meta name="api-base"> -> current origin
      const base = (window.API_BASE || meta || window.location.origin).replace(/\/+$/, '');
      return base;
    }
  
    function start() {
      const API_BASE = resolveApiBase();
      console.log(
        `%cAPI_BASE â†’ ${API_BASE}`,
        'background:#003153;color:#fff;padding:4px 8px;border-radius:6px;font-weight:bold;'
      );
  
      // Helpers
      const $ = (sel, root = document) => root.querySelector(sel);
      const gallery = $('#gallery');
      const detail  = $('#detail');
      const statusEl= $('#gallery-status');
  
      const ariaLive = (() => {
        const el = document.createElement('div');
        el.setAttribute('aria-live','polite');
        el.className='sr-only';
        document.body.appendChild(el);
        return (m)=> el.textContent=m;
      })();
  
      const normalizeUrl = (u) => {
        if (!u) return '';
        if (/^https?:\/\//i.test(u)) return u;
        return `${API_BASE}/${String(u).replace(/^\/+/, '')}`;
      };
  
      // Only send cookies for same-origin to avoid CORS headaches on Render
      const isSameOrigin = (url) => {
        try { return new URL(url).origin === window.location.origin; }
        catch { return false; }
      };
  
      let items = [];
      let currentIndex = -1;
  
      async function fetchJSON(url, { timeout = 12000, retries = 2 } = {}) {
        const creds = isSameOrigin(url) ? 'include' : 'omit';
        for (let attempt = 0; attempt <= retries; attempt++) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeout);
          try {
            const res = await fetch(url, { credentials: creds, signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
          } catch (err) {
            clearTimeout(timer);
            if (attempt === retries) throw err;
            await new Promise(r => setTimeout(r, 350 * (attempt + 1)));
          }
        }
      }
  
      function skeletonCard(){
        const el=document.createElement('article');
        el.className='card skeleton';
        el.innerHTML='<div class="thumb" aria-hidden="true"></div><div class="hover-title" aria-hidden="true"></div>';
        return el;
      }
  
      function makeCard(item, index){
        const el = document.createElement('article'); 
        el.className='card fade-in-up';
        el.style.animationDelay = `${index * 50}ms`;
        const name = item.name || 'Untitled';
        const url  = normalizeUrl(item.url);
  
        const img = document.createElement('img');
        img.className='thumb';
        img.loading='lazy';
        img.decoding='async';
        img.alt=name;
        img.src=url;
        img.addEventListener('load', ()=>{
          Promise.resolve(img.decode?.()).catch(()=>{}).finally(()=> img.classList.add('is-ready'));
        });
  
        const title = document.createElement('div');
        title.className='hover-title';
        title.textContent=name;
  
        el.append(img, title);
  
        let t=null; const peek=()=>{ el.classList.add('peek'); clearTimeout(t); t=setTimeout(()=>el.classList.remove('peek'),220); };
        el.addEventListener('pointermove', peek, { passive:true });
        el.addEventListener('pointerdown', peek, { passive:true });
  
        el.tabIndex=0; el.setAttribute('role','button'); el.setAttribute('aria-label',`Open details for: ${name}`);
        const open=()=> openDetail(index);
        el.addEventListener('click', open);
        img.addEventListener('click', open);
        el.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); }});
  
        return el;
      }
  
      function renderDetail(idx){
        const item = items[idx];
        if(!item){ detail.hidden = true; detail.innerHTML=''; return; }
        const title = item.name || 'Untitled';
        const desc  = item.description || 'No description provided.';
        const url   = normalizeUrl(item.url);
  
        detail.innerHTML = `
          <article class="detail-card scale-in" role="region" aria-label="Image details">
            <div class="detail-media"><img src="${url}" alt="${title}"></div>
            <div class="detail-info">
              <div class="detail-title">${title}</div>
              <div class="detail-desc">${desc}</div>
              <div class="detail-actions">
                <button id="dt-prev" aria-label="Previous (â†)"><i class="fa-solid fa-arrow-left"></i></button>
                <button id="dt-next" aria-label="Next (â†’)"><i class="fa-solid fa-arrow-right"></i></button>
                <button id="dt-open" aria-label="Open original in new tab"><i class="fa-solid fa-up-right-from-square"></i></button>
                <button id="dt-close" aria-label="Close details"><i class="fa-solid fa-xmark"></i></button>
              </div>
            </div>
          </article>`;
  
        detail.querySelector('#dt-open')?.addEventListener('click', ()=> window.open(url,'_blank','noopener'));
        detail.querySelector('#dt-prev')?.addEventListener('click', prevImage);
        detail.querySelector('#dt-next')?.addEventListener('click', nextImage);
        detail.querySelector('#dt-close')?.addEventListener('click', ()=> { detail.hidden = true; ariaLive('Closed details'); });
  
        detail.hidden = false;
        ariaLive(`Opened ${title} (${idx+1} of ${items.length})`);
        detail.scrollIntoView({ behavior:'smooth', block:'start' });
      }
  
      function openDetail(idx){ currentIndex = idx; renderDetail(currentIndex); }
      function nextImage(){ if(!items.length) return; currentIndex = (currentIndex + 1) % items.length; renderDetail(currentIndex); }
      function prevImage(){ if(!items.length) return; currentIndex = (currentIndex - 1 + items.length) % items.length; renderDetail(currentIndex); }
  
      document.addEventListener('keydown', (e)=>{
        if (detail.hidden) return;
        if (e.key === 'Escape') { detail.hidden = true; ariaLive('Closed details'); }
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft')  prevImage();
      });
  
      async function loadImages(){
        if(!gallery) return;
        statusEl.textContent='I m using the free backend, so please hang tight for about 25 seconds it takes time to fetch it.';
        gallery.innerHTML=''; for(let i=0;i<8;i++) gallery.appendChild(skeletonCard());
  
        const url = `${API_BASE}/api/images`;
        try{
          const data = await fetchJSON(url);
          gallery.innerHTML='';
          if(!Array.isArray(data) || data.length===0){ statusEl.textContent='No images found.'; return; }
          items = data.map(d=>({ name:d.name||'Untitled', description:d.description||'', url:d.url||'' }));
          items.forEach((it,idx)=> gallery.appendChild(makeCard(it,idx)));
          statusEl.textContent = `Loaded ${items.length} image${items.length>1?'s':''}. Click one to see details.`;
        }catch(err){
          console.error('[loadImages]', err);
          gallery.innerHTML='';
          const blocked = /ERR_BLOCKED_BY_CLIENT/i.test(String(err?.message));
          statusEl.textContent = blocked
            ? 'Request blocked by a browser extension. Disable it or proxy /api to your backend.'
            : `Could not load images (${err.message}).`;
        }
      }
  
      loadImages();
  
    }
  })();
