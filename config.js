if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  window.API_BASE = "http://localhost:8080";
} else {
  window.API_BASE = "https://my-portfolio-backend-2-8xig.onrender.com"; 
}
