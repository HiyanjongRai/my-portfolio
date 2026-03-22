document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".xp-grid");
  if (!grid) return;

  const cards = Array.from(document.querySelectorAll(".xp-card"));
  
  // Create overlay and modal
  const overlay = document.createElement("div");
  overlay.id = "xp-modal-overlay";
  
  const modal = document.createElement("div");
  modal.id = "xp-modal";
  
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  let currentIndex = 0;
  let isModalOpen = false;

  // Extended Details for each card
  const extendedDetails = [
    {
      subtitle: "Full-Stack Web Solutions",
      points: [
        "Custom highly-responsive frontend interfaces",
        "Robust, scalable backend architecture",
        "Integration with modern API tools",
        "Performance optimization and lazy loading"
      ]
    },
    {
      subtitle: "User-Centered Design",
      points: [
        "Wireframing and rapid prototyping",
        "Modern glassmorphism and motion-first aesthetics",
        "Extensive usability and accessibility testing",
        "Seamless developer handoffs"
      ]
    },
    {
      subtitle: "Scalable Infrastructure",
      points: [
        "AWS and Google Cloud Platform deployment",
        "Serverless architecture patterns",
        "Docker containerization & orchestration",
        "Cost-optimization strategies"
      ]
    },
    {
      subtitle: "Data Reliability",
      points: [
        "Complex schema design and normalization",
        "High-performance indexing and query optimization",
        "PostgreSQL and MySQL database administration",
        "Automated backup and recovery systems"
      ]
    },
    {
      subtitle: "Search Visibility",
      points: [
        "Technical SEO optimization (Core Web Vitals)",
        "On-page and metadata restructuring",
        "Keyword research and content strategy",
        "Analytics and conversion tracking"
      ]
    },
    {
      subtitle: "Server-Side Logic",
      points: [
        "Spring Boot microservices architecture",
        "Secure RESTful API development",
        "Authentication and role-based access control",
        "Asynchronous task processing"
      ]
    }
  ];

  function openModal(index, triggerEl) {
    currentIndex = index;
    isModalOpen = true;
    document.body.style.overflow = "hidden"; // Prevent background scroll
    grid.classList.add("modal-active");
    overlay.classList.add("active");

    // Get starting dimensions
    const rect = triggerEl.getBoundingClientRect();
    
    // Set absolute starting position
    modal.style.top = rect.top + "px";
    modal.style.left = rect.left + "px";
    modal.style.width = rect.width + "px";
    modal.style.height = rect.height + "px";
    
    populateModal(index);
    
    modal.classList.add("animating");

    // Next frame, expand it to center
    requestAnimationFrame(() => {
      // Trick to force reflow
      modal.offsetHeight; 
      modal.classList.add("open");
      modal.style.top = "";
      modal.style.left = "";
      modal.style.width = "";
      modal.style.height = "";
    });
  }

  function closeModal() {
    isModalOpen = false;
    document.body.style.overflow = "";
    grid.classList.remove("modal-active");
    overlay.classList.remove("active");
    modal.classList.remove("open");
    
    // Scale down to origin (we don't track original element precisely on close just fade/shrink out for simplicity & smoothness)
    modal.style.transform = "translate(-50%, -50%) scale(0.8)";
    modal.style.opacity = "0";
    
    setTimeout(() => {
      modal.classList.remove("animating");
      modal.style.transform = "";
      modal.style.opacity = "";
    }, 400); 
  }

  function populateModal(index) {
    const card = cards[index];
    const title = card.querySelector(".xp-title").innerText;
    const bodyText = card.querySelector(".xp-copy").innerText;
    const svgIcon = card.querySelector(".xp-icon").innerHTML;
    
    const details = extendedDetails[index] || { subtitle: "", points: [] };
    const progressPercent = ((index + 1) / cards.length) * 100;

    let pointsHtml = "";
    if (details.points.length > 0) {
      pointsHtml = "<ul>" + details.points.map(p => `<li>${p}</li>`).join("") + "</ul>";
    }

    modal.innerHTML = `
      <div class="xp-progress-bar">
        <div class="xp-progress-fill" style="width: ${progressPercent}%"></div>
      </div>
      <div class="xp-modal-inner">
        <div class="xp-modal-header">
          <div class="xp-modal-title-group">
            <div class="xp-modal-icon">${svgIcon}</div>
            <h3 class="xp-modal-title">${title}</h3>
          </div>
          <button class="xp-modal-close" aria-label="Close modal">✕</button>
        </div>
        
        <div class="xp-modal-body">
          <h4>${details.subtitle}</h4>
          <p>${bodyText}</p>
          ${pointsHtml}
        </div>
        
        <div class="xp-modal-nav">
          <button class="xp-nav-btn prev" ${index === 0 ? "disabled" : ""}>
            ← Prev
          </button>
          <div class="xp-indicator"><span>${index + 1}</span> / ${cards.length}</div>
          <button class="xp-nav-btn next" ${index === cards.length - 1 ? "disabled" : ""}>
            Next →
          </button>
        </div>
      </div>
    `;

    // Reattach listeners
    modal.querySelector(".xp-modal-close").addEventListener("click", closeModal);
    
    const prevBtn = modal.querySelector(".prev");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) updateModal(currentIndex - 1);
      });
    }
    
    const nextBtn = modal.querySelector(".next");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentIndex < cards.length - 1) updateModal(currentIndex + 1);
      });
    }
  }

  function updateModal(newIndex) {
    currentIndex = newIndex;
    const inner = modal.querySelector(".xp-modal-inner");
    inner.style.opacity = "0"; // fade out current content
    setTimeout(() => {
      populateModal(newIndex);
    }, 300); // 300ms fade transition
  }

  // Attach click to cards
  cards.forEach((card, index) => {
    card.addEventListener("click", (e) => {
      openModal(index, card);
    });
  });

  // Attach overlay click
  overlay.addEventListener("click", closeModal);

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!isModalOpen) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft" && currentIndex > 0) updateModal(currentIndex - 1);
    if (e.key === "ArrowRight" && currentIndex < cards.length - 1) updateModal(currentIndex + 1);
  });

  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  modal.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  
  modal.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, {passive: true});
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped Left -> Next
      if (currentIndex < cards.length - 1) updateModal(currentIndex + 1);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped Right -> Prev
      if (currentIndex > 0) updateModal(currentIndex - 1);
    }
  }
});
