// main.js
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

document.addEventListener("DOMContentLoaded", () => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, cb) => el && el.addEventListener(ev, cb);

  // ---------- API base ----------
  const API_BASE = (window.API_BASE || "").replace(/\/+$/, "");
  if (!API_BASE) console.warn("[front] window.API_BASE is empty. Did you include config.js first?");

  // ---------- NAV MENU ----------
  const menuOpen  = $("#menu-open");
  const menuClose = $("#menu-close");
  const navLinks  = $("#nav-links");
  on(menuOpen,  "click", () => navLinks && navLinks.classList.add("show"));
  on(menuClose, "click", () => navLinks && navLinks.classList.remove("show"));

  // ---------- LOGIN DROPDOWN + AUTH ----------
  const loginDropdown   = $(".login-dropdown");
  const loginToggle     = $("#login-toggle");
  const dropdownContent = loginDropdown?.querySelector(".dropdown-content");
  const loginForm       = $("#dropdown-login-form");

  on(loginToggle, "click", e => {
    e.preventDefault();
    loginDropdown?.classList.toggle("open");
  });
  on(dropdownContent, "click", e => e.stopPropagation());
  on(document, "click", e => {
    if (loginDropdown && !loginDropdown.contains(e.target)) {
      loginDropdown.classList.remove("open");
    }
  });

  on(loginForm, "submit", async e => {
    e.preventDefault();
    await login();
  });

  async function login() {
    const username = $("#username")?.value.trim();
    const password = $("#password")?.value.trim();
    const errorMsg = $("#errorMsg");
    if (!errorMsg) return;

    errorMsg.textContent = "";
    if (!username || !password) {
      errorMsg.textContent = "Please enter both username and password.";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      let data = {};
      try { data = await res.json(); } catch {}

      if (res.ok && data.token) {
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("username", data.username || username);
        window.location.href = "dashboard.html";
      } else {
        errorMsg.textContent = data.error || `Login failed (HTTP ${res.status}).`;
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Unable to connect to server. Try again later.";
    }
  }

  // ---------- EXPERTISE CARDS ----------
  $$("#expertise-heading .card").forEach(card => {
    on(card, "click", () => toggleCard(card));
    on(card, "keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCard(card);
      }
    });
  });
  function toggleCard(card) {
    const isOpen = card.classList.toggle("open");
    card.setAttribute("aria-expanded", isOpen);
  }

  // ---------- SCROLL REVEAL ----------
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  function addRevealTargets(root = document) {
    const targets = [
      ".text#expertise h1",
      ".description p",
      ".expertise .card",
      ".education-section h2",
      ".education-section .edu-card",
      ".project h1",
      ".projects .project-card",
      ".highlights h1",
      "#gallery li",
      ".contact h1",
      ".contact .contact-card"
    ];
    targets.forEach(sel => {
      $$(sel, root).forEach(el => el.classList.add("reveal"));
    });

    const staggerParents = [
      ".expertise",
      ".education-section .edu-date",
      ".projects",
      ".contact .contact-wrapper",
      "#gallery"
    ];
    staggerParents.forEach(sel => {
      const children = $$(sel + " .reveal", root);
      children.forEach((el, i) => el.style.setProperty("--reveal-delay", i * 120));
    });

    $$(".reveal", root).forEach(el => {
      if (!el.classList.contains("is-visible")) io.observe(el);
    });
  }

  addRevealTargets();

  async function getJSON(url) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        console.error("HTTP error", res.status, res.statusText, "for", url);
        return { error: `HTTP ${res.status}`, data: null };
      }
      const data = await res.json();
      return { error: null, data };
    } catch (e) {
      console.error("Network/parse error for", url, e);
      return { error: e.message, data: null };
    }
  }

  // ---------- PROJECTS ----------

  (async function loadProjects() {
    const container = document.querySelector("#projects-container");
    if (!container) return;

    const apiUrl = `${API_BASE}/api/projects`;
    const { error, data } = await getJSON(apiUrl);

    if (error) {
      container.innerHTML = `<p style="color:#c33">Could not load projects: ${error}</p>`;
      return;
    }

    const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
    if (!list.length) {
      container.innerHTML = "<p>No projects found.</p>";
      return;
    }

    const html = list.map(project => {
      const id    = project.id ?? project.projectId ?? project.imageId ?? Math.random().toString(36).slice(2);
      const title = project.title ?? project.name ?? "Untitled";
      const desc  = project.description ?? "";
      const tech  = project.techStack ?? (Array.isArray(project.tech) ? project.tech.join(", ") : (project.tech || ""));
      const demo  = project.demoLink ?? project.demo_url ?? "";
      const code  = project.codeLink ?? project.github ?? "";
      const imageUrl = `${API_BASE}/api/projects/image/${id}`;

      return `
        <article class="project-card reveal" role="button" tabindex="0" aria-expanded="false" aria-controls="details-${id}">
          <div class="project-header">
            <img src="${imageUrl}" alt="${title}">
            <h2>${title}</h2>
          </div>

          <div class="project-details" id="details-${id}">
            ${desc ? `<p>${desc}</p>` : ""}
            ${tech ? `<p class="tech-stack">Tech: ${tech}</p>` : ""}
            ${(demo || code) ? `
              <div class="project-links">
                ${demo ? `<a class="demo" href="${demo}" target="_blank" rel="noopener">Live Demo</a>` : ""}
                ${code ? `<a class="code" href="${code}" target="_blank" rel="noopener">GitHub</a>` : ""}
              </div>` : ""}
          </div>
        </article>
      `;
    }).join("");

    container.innerHTML = html;

    // toggle handlers
    container.addEventListener("click", (e) => {
      const card = e.target.closest(".project-card");
      if (!card) return;
      toggleCard(card);
    });
    container.addEventListener("keydown", (e) => {
      const card = e.target.closest(".project-card");
      if (!card) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCard(card);
      }
    });

    function toggleCard(card){
      const open = card.classList.toggle("is-open");
      card.setAttribute("aria-expanded", String(open));
      // optional: close others
      [...container.querySelectorAll(".project-card.is-open")].forEach(c=>{
        if(c!==card){ c.classList.remove("is-open"); c.setAttribute("aria-expanded","false"); }
      });
    }

    // keep your reveal helper if you use it
    if (typeof addRevealTargets === "function") addRevealTargets(container);
  })();

});
