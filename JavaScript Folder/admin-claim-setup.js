import { auth, database } from './firebase-config.js';

class AdminClaimSetup {
    constructor() {
        this.setupButton = this.createSetupButton();
        // Add admin emails - these should match your existing admin emails
        this.allowedAdminEmails = [
            'dwastaken72@gmail.com',
            'alabdiwafhs@gmail.com'
        ];
        this.addButtonToPage();

        auth.onAuthStateChanged(user => {
            if (user) this.addAdminIndicator();
        });
    }

    createSetupButton() {
        const button = document.createElement('button');
        button.textContent = 'Setup Admin Privileges';
        button.className = 'admin-setup-button';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            z-index: 9999;
        `;
        return button;
    }

    addButtonToPage() {
        document.addEventListener('DOMContentLoaded', () => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        // Check if email is in allowed list
                        if (this.allowedAdminEmails.includes(user.email)) {
                            const isAdmin = await this.checkAdminStatus();
                            console.log('Is already admin:', isAdmin);
                            
                            if (!isAdmin) {
                                document.body.appendChild(this.setupButton);
                                this.setupButton.addEventListener('click', () => this.setupAdmin());
                            }
                        }
                    } catch (error) {
                        console.error('Error in addButtonToPage:', error);
                    }
                }
            });
        });
    }

    async setupAdmin() {
        try {
            const user = auth.currentUser;
            if (!user) {
                alert('Please sign in first');
                return;
            }

            if (!this.allowedAdminEmails.includes(user.email)) {
                alert('Unauthorized: Your email is not in the admin list');
                return;
            }

            // Check if admin entry already exists
            const adminRef = database.ref(`admins/${user.uid}`);
            const snapshot = await adminRef.once('value');
            
            if (snapshot.exists()) {
                console.log('Admin privileges already exist');
                this.setupButton.textContent = 'Already an Admin';
                setTimeout(() => this.setupButton.remove(), 2000);
                return;
            }

            // Add user to admins node
            await adminRef.set({
                email: user.email,
                displayName: user.displayName,
                addedAt: Date.now(),
                role: 'admin'
            });

            console.log('Admin privileges set successfully!');
            this.setupButton.textContent = 'Admin Setup Complete!';
            setTimeout(() => this.setupButton.remove(), 2000);

            // Refresh the page to update admin status
            window.location.reload();

        } catch (error) {
            console.error('Error setting up admin:', error);
            if (error.message.includes('PERMISSION_DENIED')) {
                alert('Permission denied. Please make sure you are using an authorized admin email.');
            } else {
                alert(`Failed to set up admin: ${error.message}`);
            }
        }
    }

    async checkAdminStatus() {
        try {
            const user = auth.currentUser;
            if (!user) return false;

            // Check if user exists in admins node
            const adminRef = database.ref(`admins/${user.uid}`);
            const snapshot = await adminRef.once('value');

            return snapshot.exists();
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    async addAdminIndicator() {
        const user = auth.currentUser;
        if (!user) return;

        const isAdmin = await this.checkAdminStatus();
        if (isAdmin) {
            // Add admin badge next to user name in dropdown
            const dropdownName = document.getElementById('dropdown-name');
            if (dropdownName && !document.querySelector('.admin-badge')) {
                const adminBadge = document.createElement('span');
                adminBadge.className = 'admin-badge';
                adminBadge.textContent = 'Admin';
                dropdownName.appendChild(adminBadge);
            }
            console.log('You are an admin!');
        } else {
            console.log('You are not an admin.');
        }
    }
}

// Create instance
const adminClaimSetup = new AdminClaimSetup();

// Export utility function
export const checkAdminStatus = () => adminClaimSetup.checkAdminStatus();

// Add this export
export const checkIfAdmin = async (uid) => {
    try {
        const adminRef = database.ref(`admins/${uid}`);
        const snapshot = await adminRef.once('value');
        return snapshot.exists();
    } catch (error) {
        return false;
    }
};