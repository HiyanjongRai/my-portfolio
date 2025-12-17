
document.addEventListener("DOMContentLoaded", () => {
    // Prevent transitions on page load
    document.body.classList.add('preload');
    window.addEventListener('load', function() {
      setTimeout(function() {
        document.body.classList.remove('preload');
      }, 100);
    });

    // Scroll Progress Indicator
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
        window.addEventListener('scroll', function() {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            scrollProgress.style.width = scrolled + '%';
        });
    }

    // Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
            } else {
            backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
            top: 0,
            behavior: 'smooth'
            });
        });
    }
});
