 (function typedLine(){
      const el = document.getElementById('typed');
      if (!el) return;

      const phrases = [
        'Backend Developer',
        'BCA Student',
        'Full Stack Enthusiast'
      ];

      if (matchMedia('(prefers-reduced-motion: reduce)').matches){
        el.textContent = phrases[0];
        return;
      }

      // Removed manual min-height calculation to prevent layout collapse on mobile

      let i = 0, j = 0, dir = 1;
      const TYPE = 120, ERASE = 60, HOLD = 1800, GAP = 500;

      function tick(){
        const full = phrases[i];
        el.textContent = full.slice(0, j);

        if (dir > 0 && j < full.length){ j++; return setTimeout(tick, TYPE); }
        if (dir > 0 && j === full.length){ dir = -1; return setTimeout(tick, HOLD); }
        if (dir < 0 && j > 0){ j--; return setTimeout(tick, ERASE); }
        if (dir < 0 && j === 0){ dir = 1; i = (i + 1) % phrases.length; return setTimeout(tick, GAP); }
      }
      tick();
    })();
    
    // Cycle between English and Nepali names with typewriter effect
    (function typeName() {
      const nameFirst = document.querySelector(".title .highlight");
      const nameLast = document.querySelector(".title .highlight-sub");
      
      if (!nameFirst || !nameLast) return;
      
      // Array of spreadable strings.
      // Spread operator beautifully preserves unicode components for realistic Nepali typing.
      const names = [
        { first: [... "Hiyan"], last: [... "Jong Rai"] },
        { first: [... "हियान"], last: [... "जोंग राई"] }
      ];
      
      let langIndex = 0;
      let isDeleting = false;
      let charIndex = names[0].first.length + names[0].last.length; // Start fully typed in English
      
      function typeLoop() {
        const currentName = names[langIndex];
        const totalLength = currentName.first.length + currentName.last.length;
        
        let typeSpeed = isDeleting ? 40 : 100;
        
        if (!isDeleting) {
           charIndex++;
        } else {
           charIndex--;
        }
        
        // Distribution of typed characters over the two lines
        let typedFirst = 0;
        let typedLast = 0;
        
        if (charIndex <= currentName.first.length) {
          typedFirst = charIndex;
          typedLast = 0;
        } else {
          typedFirst = currentName.first.length;
          typedLast = charIndex - currentName.first.length;
        }
        
        // Join the typed character arrays
        nameFirst.textContent = currentName.first.slice(0, typedFirst).join("");
        nameLast.textContent = currentName.last.slice(0, Math.max(0, typedLast)).join("");
        
        // Handle state changes
        if (!isDeleting && charIndex === totalLength) {
          // Pause when fully typed
          typeSpeed = 1500; 
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          // Switch languages when fully erased
          isDeleting = false;
          langIndex = (langIndex + 1) % names.length;
          typeSpeed = 300; // Small pause before typing new word
        }
        
        setTimeout(typeLoop, typeSpeed);
      }
      
      // Delay start to allow GSAP entrance animation to finish
      setTimeout(() => {
        isDeleting = true; 
        typeLoop();
      }, 3000); 
    })();

    /* Hero slider */
    (function heroSlider(){
      const track = document.getElementById('heroTrack');
      if (!track) return;

      const slides = Array.from(track.children);
      slides.forEach(s=>{
        const src = s.getAttribute('data-bg');
        if (src) s.style.backgroundImage = `url("${encodeURI(src)}")`;
      });

      let index = 0;
      const getLeft = i => slides[i]?.offsetLeft ?? 0;

      function goTo(i, smooth){
        index = (i + slides.length) % slides.length;
        if (smooth){
          track.scrollTo({ left: getLeft(index), behavior: 'smooth' });
        }else{
          track.style.scrollBehavior = 'auto';
          track.scrollLeft = getLeft(index);
          track.offsetHeight;
          track.style.scrollBehavior = 'smooth';
        }
        restart();
      }

      // Sync while swiping
      let ticking = false;
      track.addEventListener('scroll', ()=>{
        if (ticking) return;
        requestAnimationFrame(()=>{
          const nearest = slides.reduce((best, s, i)=>{
            const dist = Math.abs(track.scrollLeft - s.offsetLeft);
            return dist < best.dist ? { i, dist } : best;
          }, { i: index, dist: Infinity }).i;
          index = nearest;
          ticking = false;
        });
        ticking = true;
      }, { passive: true });

      // Controls
      document.getElementById('prevBtn')?.addEventListener('click', ()=>goTo(index-1, true));
      document.getElementById('nextBtn')?.addEventListener('click', ()=>goTo(index+1, true));
      addEventListener('keydown', e=>{
        if (e.key === 'ArrowLeft')  goTo(index-1, true);
        if (e.key === 'ArrowRight') goTo(index+1, true);
      });

      // Auto advance
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let timer = null;
      const INTERVAL = 5000;

      function start(){ if (!reduce && !timer) timer = setInterval(()=>goTo(index+1, false), INTERVAL); }
      function stop(){ if (timer){ clearInterval(timer); timer = null; } }
      function restart(){ stop(); start(); }

      document.addEventListener('visibilitychange', ()=>{ document.hidden ? stop() : start(); });
      addEventListener('resize', ()=>{ track.scrollLeft = getLeft(index); });

      start();
    })();