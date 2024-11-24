import { auth, database } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    
    const signInButton = document.getElementById('google-signin');
    const signOutButton = document.getElementById('google-signout');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileButton = document.getElementById('profile-button');
    const dropdownMenu = document.getElementById('dropdown-menu');

    // Sign in with Google
    if (signInButton) {
        signInButton.addEventListener('click', (e) => {
            e.preventDefault()
            const provider = new firebase.auth.GoogleAuthProvider();
            // Use signInWithPopup instead of redirect for better compatibility
            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                    updateUIForUser(result.user);
                })
                .catch((error) => {
                    console.error('Error signing in:', error);
                });
        });
    }

    // Handle auth state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            updateUIForUser(user);
            checkAdminStatus(user);
        } else {
            updateUIForSignedOut();
        }
    });

    async function checkAdminStatus(user) {
        try {
            const adminRef = database.ref(`admins/${user.uid}`);
            const snapshot = await adminRef.once('value');
            const isAdmin = snapshot.exists();
            
            if (isAdmin) {
                const dropdownUserInfo = document.querySelector('.dropdown-user-info');
                if (dropdownUserInfo) {
                    const adminBadge = document.createElement('span');
                    adminBadge.className = 'admin-badge';
                    adminBadge.textContent = 'Admin';
                    const adminBadgeContainer = document.createElement('div');
                    adminBadgeContainer.className = 'admin-badge-container';
                    adminBadgeContainer.appendChild(adminBadge);
                    dropdownUserInfo.appendChild(adminBadgeContainer);
                }
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }

    function updateUIForUser(user) {
        if (signInButton) signInButton.style.display = 'none';
        if (profileDropdown) {
            profileDropdown.style.display = 'flex';
            
            // Update profile pictures
            const profilePicture = document.getElementById('profile-picture');
            const dropdownProfilePicture = document.getElementById('dropdown-profile-picture');
            const navUserName = document.getElementById('nav-user-name');
            
            // Fix the path based on current page
            const defaultProfilePic = window.location.pathname.includes('/about.html') ? 
                '../Images Folder/default-profile.png' : 
                'Images Folder/default-profile.png';
            
            const userPhotoURL = user.photoURL || defaultProfilePic;
            
            [profilePicture, dropdownProfilePicture].forEach(picture => {
                if (picture) {
                    picture.src = userPhotoURL;
                    picture.alt = `${user.displayName}'s profile picture`;
                    picture.onerror = () => {
                        picture.src = defaultProfilePic;
                    };
                }
            });
            
            // Update user info
            const dropdownName = document.getElementById('dropdown-name');
            const dropdownEmail = document.getElementById('dropdown-email');
            if (dropdownName) dropdownName.textContent = user.displayName;
            if (dropdownEmail) dropdownEmail.textContent = user.email;
            if (navUserName) {
                navUserName.textContent = user.displayName.split(' ')[0];
            }
        }
    }

    function updateUIForSignedOut() {
        if (signInButton) signInButton.style.display = 'flex';
        if (profileDropdown) profileDropdown.style.display = 'none';
        if (dropdownMenu) dropdownMenu.classList.remove('show');
        
        // Clear welcome text
        const navUserName = document.getElementById('nav-user-name');
        if (navUserName) navUserName.textContent = '';
    }

    // Sign out
    if (signOutButton) {
        signOutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await auth.signOut();
                updateUIForSignedOut();
            } catch (error) {
                console.error('Error signing out:', error);
            }
        });
    }
});
