window.addEventListener('load', () => {
    // Give it a tiny delay to ensure animations finish at least one cycle
    setTimeout(() => {
      document.getElementById('gf-loader').classList.add('loaded');
      
      // Resume animations on body after the loader starts to slide out
      setTimeout(() => {
          document.body.classList.add('loaded');
      }, 400); // 400ms half way through slide out
    }, 1200); // Minimum 1.2s loader display
  });
