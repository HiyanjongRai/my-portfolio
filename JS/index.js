document.addEventListener("DOMContentLoaded", () => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, cb) => el && el.addEventListener(ev, cb);

  // ---------- API base ----------
  const API_BASE = (window.API_BASE || "").replace(/\/+$/, "");
  if (!API_BASE) console.warn("[front] window.API_BASE is empty. Did you include config.js first?");

  // ---------- LOGIN DROPDOWN + AUTH ----------
  const loginForm = $("#dropdown-login-form");
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

    // Read body safely for BOTH success and error responses
    const { data, raw } = await safeRead(res);

    if (res.ok && data?.token) {
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("username", data.username || username);
      window.location.href = "dashboard.html";
      return;
    }

    // Prefer backend message if present
    const serverMsg =
      (data && (data.message || data.error)) ||
      raw ||
      "";

    // Clean fallback if backend gave nothing useful
    const fallback =
      res.status === 401 ? "Incorrect email or password."
      : res.status === 403 ? "You don’t have access to this account."
      : res.status === 400 ? "Invalid request. Please check your details."
      : res.status >= 500 ? "Server error. Please try again later."
      : `Login failed (code ${res.status}).`;

    errorMsg.textContent = serverMsg || fallback;
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Unable to connect to server. Try again later.";
  }
}

// Reads JSON if available; otherwise returns raw text. Works for error responses too.
async function safeRead(res) {
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const json = await res.json();
      return { data: json, raw: "" };
    } else {
      const text = await res.text();
      return { data: null, raw: text };
    }
  } catch {
    return { data: null, raw: "" };
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
    { threshold: 0.05 }
  );

  function addRevealTargets(root = document) {
    if (root === document) document.body.classList.add("js-reveal");
    
    // Only observe elements that already have the 'reveal' class in HTML
    const staggerParents = [
      ".expertise",
      ".education-section",
      ".projects",
      ".contact-wrapper",
      "#gallery"
    ];
    staggerParents.forEach(sel => {
      const parent = $(sel, root);
      if (!parent) return;
      const children = $$(".reveal", parent);
      children.forEach((el, i) => el.style.setProperty("--reveal-delay", i * 120));
    });

    $$(".reveal", root).forEach(el => {
      if (!el.classList.contains("is-visible")) {
        io.observe(el);
      }
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

    // Static project details (Jhapcham) - Acts as placeholder
    const staticProject = {
      id: "jhapcham-static-placeholder",
      title: "Jhapcham - Ecommerce Platform",
      description: "A full-stack ecommerce solution featuring a React frontend and Spring Boot backend. Includes a product catalog, secure shopping cart, and a responsive admin dashboard. Developed for my 6th sem project.",
      techStack: "React, Spring Boot, PostgreSQL, REST API",
      demoLink: "https://jhapcham-frontend-c21exgnp6-hiyan-jong-rais-projects.vercel.app/",
      codeLink: "https://github.com/HiyanjongRai/jhapcham-frontend.git",
      imageUrl: "images/jhapcham.png"
    };

    function createProjectHtml(project, isStatic = false) {
      const id    = project.id ?? project.projectId ?? project.imageId ?? Math.random().toString(36).slice(2);
      const title = project.title ?? project.name ?? "Untitled";
      const desc  = project.description ?? "";
      const tech  = project.techStack ?? (Array.isArray(project.tech) ? project.tech.join(", ") : (project.tech || ""));
      const demo  = isStatic ? project.demoLink : (project.demoLink ?? project.demo_url ?? "");
      const code  = isStatic ? project.codeLink : (project.codeLink ?? project.github ?? "");
      const imageUrl = isStatic ? project.imageUrl : `${API_BASE}/api/projects/image/${id}`;

      return `
        <article class="project-card reveal" 
                 id="project-${id}"
                 role="button" 
                 tabindex="0" 
                 aria-expanded="false" 
                 aria-controls="details-${id}">
          <div class="project-header">
            <img src="${imageUrl}" alt="${title}" onerror="this.src='images/logo.png'">
            <div class="header-title-box">
              <h2>${title.toUpperCase()}</h2>
              <span class="title-line"></span>
            </div>
          </div>

          <div class="project-details" id="details-${id}">
            <div class="details-inner">
              ${desc ? `<p class="project-desc">${desc}</p>` : ""}
              ${tech ? `<p class="tech-stack">Tech: ${tech}</p>` : ""}
              <div class="project-links">
                ${demo ? `<a class="demo" href="${demo}" target="_blank" rel="noopener">Live Demo</a>` : ""}
                ${code ? `<a class="code" href="${code}" target="_blank" rel="noopener">GitHub</a>` : ""}
              </div>
            </div>
          </div>
        </article>
      `;
    }

    // Toggle logic
    function toggleProjectCard(card) {
      if (!card) return;
      
      const isOpen = card.classList.contains("is-open");
      
      // Close all other cards
      $$(".project-card.is-open", container).forEach(c => {
        if (c !== card) {
          c.classList.remove("is-open");
          c.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle requested card
      if (isOpen) {
        card.classList.remove("is-open");
        card.setAttribute("aria-expanded", "false");
      } else {
        card.classList.add("is-open");
        card.setAttribute("aria-expanded", "true");
        
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 400);
      }
    }

    // 1. Initially show the static project as a high-quality placeholder
    container.innerHTML = createProjectHtml(staticProject, true);
    
    const loader = document.createElement('div');
    loader.id = "backend-projects-loader";
    loader.className = "loading-status";
    loader.innerHTML = "<p>Updating with latest projects...</p>";
    container.after(loader);

    if (typeof addRevealTargets === "function") addRevealTargets(container);

    // Event handlers for both static and dynamic cards - Attached EARLY so static card works immediately
    container.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const card = e.target.closest(".project-card");
      if (card) {
        e.preventDefault();
        toggleProjectCard(card);
      }
    });

    container.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const card = e.target.closest(".project-card");
        if (card) {
          e.preventDefault();
          toggleProjectCard(card);
        }
      }
    });

    // 2. Fetch real projects from backend
    try {
      const apiUrl = `${API_BASE}/api/projects`;
      const { error, data } = await getJSON(apiUrl);
      
      if (loader) loader.remove();

      if (!error && data) {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
        
        if (list.length > 0) {
          // Success: Clear the static placeholder and replace with live data
          container.innerHTML = ""; 
          
          const backendHtml = list.map(project => createProjectHtml(project, false)).join("");
          container.innerHTML = backendHtml;
          
          if (typeof addRevealTargets === "function") addRevealTargets(container);
        }
        // If list is empty, Jhapcham remains as the standard fallback
      }
    } catch (e) {
      console.warn("Using offline project fallback.");
    }

    // (Listeners moved up)
  })();

});
