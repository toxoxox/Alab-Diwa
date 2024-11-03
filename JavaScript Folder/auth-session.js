import { auth } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const userInfo = document.getElementById('user-info');
    const signInButton = document.getElementById('google-signin');
    const signOutButton = document.getElementById('google-signout');
    const profileDropdown = document.querySelector('.profile-dropdown');
    let profileButton = document.getElementById('profile-button');
    const dropdownMenu = document.getElementById('dropdown-menu');

    let initialAuthCheck = true;

    auth.onAuthStateChanged((user) => {
        if (user) {
            // Update UI for signed-in user
            if (signInButton) signInButton.style.display = 'none';
            if (profileDropdown) {
                profileDropdown.style.display = 'flex';
                
                // Update profile pictures
                const profilePicture = document.getElementById('profile-picture');
                const dropdownProfilePicture = document.getElementById('dropdown-profile-picture');
                
                const defaultProfilePic = '../Images Folder/default-profile.png';
                const userPhotoURL = user.photoURL || defaultProfilePic;
                
                if (profilePicture) {
                    profilePicture.src = userPhotoURL;
                    profilePicture.alt = `${user.displayName}'s profile picture`;
                    profilePicture.onerror = () => {
                        console.log('Profile picture failed to load, using default');
                        profilePicture.src = defaultProfilePic;
                    };
                }
                
                if (dropdownProfilePicture) {
                    dropdownProfilePicture.src = userPhotoURL;
                    dropdownProfilePicture.alt = `${user.displayName}'s profile picture`;
                    dropdownProfilePicture.onerror = () => {
                        console.log('Dropdown profile picture failed to load, using default');
                        dropdownProfilePicture.src = defaultProfilePic;
                    };
                }
                
                // Update user info
                const dropdownName = document.getElementById('dropdown-name');
                const dropdownEmail = document.getElementById('dropdown-email');
                if (dropdownName) dropdownName.textContent = user.displayName;
                if (dropdownEmail) dropdownEmail.textContent = user.email;
            }
        } else {
            // Update UI for signed-out user
            if (signInButton) signInButton.style.display = 'flex';
            if (profileDropdown) profileDropdown.style.display = 'none';
            if (dropdownMenu) dropdownMenu.classList.remove('show');
        }
        initialAuthCheck = false;
    });

   // Sign in with Google
signInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider).catch((error) => {
        // Log error code and message for debugging
        console.error('Error signing in:', error.code, error.message);
        
        if (error.code === 'auth/popup-blocked') {
            console.log('Popup was blocked, trying redirect...');
            auth.signInWithRedirect(provider);
        } else {
            alert('Failed to sign in. Please try again or check your popup blocker settings.');
        }
    });
});


    // Sign out
    signOutButton.addEventListener('click', async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', (e) => {
        if (dropdownMenu?.classList.contains('show') && !profileDropdown?.contains(e.target)) {
            dropdownMenu.classList.remove('show');
            profileButton?.setAttribute('aria-expanded', 'false');
        }
    });

    function initializeDropdownMenu(user) {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (!dropdownMenu) {
            console.log('Dropdown menu not found');
            return;
        }

        // Make sure there's a divider
        let divider = dropdownMenu.querySelector('.dropdown-divider');
        if (!divider) {
            divider = document.createElement('div');
            divider.className = 'dropdown-divider';
            dropdownMenu.insertBefore(divider, dropdownMenu.firstChild);
        }
    }
}); 
