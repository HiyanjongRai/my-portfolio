// Enhanced Navigation - Active Section Highlighting and Dynamic Title
(function() {
  const navLinks = document.querySelectorAll('#nav-links a[href^="#"]');
  const sections = document.querySelectorAll('section[id], div[id]');
  const originalTitle = document.title;
  
  // Section titles mapping
  const sectionTitles = {
    'home': 'Home - Hiyan Jong Rai',
    'about': 'About Me - Hiyan Jong Rai',
    'expertised': 'My Expertise - Hiyan Jong Rai',
    'education': 'Education - Hiyan Jong Rai',
    'project': 'Projects - Hiyan Jong Rai',
    'contact': 'Contact Me - Hiyan Jong Rai'
  };
  
  // Function to update active nav link
  function updateActiveLink(sectionId) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.style.color = '#667eea';
        link.style.fontWeight = '600';
      } else {
        link.style.color = '';
        link.style.fontWeight = '';
      }
    });
    
    // Update page title
    if (sectionTitles[sectionId]) {
      document.title = sectionTitles[sectionId];
    }
  }
  
  // Intersection Observer for automatic section detection
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute('id');
        if (sectionId) {
          updateActiveLink(sectionId);
          
          // Update URL hash without scrolling
          if (window.history.replaceState) {
            window.history.replaceState(null, null, `#${sectionId}`);
          }
        }
      }
    });
  }, observerOptions);
  
  // Observe all sections
  sections.forEach(section => {
    if (section.id) {
      observer.observe(section);
    }
  });
  
  // Smooth scroll and immediate title update on click
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if this is the login toggle or other special links
      if (this.id === 'login-toggle' || !href.startsWith('#')) {
        return;
      }
      
      e.preventDefault();
      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Update title immediately
        if (sectionTitles[targetId]) {
          document.title = sectionTitles[targetId];
        }
        
        // Smooth scroll to section
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update active link
        updateActiveLink(targetId);
        
        // Close mobile menu if open
        const navLinksContainer = document.getElementById('nav-links');
        if (navLinksContainer && window.innerWidth <= 768) {
          navLinksContainer.classList.remove('active');
        }
      }
    });
  });
  
  // Set initial active state based on current hash or default to home
  const initialHash = window.location.hash.substring(1) || 'home';
  updateActiveLink(initialHash);
  
})();
