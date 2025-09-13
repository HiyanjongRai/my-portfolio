// app.js
const API_BASE = (typeof window !== "undefined" && window.API_BASE) 
  ? window.API_BASE 
  : "http://localhost:8080"; // safety fallback for local dev

console.log("Using API_BASE:", API_BASE);

const $ = (sel, root=document) => root.querySelector(sel);
const gallery = $("#gallery");
const lb = $("#lightbox");
const lbClose = $("#lb-close");
const lbImg = $("#lb-img");
const lbTitle = $("#lb-title");
const lbDesc = $("#lb-desc");

const normalizeUrl = (u) => (u && u.startsWith("http")) ? u : `${API_BASE}${u || ""}`;

function makeCard(item){
  const el = document.createElement("article");
  el.className = "card";
  const name = item.name || "Untitled";
  const url = normalizeUrl(item.url);

  el.innerHTML = `
    <img class="thumb" src="${url}" alt="${name}">
    <div class="hover-title">${name}</div>
  `;

  let t=null;
  const peek=()=>{ el.classList.add("peek"); clearTimeout(t); t=setTimeout(()=>el.classList.remove("peek"), 300); };
  el.addEventListener("pointermove", peek);
  el.addEventListener("pointerdown", peek);

  el.addEventListener("click", () => openLightbox({ title: name, desc: item.description, url }));
  return el;
}

function openLightbox({ title, desc, url }){
  lbTitle.textContent = title || "Untitled";
  lbDesc.textContent  = desc || "No description provided.";
  lbImg.src = normalizeUrl(url);
  lbImg.alt = title || "image";

  if (typeof lb.showModal === "function") lb.showModal();
  else lb.setAttribute("open", "");
  document.body.classList.add("modal-open");
}

function closeLightbox(){
  if (typeof lb.close === "function" && lb.open) lb.close();
  else lb.removeAttribute("open");
  document.body.classList.remove("modal-open");
}

lbClose.addEventListener("click", closeLightbox);
lb.addEventListener("click", (e) => {
  if (!document.querySelector(".sheet").contains(e.target)) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && (lb.open || lb.hasAttribute("open"))) closeLightbox();
});

async function loadImages(){
  gallery.innerHTML = `<div class="loading">Loading images, please wait…</div>`;

  // extra safety: abort if API_BASE still missing
  if (!API_BASE || API_BASE === "undefined") {
    console.error("API_BASE is not set. Check that config.js is loaded before app.js.");
    gallery.innerHTML = `<div class="error">Config not loaded. Make sure <code>config.js</code> is included before <code>app.js</code>.</div>`;
    return;
  }

  const url = `${API_BASE}/api/images`;
  console.log("Fetching:", url);

  try{
    const res = await fetch(url, { credentials: "include" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    gallery.innerHTML = "";
    if(!Array.isArray(data) || data.length === 0){
      gallery.innerHTML = `<div class="empty">No images found.</div>`;
      return;
    }
    data.forEach(item => gallery.appendChild(makeCard(item)));
  }catch(err){
    console.error(err);
    gallery.innerHTML = `<div class="error">Could not load images (${err.message}).</div>`;
  }
}

loadImages();


(function(){
  const menuOpen  = document.getElementById('menu-open');
  const menuClose = document.getElementById('menu-close');
  const navLinks  = document.getElementById('nav-links');
  const loginToggle = document.getElementById('login-toggle');
  const loginDropdown = document.querySelector('.login-dropdown');
  const loginForm = document.getElementById('dropdown-login-form');
  const errorMsg = document.getElementById('errorMsg');

  // Mobile menu open/close
  if (menuOpen && navLinks){
    menuOpen.addEventListener('click', () => navLinks.classList.add('open'));
  }
  if (menuClose && navLinks){
    menuClose.addEventListener('click', () => navLinks.classList.remove('open'));
  }
  // Close menu when clicking a link (mobile)
  if (navLinks){
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') navLinks.classList.remove('open');
    });
  }

  // Login dropdown toggle (desktop)
  if (loginToggle && loginDropdown){
    loginToggle.addEventListener('click', (e) => {
      e.preventDefault();
      loginDropdown.classList.toggle('open');
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (loginDropdown && !loginDropdown.contains(e.target) && e.target !== loginToggle){
      loginDropdown.classList.remove('open');
    }
  });

  // Simple login handler (demo)
  if (loginForm){
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = loginForm.username.value.trim();
      const p = loginForm.password.value.trim();
      if (!u || !p){
        errorMsg.textContent = "Please enter username and password.";
        return;
      }
      // TODO: replace with your real login call
      errorMsg.textContent = "Login not wired to backend yet.";
      setTimeout(() => {
        errorMsg.textContent = "";
        loginDropdown.classList.remove('open');
      }, 1200);
    });
  }
})();

