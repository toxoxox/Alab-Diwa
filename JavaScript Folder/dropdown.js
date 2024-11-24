document.addEventListener('DOMContentLoaded', () => {
    const profileButton = document.getElementById('profile-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileDropdown = document.querySelector('.profile-dropdown');

    console.log('Dropdown elements:', {
        profileButton: !!profileButton,
        dropdownMenu: !!dropdownMenu,
        profileDropdown: !!profileDropdown
    });

    // Profile dropdown functionality
    if (profileButton && dropdownMenu) {
        profileButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Profile button clicked');
            dropdownMenu.classList.toggle('show');
            console.log('Dropdown state:', dropdownMenu.classList.contains('show'));
            profileButton.setAttribute('aria-expanded', 
                dropdownMenu.classList.contains('show'));
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdown?.contains(e.target) && 
                dropdownMenu.classList.contains('show')) {
                console.log('Clicking outside dropdown');
                dropdownMenu.classList.remove('show');
                profileButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
                console.log('Escape key pressed');
                dropdownMenu.classList.remove('show');
                profileButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
}); 