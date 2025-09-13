// Auto-switch API base between local dev and hosted backend
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") { 
  window.API_BASE = "http://localhost:8080";  // change to 8081 if you moved ports
} else {
  window.API_BASE = "https://my-portfolio-backend-2-8xig.onrender.com";
}

// Helpful banner so you always know which backend you're hitting
console.log(
  `%cAPI_BASE → ${window.API_BASE}`,
  "background:#003153;color:#fff;padding:4px 8px;border-radius:6px;font-weight:bold;"
);
