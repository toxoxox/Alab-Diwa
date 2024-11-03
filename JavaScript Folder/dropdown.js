document.addEventListener('DOMContentLoaded', () => {
    const profileButton = document.getElementById('profile-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav__links');

    // Profile dropdown functionality
    if (profileButton && dropdownMenu) {
        profileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
            profileButton.setAttribute('aria-expanded', dropdownMenu.classList.contains('show'));
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                profileButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
                profileButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Burger menu functionality
    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            burger.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            document.body.style.overflow = navLinks.classList.contains('show') ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('show') && 
                !burger.contains(e.target) && 
                !navLinks.contains(e.target)) {
                navLinks.classList.remove('show');
                burger.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.body.style.overflow = '';
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('show')) {
                navLinks.classList.remove('show');
                burger.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
                burger.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}); 