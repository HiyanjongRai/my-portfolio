  (function animateBars(){
    const section = document.getElementById('about');
    const fills = [...section.querySelectorAll('.bar-fill')];

    const setWidths = (on) => fills.forEach(el => {
      el.style.width = on ? (el.style.getPropertyValue('--p') || '0%') : '0%';
    });

    setWidths(false);

    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setWidths(true);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(section);
  })();

  // Count-up projects metric
  (function countUp(){
    const el = document.querySelector('.metric .count');
    if (!el) return;
    const target = parseInt(el.dataset.target || '0', 10);
    let start = 0, t0 = null;
    const dur = 3000;

    const step = ts => {
      if (!t0) t0 = ts;
      const p = Math.min(1, (ts - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((ents) => {
      if (ents.some(e => e.isIntersecting)) {
        requestAnimationFrame(step);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
  })();