// main.js
document.addEventListener("DOMContentLoaded", () => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, cb) => el && el.addEventListener(ev, cb);

  // ---------- API base ----------
  const API_BASE =
    (location.hostname === "localhost" || location.hostname === "127.0.0.1")
      ? "http://localhost:8080"
      : "http://localhost:8080"; 

  // ---------- NAV MENU ----------
  const menuOpen  = $("#menu-open");
  const menuClose = $("#menu-close");
  const navLinks  = $("#nav-links");
  on(menuOpen,  "click", () => navLinks && navLinks.classList.add("show"));
  on(menuClose, "click", () => navLinks && navLinks.classList.remove("show"));

  // ---------- LOGIN DROPDOWN + AUTH ----------
  const loginDropdown = $(".login-dropdown");
  const loginToggle   = $("#login-toggle");
  const dropdownContent  = loginDropdown?.querySelector(".dropdown-content");
  const loginForm     = $("#dropdown-login-form");

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
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("username", data.username || username);
        window.location.href = "dashboard.html";
      } else {
        errorMsg.textContent = data.error || "Login failed. Please check your credentials.";
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Unable to connect to server. Try again later.";
    }
  }

  // ---------- EXPERTISE CARDS  ----------
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
    const container = $("#projects-container");
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
      const id = project.id ?? project.projectId ?? project.imageId;
      const title = project.title ?? project.name ?? "Untitled";
      const desc = project.description ?? "";
      const tech = project.techStack ?? (Array.isArray(project.tech) ? project.tech.join(", ") : (project.tech || ""));
      const demo = project.demoLink ?? project.demo_url ?? "";
      const code = project.codeLink ?? project.github ?? "";
      const imageUrl = `${API_BASE}/api/projects/image/${id}`;

      return `
        <div class="project-card reveal">
          <img src="${imageUrl}" alt="${title}">
          <div class="project-content">
            <h2>${title}</h2>
            <p>${desc}</p>
            ${tech ? `<p class="tech-stack">Tech: ${tech}</p>` : ""}
            <div class="project-links">
              ${demo ? `<a href="${demo}" class="demo" target="_blank" rel="noopener">Live Demo</a>` : ""}
              ${code ? `<a href="${code}" class="code" target="_blank" rel="noopener">GitHub</a>` : ""}
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = html;
    addRevealTargets(container);
  })();

  (async function loadImages() {
    const gallery = $("#gallery");
    const lightbox = $("#lightbox");
    const lightboxImg = $("#lightbox-img");
    const lightboxCaption = $("#lightbox-caption");
    const closeBtn = $("#close");
    if (!gallery) return;

    const apiUrl = `${API_BASE}/api/images`;
    const { error, data } = await getJSON(apiUrl);

    if (error) {
      gallery.innerHTML = `<p style="text-align:center;color:#c33;">Could not load images: ${error}</p>`;
      return;
    }

    const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
    if (!list.length) {
      gallery.innerHTML = "<p style='text-align:center;color:white;'>No images found.</p>";
      return;
    }

    gallery.innerHTML = "";
    list.forEach(item => {
      const id = item.id ?? item.imageId;
      const name = item.name ?? item.title ?? `Image ${id}`;
      const desc = item.description ?? "";
      const li = document.createElement("li");
      li.classList.add("reveal");
      li.innerHTML = `
        <img src="${apiUrl}/${id}" alt="${name}">
        <div class="caption">${name}</div>
      `;

      const img = li.querySelector("img");
      on(img, "click", () => {
        if (!lightbox || !lightboxImg || !lightboxCaption) return;
        lightboxImg.src = `${apiUrl}/${id}`;
        lightboxCaption.textContent = desc || "No description available";
        lightbox.style.display = "flex";
      });

      gallery.appendChild(li);
    });

    addRevealTargets(gallery);

    on(closeBtn, "click", () => { if (lightbox) lightbox.style.display = "none"; });
    on(lightbox, "click", e => {
      if (e.target === lightbox) lightbox.style.display = "none";
    });
  })();
});
