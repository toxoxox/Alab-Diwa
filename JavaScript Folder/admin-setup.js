import { auth, database } from './firebase-config.js';

class AdminSetup {
    constructor() {
        this.adminEmails = ['dwastaken72@gmail.com']; // Replace with your email
    }

    async setupAdmin() {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error('No user signed in');
                return;
            }

            // Check if user's email is in the allowed admin list
            if (!this.adminEmails.includes(user.email)) {
                console.error('Unauthorized admin setup attempt');
                return;
            }

            // Get the ID token
            const idToken = await user.getIdToken();

            // Make request to Firebase Auth API
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${firebaseConfig.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idToken: idToken,
                    customAttributes: JSON.stringify({
                        admin: true
                    })
                })
            });

            if (!response.ok) {
                throw new Error('Failed to set admin privileges');
            }

            // Also store in Realtime Database for persistence
            await database.ref(`admins/${user.uid}`).set({
                email: user.email,
                addedAt: Date.now()
            });

            // Force token refresh
            await auth.currentUser.getIdToken(true);
            
            console.log('Admin privileges set successfully');
            return true;

        } catch (error) {
            console.error('Error setting up admin:', error);
            return false;
        }
    }

    // Function to check admin status
    async verifyAdmin() {
        try {
            const user = auth.currentUser;
            if (!user) return false;

            const token = await user.getIdTokenResult();
            return token.claims.admin === true;
        } catch (error) {
            console.error('Error verifying admin status:', error);
            return false;
        }
    }
}

// Create instance
const adminSetup = new AdminSetup();

// Add button to trigger admin setup when needed
document.addEventListener('DOMContentLoaded', () => {
    const user = auth.currentUser;
    if (user && adminSetup.adminEmails.includes(user.email)) {
        const setupButton = document.createElement('button');
        setupButton.textContent = 'Setup Admin Access';
        setupButton.className = 'admin-setup-button';
        setupButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            display: none;
        `;

        setupButton.addEventListener('click', async () => {
            const success = await adminSetup.setupAdmin();
            if (success) {
                setupButton.textContent = 'Admin Setup Complete';
                setTimeout(() => setupButton.remove(), 2000);
            }
        });

        document.body.appendChild(setupButton);

        // Only show button if user is not already an admin
        adminSetup.verifyAdmin().then(isAdmin => {
            if (!isAdmin) {
                setupButton.style.display = 'block';
            }
        });
    }
});

export default adminSetup; 