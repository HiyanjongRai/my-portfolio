// Centralized navbar logic for all pages
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const on = (el, ev, cb) => el && el.addEventListener(ev, cb);

  // Mobile menu toggle
  const menuOpen = $("#menu-open");
  const menuClose = $("#menu-close");
  const navLinks = $("#nav-links");

  on(menuOpen, "click", () => navLinks && navLinks.classList.add("show"));
  on(menuClose, "click", () => navLinks && navLinks.classList.remove("show"));

  // Login dropdown
  const loginDropdown = $(".login-dropdown");
  const loginToggle = $("#login-toggle");
  const dropdownContent = loginDropdown?.querySelector(".dropdown-content");

  on(loginToggle, "click", (e) => {
    e.preventDefault();
    loginDropdown?.classList.toggle("open");
  });

  // Stop dropdown from closing when clicking inside it
  on(dropdownContent, "click", (e) => e.stopPropagation());

  // Close dropdown when clicking outside
  on(document, "click", (e) => {
    if (loginDropdown && !loginDropdown.contains(e.target)) {
      loginDropdown.classList.remove("open");
    }
  });

  // Password visibility toggle
  const togglePassword = $("#togglePassword");
  on(togglePassword, "click", () => {
    const passwordField = $("#password");
    if (!passwordField) return;
    passwordField.type = passwordField.type === "password" ? "text" : "password";
  });
});
