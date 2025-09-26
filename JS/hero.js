 (function typedLine(){
      const el = document.getElementById('typed');
      if (!el) return;

      const phrases = [
        'Backend Developer',
        'BCA Student',
        'Spring Boot • PostgreSQL',
        'Clean APIs • Simple UX'
      ];

      if (matchMedia('(prefers-reduced-motion: reduce)').matches){
        el.textContent = phrases[0];
        return;
      }

      // Reserve exact height for the tallest phrase
      const longest = phrases.reduce((a,b)=> a.length > b.length ? a : b);
      const prev = el.textContent;
      el.style.visibility = 'hidden';
      el.textContent = longest;
      const h = el.getBoundingClientRect().height;
      el.style.minHeight = Math.ceil(h) + 'px';
      el.textContent = '';
      el.style.visibility = 'visible';

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