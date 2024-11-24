// Mobile menu functionality
document.addEventListener('DOMContentLoaded', () => {
    // Remove any potential overlays
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    document.body.style.overflow = 'visible';
    document.body.style.position = 'relative';
    document.body.style.zIndex = 'auto';

    // Remove loader if it exists
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        loader.remove();
    }

    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav__links');
    const body = document.body;

    if (burger && navLinks) {
        // Add index to nav items for staggered animation
        const navItems = navLinks.querySelectorAll('li');
        navItems.forEach((item, index) => {
            item.style.setProperty('--i', index + 1);
        });

        burger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Toggle menu open state
            burger.classList.toggle('active');
            navLinks.classList.toggle('show');
            body.classList.toggle('menu-open');

            // If closing menu
            if (!burger.classList.contains('active')) {
                body.classList.add('menu-closing');
                setTimeout(() => {
                    body.classList.remove('menu-open', 'menu-closing');
                }, 300);
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                navLinks.classList.remove('show');
                body.classList.add('menu-closing');
                setTimeout(() => {
                    body.classList.remove('menu-open', 'menu-closing');
                }, 300);
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!burger.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('show')) {
                burger.classList.remove('active');
                navLinks.classList.remove('show');
                body.classList.add('menu-closing');
                setTimeout(() => {
                    body.classList.remove('menu-open', 'menu-closing');
                }, 300);
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('show')) {
                burger.classList.remove('active');
                navLinks.classList.remove('show');
                body.classList.add('menu-closing');
                setTimeout(() => {
                    body.classList.remove('menu-open', 'menu-closing');
                }, 300);
            }
        });
    }

    // Rest of your existing DOMContentLoaded code...
});
