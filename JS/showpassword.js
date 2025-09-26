
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");

  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
      passwordField.setAttribute("type", type);
      togglePassword.textContent = type === "password" ? "👁" : "🙈";
    });
  }

  // Mobile Menu
  const menuOpen = document.getElementById("menu-open");
  const menuClose = document.getElementById("menu-close");
  const navLinks = document.getElementById("nav-links");

  if (menuOpen && menuClose) {
    menuOpen.addEventListener("click", () => navLinks.classList.add("show"));
    menuClose.addEventListener("click", () => navLinks.classList.remove("show"));
  }
