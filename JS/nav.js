document.addEventListener('DOMContentLoaded', function() {
  const loginDropdown = document.querySelector('.login-dropdown');
  const loginToggle = document.getElementById('login-toggle');
  const dropdownContent = document.querySelector('.dropdown-content');
  
  // Mobile Menu Elements
  const menuOpen = document.getElementById('menu-open');
  const menuClose = document.getElementById('menu-close');
  const navLinks = document.getElementById('nav-links');

  // Mobile Menu Control
  const navOverlay = document.getElementById('nav-overlay');

  if (menuOpen && menuClose && navLinks) {
    menuOpen.addEventListener('click', () => {
      navLinks.classList.add('show');
      if (navOverlay) navOverlay.classList.add('show');
      document.body.style.overflow = 'hidden'; 
    });

    const closeNav = () => {
      navLinks.classList.remove('show');
      if (navOverlay) navOverlay.classList.remove('show');
      document.body.style.overflow = '';
    };

    menuClose.addEventListener('click', closeNav);
    if (navOverlay) navOverlay.addEventListener('click', closeNav);

    // Close menu when clicking a link
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && !e.target.closest('.login-dropdown')) {
        closeNav();
      }
    });
  }

  // Handle resize - close mobile menu on desktop view
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && navLinks && navLinks.classList.contains('show')) {
      navLinks.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  
  if (!loginToggle || !loginDropdown) {
    console.warn('Login elements not found');
    return;
  }
  
  // Toggle dropdown on login button click
  loginToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Login toggle clicked');
    loginDropdown.classList.toggle('open');
  });

  // Handle explicit close button
  const loginClose = document.getElementById('login-close');
  if (loginClose) {
    loginClose.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      loginDropdown.classList.remove('open');
    });
  }
  
  // Handle form submission (moved from other scripts)
  const loginForm = document.getElementById('dropdown-login-form');
  const errorMsg = document.getElementById('errorMsg');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value.trim();
      
      if (!username || !password) {
        if (errorMsg) errorMsg.textContent = 'Please enter username and password.';
        return;
      }
      
      if (errorMsg) errorMsg.textContent = 'Login not wired to backend yet.';
      
      // We don't auto-close on submit here anymore because the user wants it sticky
      // but usually a successful login should close it. 
      // For now, staying consistent with "only close on click".
      setTimeout(() => {
        if (errorMsg) errorMsg.textContent = '';
      }, 3000);
    });
  }

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.querySelector('i').classList.toggle('fa-eye');
      this.querySelector('i').classList.toggle('fa-eye-slash');
    });
  }
  
  console.log('Login dropdown consolidated handler initialized');
});
