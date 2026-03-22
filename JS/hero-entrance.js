// hero-entrance.js
// Handles an ultra-premium, Jitter-inspired masked entrance sequence
document.addEventListener("DOMContentLoaded", () => {
  
  // Set initial states for elements
  // Main title lines are pushed completely down out of their overflow:hidden wrappers
  gsap.set(".hero-line", { y: "140%", rotation: 4, opacity: 0 }); 
  
  // The subtle separator line starts at 0 width
  gsap.set(".hero-divider", { scaleX: 0, transformOrigin: "left center" });
  
  // Symmetrical metadata entrance
  gsap.set(".hero-left-text", { x: -40, opacity: 0 });
  gsap.set(".hero-right-text", { x: 40, opacity: 0 });
  
  // Bottom text and buttons
  gsap.set(".hero-inner .typed", { y: 20, opacity: 0 });
  gsap.set(".nav-btn", { scale: 0, opacity: 0 });

  // Only play the hero sequence after the loading screen formally exits
  const checkLoaded = () => {
    if (document.body.classList.contains("loaded")) {
      playHeroSequence();
    } else {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "class" && document.body.classList.contains("loaded")) {
            observer.disconnect();
            playHeroSequence();
          }
        });
      });
      observer.observe(document.body, { attributes: true });
    }
  };

  setTimeout(checkLoaded, 50);

  function playHeroSequence() {
    const tl = gsap.timeline({ 
      // Jitter's signature "Slow down" feel is closely replicated by expo.out and 1.6s lengths
      defaults: { ease: "expo.out", duration: 1.6 } 
    });

    // 1. Masked slide-up for main titles (staggered step-by-step)
    tl.to(".hero-line", {
      y: "0%",
      rotation: 0,
      opacity: 1,
      stagger: 0.15
    }, "+=0.2")

    // 2. Growing elegant separator line
    .to(".hero-divider", {
      scaleX: 1,
      duration: 1.4
    }, "-=1.1")

    // 3. Symmetrical sliding metadata (sliding in toward each other)
    .to(".hero-left-text", {
      x: 0,
      opacity: 1,
      duration: 1.4,
      ease: "power3.out"
    }, "-=1.2")
    .to(".hero-right-text", {
      x: 0,
      opacity: 1,
      duration: 1.4,
      ease: "power3.out"
    }, "-=1.4")

    // 4. Smooth reveal of the typed dynamic text at the bottom
    .to(".hero-inner .typed", {
      y: 0,
      opacity: 1,
      duration: 1.2
    }, "-=1.2")

    // 5. Pop in the side slider arrows
    .to(".nav-btn", {
      scale: 1,
      opacity: 1,
      duration: 1.0,
      stagger: 0.15,
      ease: "back.out(1.5)"
    }, "-=1.2");

    // Continuous floating hover/loop effect for the slider arrows
    gsap.to(".nav-btn", {
      y: "-=6",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      duration: 1.8,
      delay: 1.5 
    });
  }
});
