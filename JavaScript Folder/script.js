// Loader functionality
const loader = document.getElementById('loader-wrapper');

// Function to check if this is the first visit
function isFirstVisit() {
    const visited = sessionStorage.getItem('visited');
    if (!visited) {
        sessionStorage.setItem('visited', 'true');
        return true;
    }
    return false;
}

// Function to check if page was force reloaded
function isForceReload() {
    return window.performance.navigation.type === 1;
}

// Show loader only on first visit or force reload
if (loader) {
    if (isFirstVisit() || isForceReload()) {
        loader.style.display = 'flex';
        loader.style.transform = 'translateY(0)';
        
        // Handle loader animation and hiding
        window.addEventListener('load', () => {
            // Wait for 2 seconds before starting the animation
            setTimeout(() => {
                // Add transition and scroll up
                loader.style.transition = 'transform 0.8s ease-in-out';
                loader.style.transform = 'translateY(-100%)';
                
                // Smooth scroll page to top
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Remove loader after animation completes
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 800);
            }, 2000);
        });
    } else {
        loader.style.display = 'none';
    }
}

// Add click handlers for logo and home link
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    const homeLink = document.querySelector('a[href="index.html"]');

    if (logo) {
        logo.addEventListener('click', (e) => {
            if (window.location.pathname.includes('index.html')) {
                e.preventDefault();
                window.location.reload();
            }
        });
    }

    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            if (window.location.pathname.includes('index.html')) {
                e.preventDefault();
                window.location.reload();
            }
        });
    }

    // Handle Read More buttons in highlights section
    const readMoreButtons = document.querySelectorAll('.highlight__read-more');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the article title from the highlight card
            const highlightCard = button.closest('.highlight');
            const articleTitle = highlightCard.querySelector('.highlight__title').textContent;

            // Store the article title in session storage
            sessionStorage.setItem('selectedArticle', articleTitle);

            // Redirect to news-and-articles page
            window.location.href = 'news-and-articles.html';
        });
    });

    // Handle the "Read Article" button in the hero section
    const readArticleBtn = document.getElementById('read-article-btn');
    if (readArticleBtn) {
        readArticleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'news-and-articles.html';
        });
    }
});

// Update the burger menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav__links');
    
    if (burger && navLinks) {
        // Add index to nav items for staggered animation
        const navItems = navLinks.querySelectorAll('li');
        navItems.forEach((item, index) => {
            item.style.setProperty('--i', index + 1);
        });

        burger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle menu open state
            if (document.body.classList.contains('menu-open')) {
                // Close menu
                document.body.classList.add('menu-closing');
                setTimeout(() => {
                    document.body.classList.remove('menu-open', 'menu-closing');
                }, 300);
            } else {
                // Open menu
                document.body.classList.remove('menu-closing');
                document.body.classList.add('menu-open');
            }
            
            // Debug log
            console.log('Menu state:', document.body.classList.contains('menu-open'));
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                document.body.classList.add('menu-closing');
                setTimeout(() => {
                    document.body.classList.remove('menu-open', 'menu-closing');
                }, 300);
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!burger.contains(e.target) && !navLinks.contains(e.target) && document.body.classList.contains('menu-open')) {
                document.body.classList.add('menu-closing');
                setTimeout(() => {
                    document.body.classList.remove('menu-open', 'menu-closing');
                }, 300);
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
                document.body.classList.add('menu-closing');
                setTimeout(() => {
                    document.body.classList.remove('menu-open', 'menu-closing');
                }, 300);
            }
        });
    }
});

// Add this function for count animation
function animateCount() {
    const counters = document.querySelectorAll('.count');
    
    // Check if counters exist
    if (!counters.length) return;

    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-end-value'));
                const duration = 2000; // Animation duration in milliseconds
                const start = 0;
                const increment = target / (duration / 16); // Update every 16ms (60fps)
                
                let currentCount = start;
                
                function updateCount() {
                    currentCount += increment;
                    if (currentCount < target) {
                        counter.textContent = Math.floor(currentCount);
                        requestAnimationFrame(updateCount);
                    } else {
                        counter.textContent = target;
                    }
                }
                
                updateCount();
                observer.unobserve(counter); // Stop observing once animation starts
            }
        });
    }, options);

    // Observe each counter
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    animateCount();
    // ... rest of your existing DOMContentLoaded code ...
});

// Add scroll animation functionality
function initScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-animation, .fade-in-left, .fade-in-right, .fade-in-up, .fade-in');
    
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target); // Stop observing once shown
            }
        });
    }, options);

    elements.forEach(element => {
        observer.observe(element);
    });
}

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    // ... rest of your existing DOMContentLoaded code ...
});
