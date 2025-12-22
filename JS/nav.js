// Simple, dedicated login dropdown handler
// This ensures the login dropdown works without conflicts

document.addEventListener('DOMContentLoaded', function() {
  const loginDropdown = document.querySelector('.login-dropdown');
  const loginToggle = document.getElementById('login-toggle');
  const dropdownContent = document.querySelector('.dropdown-content');
  
  if (!loginToggle || !loginDropdown) {
    console.warn('Login elements not found');
    return;
  }
  
  // Toggle dropdown on login button click
  loginToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Login toggle clicked'); // Debug log
    loginDropdown.classList.toggle('open');
  });
  
  // Prevent dropdown from closing when clicking inside it
  if (dropdownContent) {
    dropdownContent.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (loginDropdown && !loginDropdown.contains(e.target)) {
      loginDropdown.classList.remove('open');
    }
  });
  
  // Close dropdown on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && loginDropdown.classList.contains('open')) {
      loginDropdown.classList.remove('open');
    }
  });
  
  console.log('Login dropdown handler initialized');
});
