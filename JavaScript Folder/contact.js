// Import Firebase instances from existing config
import { auth, database, checkIfAdmin, checkDatabaseAccess } from './firebase-config.js';

// Initialize EmailJS after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    emailjs.init("KMtLS07YL8ny518ug");
    
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('User logged in, checking restrictions...');
            await setupAdminFeatures();
            await checkAndShowRestriction(); // Check restrictions when user logs in
        }
    });

    // Also check when the page loads if user is already logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
        console.log('User already logged in, checking restrictions...');
        checkAndShowRestriction();
    }
});

// Setup admin features
async function setupAdminFeatures() {
    const user = auth.currentUser;
    console.log('Current user:', user);
    if (!user) {
        console.log('No user logged in');
        return;
    }

    const dropdownMenu = document.querySelector('.dropdown-menu');
    const divider = document.querySelector('.dropdown-divider');
    
    console.log('Dropdown menu:', dropdownMenu);
    console.log('Divider:', divider);
    
    if (!dropdownMenu || !divider) {
        console.log('Required elements not found');
        return;
    }

    const isAdmin = await checkIfAdmin(user.uid);
    console.log('Is admin:', isAdmin);
    
    if (isAdmin) {
        console.log('Adding admin features');
        // Add admin panel and restrict users buttons to dropdown menu
        const adminPanelButton = document.createElement('button');
        adminPanelButton.className = 'dropdown-item admin-panel-button';
        adminPanelButton.innerHTML = `
            <span>Admin Panel</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // Add Restrict Users button
        const restrictButton = document.createElement('button');
        restrictButton.className = 'dropdown-item restrict-users-btn';
        restrictButton.innerHTML = `
            <span>Restrict Users</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" fill="currentColor"/>
            </svg>
        `;
        
        // Insert buttons before the divider
        dropdownMenu.insertBefore(adminPanelButton, divider);
        dropdownMenu.insertBefore(restrictButton, divider);
        
        // Add click events
        adminPanelButton.addEventListener('click', showAdminPanel);
        restrictButton.addEventListener('click', showRestrictUserPopup);
    } else {
        console.log('User is not an admin');
    }
}

// Show restrict user popup
function showRestrictUserPopup() {
    const popup = document.createElement('div');
    popup.className = 'restrict-popup';
    popup.innerHTML = `
        <div class="restrict-popup-content">
            <div class="restrict-popup-header">
                <h3>Restrict User Access</h3>
                <button class="close-popup">×</button>
            </div>
            <div class="restrict-popup-body">
                <div class="form-group">
                    <label for="user-email">User Gmail Address</label>
                    <input type="email" id="user-email" placeholder="Enter user's Gmail address">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="restriction-reason">Reason for Restriction</label>
                    <textarea id="restriction-reason" placeholder="Enter reason for restriction"></textarea>
                    <span class="error-message"></span>
                </div>
            </div>
            <div class="restrict-popup-footer">
                <button class="cancel-btn">Cancel</button>
                <button class="restrict-btn">Restrict Access</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Add event listeners
    const closeBtn = popup.querySelector('.close-popup');
    const cancelBtn = popup.querySelector('.cancel-btn');
    const restrictBtn = popup.querySelector('.restrict-btn');
    
    closeBtn.addEventListener('click', () => document.body.removeChild(popup));
    cancelBtn.addEventListener('click', () => document.body.removeChild(popup));
    
    // Add input validation
    const emailInput = popup.querySelector('#user-email');
    const reasonInput = popup.querySelector('#restriction-reason');
    
    emailInput.addEventListener('input', () => {
        emailInput.nextElementSibling.textContent = '';
    });
    
    reasonInput.addEventListener('input', () => {
        reasonInput.nextElementSibling.textContent = '';
    });
    
    restrictBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const reason = reasonInput.value.trim();
        
        // Clear previous errors
        popup.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        // Validate inputs
        let hasError = false;
        
        if (!email) {
            emailInput.nextElementSibling.textContent = 'Email is required';
            hasError = true;
        } else if (!email.endsWith('@gmail.com')) {
            emailInput.nextElementSibling.textContent = 'Please enter a valid Gmail address';
            hasError = true;
        }
        
        if (!reason) {
            reasonInput.nextElementSibling.textContent = 'Please enter a reason for restriction';
            hasError = true;
        }
        
        if (hasError) return;
        
        try {
            // Check if user is already restricted
            const restrictionsRef = database.ref('userRestrictions');
            const snapshot = await restrictionsRef.orderByChild('email').equalTo(email).once('value');
            
            if (snapshot.exists()) {
                showNotification('This user is already restricted', 'error');
                return;
            }
            
            const timestamp = Date.now();
            const restrictedBy = auth.currentUser.email;

            // Add restriction
            const newRestrictionRef = await restrictionsRef.push({
                email: email,
                reason: reason,
                timestamp: timestamp,
                restrictedBy: restrictedBy
            });

            // Add to restriction history
            await database.ref('restrictionHistory').push({
                email: email,
                reason: reason,
                timestamp: timestamp,
                restrictedBy: restrictedBy,
                action: 'restricted',
                restrictionId: newRestrictionRef.key
            });
            
            showNotification('User has been restricted', 'success');
            document.body.removeChild(popup);
            loadRestrictedUsers(); // Reload the list
            
        } catch (error) {
            console.error('Error restricting user:', error);
            showNotification('Failed to restrict user', 'error');
        }
    });
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }, 100);
}

// Check if user is restricted before form submission
async function checkUserRestriction(email) {
    const restrictionsRef = database.ref('userRestrictions');
    const snapshot = await restrictionsRef.orderByChild('email').equalTo(email).once('value');
    return snapshot.val();
}

// Keep your original form submission code and add restriction check
document.getElementById('contact-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const submitBtn = this.querySelector('.submit-btn');
    const statusMessage = document.getElementById('status-message');
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Form validation
    const name = this.querySelector('#from_name').value;
    const email = this.querySelector('#from_email').value;
    const message = this.querySelector('#message').value;
    
    // Check for restriction before proceeding
    const restriction = await checkUserRestriction(email);
    if (restriction) {
        const restrictionData = Object.values(restriction)[0];
        statusMessage.className = 'status-message error';
        statusMessage.textContent = `Your access has been restricted. Reason: ${restrictionData.reason}`;
        return;
    }
    
    // Your existing validation and email sending code...
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const messageError = validateMessage(message);
    
    if (nameError || emailError || messageError) {
        if (nameError) document.getElementById('name-error').textContent = nameError;
        if (emailError) document.getElementById('email-error').textContent = emailError;
        if (messageError) document.getElementById('message-error').textContent = messageError;
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    statusMessage.className = 'status-message';
    statusMessage.textContent = '';
    
    try {
        // Send the email using EmailJS
        await emailjs.send(
            'service_alab_diwa',      // Service ID
            'template_alab_diwa',     // Template ID
            {
                from_name: name,
                from_email: email,
                message: message,
                to_name: 'Alab Diwa'
            }
        );
        
        // Success
        statusMessage.className = 'status-message success';
        statusMessage.textContent = 'Message sent successfully!';
        this.reset();
        
    } catch (error) {
        // Error
        statusMessage.className = 'status-message error';
        statusMessage.textContent = 'Failed to send message. Please try again.';
        console.error('EmailJS error:', error);
    } finally {
        submitBtn.classList.remove('loading');
    }
});

// Update the validateEmail function to specifically check for Gmail addresses
function validateEmail(email) {
    if (!email) {
        return 'Email is required';
    }
    if (!email.match(/^[^\s@]+@gmail\.com$/)) {
        return 'Please enter a valid Gmail address';
    }
    return null;
}

// Add input validation listeners to clear errors on input
function setupInputValidation(popup) {
    const inputs = popup.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.nextElementSibling.textContent = '';
        });
    });
}

// Add the showAdminPanel function
function showAdminPanel() {
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-popup';
    adminPanel.innerHTML = `
        <div class="admin-popup-content">
            <div class="admin-popup-header">
                <h2>Admin Panel</h2>
                <button class="close-popup">×</button>
            </div>
            <div class="admin-popup-body">
                <div class="user-list-header">
                    <div class="search-box">
                        <span class="search-icon">🔍</span>
                        <input type="text" placeholder="Search users..." id="user-search">
                    </div>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">All Users</button>
                        <button class="filter-btn" data-filter="restricted">Restricted</button>
                    </div>
                </div>
                <div id="user-list" class="user-list">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(adminPanel);
    
    // Add transition class after a small delay
    setTimeout(() => adminPanel.classList.add('show'), 10);
    
    // Setup close functionality
    const closeBtn = adminPanel.querySelector('.close-popup');
    closeBtn.addEventListener('click', () => {
        adminPanel.classList.remove('show');
        setTimeout(() => document.body.removeChild(adminPanel), 300);
    });
    
    // Close on outside click
    adminPanel.addEventListener('click', (e) => {
        if (e.target === adminPanel) {
            adminPanel.classList.remove('show');
            setTimeout(() => document.body.removeChild(adminPanel), 300);
        }
    });
    
    // Wait for the element to be added to the DOM
    setTimeout(() => {
        // Load and display restricted users
        loadRestrictedUsers();
    }, 0);
}

// Update the loadRestrictedUsers function
async function loadRestrictedUsers() {
    const userList = document.getElementById('user-list'); // Updated to use ID selector
    if (!userList) {
        console.error('User list element not found');
        return;
    }

    console.log('Loading restricted users');
    
    try {
        const hasAccess = await checkDatabaseAccess('userRestrictions');
        console.log('Has database access:', hasAccess);
        
        if (!hasAccess) {
            throw new Error('Unauthorized access');
        }

        const restrictionsRef = database.ref('userRestrictions');
        const snapshot = await restrictionsRef.once('value');
        const restrictions = snapshot.val();
        
        // Handle empty or non-existent data
        if (!restrictions) {
            userList.innerHTML = '<p>No restricted users found.</p>';
            return;
        }

        userList.innerHTML = Object.entries(restrictions).map(([key, restriction]) => `
            <div class="user-item">
                <div class="user-info">
                    <div class="user-header">
                        <div class="user-details">
                            <div class="user-email">${restriction.email}</div>
                            <div class="restriction-info">
                                <span class="restriction-badge">Restricted</span>
                                <div class="restriction-reason">${restriction.reason}</div>
                                <div class="restriction-meta">
                                    <small>Restricted by: ${restriction.restrictedBy}</small>
                                    <small>Date: ${new Date(restriction.timestamp).toLocaleDateString()}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="unrestrict-btn" data-key="${key}" title="Remove restriction">
                        <span>Unrestrict User</span>
                    </button>
                    <button class="view-history-btn" data-email="${restriction.email}" title="View history">
                        <span>View History</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to buttons
        document.querySelectorAll('.unrestrict-btn').forEach(btn => {
            btn.addEventListener('click', () => showUnrestrictConfirmation(btn.dataset.key));
        });

        document.querySelectorAll('.view-history-btn').forEach(btn => {
            btn.addEventListener('click', () => viewRestrictionHistory(btn.dataset.email));
        });
        
    } catch (error) {
        console.error('Error loading restricted users:', error);
        if (userList) {
            userList.innerHTML = '<p>You do not have permission to view restricted users.</p>';
        }
        
        // If unauthorized, remove admin features
        const adminButton = document.querySelector('.admin-panel-button');
        const restrictButton = document.querySelector('.restrict-users-btn');
        if (adminButton) adminButton.remove();
        if (restrictButton) restrictButton.remove();
    }
}

// Add function to show unrestrict confirmation
function showUnrestrictConfirmation(restrictionKey) {
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirm-dialog';
    confirmDialog.innerHTML = `
        <div class="dialog-content">
            <h3>Confirm Unrestrict</h3>
            <p>Are you sure you want to remove this restriction?</p>
            <div class="dialog-buttons">
                <button class="cancel-btn">Cancel</button>
                <button class="confirm-btn">Confirm</button>
            </div>
        </div>
    `;

    document.body.appendChild(confirmDialog);

    // Add event listeners
    const cancelBtn = confirmDialog.querySelector('.cancel-btn');
    const confirmBtn = confirmDialog.querySelector('.confirm-btn');

    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(confirmDialog);
    });

    confirmBtn.addEventListener('click', async () => {
        await unrestrictUser(restrictionKey);
        document.body.removeChild(confirmDialog);
    });
}

// Update the unrestrictUser function
async function unrestrictUser(restrictionKey) {
    try {
        const hasAccess = await checkDatabaseAccess('userRestrictions');
        if (!hasAccess) {
            throw new Error('Unauthorized access');
        }

        // Get the restriction data before removing it
        const restrictionRef = database.ref(`userRestrictions/${restrictionKey}`);
        const snapshot = await restrictionRef.once('value');
        const restrictionData = snapshot.val();

        if (!restrictionData) {
            throw new Error('Restriction not found');
        }

        // Save to restriction history
        const historyData = {
            ...restrictionData,
            unrestrictedAt: Date.now(),
            unrestrictedBy: auth.currentUser.email,
            action: 'unrestricted'
        };

        // Use transaction to ensure atomic operations
        await database.ref('restrictionHistory').push(historyData);
        await restrictionRef.remove();

        showNotification('User has been unrestricted', 'success');
        loadRestrictedUsers(); // Reload the list

    } catch (error) {
        console.error('Error unrestricting user:', error);
        showNotification('Failed to unrestrict user: ' + error.message, 'error');
    }
}

// Update the viewRestrictionHistory function
async function viewRestrictionHistory(email) {
    try {
        const hasAccess = await checkDatabaseAccess('restrictionHistory');
        if (!hasAccess) {
            throw new Error('Unauthorized access');
        }

        const historyRef = database.ref('restrictionHistory')
            .orderByChild('email')
            .equalTo(email);
            
        const snapshot = await historyRef.once('value');
        const history = snapshot.val();

        const historyDialog = document.createElement('div');
        historyDialog.className = 'history-dialog';
        historyDialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>Restriction History for ${email}</h3>
                    <button class="close-btn">×</button>
                </div>
                <div class="history-list">
                    ${history ? Object.entries(history)
                        .sort((a, b) => b[1].timestamp - a[1].timestamp) // Sort by newest first
                        .slice(0, 4) // Limit to 4 records
                        .map(([key, entry]) => `
                            <div class="history-item">
                                <div class="history-action">${entry.action || 'Restricted'}</div>
                                <div class="history-reason">${entry.reason}</div>
                                <div class="history-meta">
                                    <small>By: ${entry.restrictedBy}</small>
                                    <small>Date: ${new Date(entry.timestamp).toLocaleDateString()}</small>
                                    ${entry.unrestrictedAt ? `
                                        <small>Unrestricted by: ${entry.unrestrictedBy}</small>
                                        <small>Unrestricted on: ${new Date(entry.unrestrictedAt).toLocaleDateString()}</small>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('') : '<p>No history found</p>'}
                </div>
            </div>
        `;

        document.body.appendChild(historyDialog);

        // Add close button functionality
        const closeBtn = historyDialog.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(historyDialog);
        });

    } catch (error) {
        console.error('Error viewing restriction history:', error);
        showNotification('Failed to load restriction history', 'error');
    }
}

// Add these validation functions
function validateName(name) {
    if (!name) {
        return 'Name is required';
    }
    if (name.length < 2) {
        return 'Name must be at least 2 characters long';
    }
    return null;
}

function validateMessage(message) {
    if (!message) {
        return 'Message is required';
    }
    if (message.length < 10) {
        return 'Message must be at least 10 characters long';
    }
    return null;
}

// Update the checkAndShowRestriction function
async function checkAndShowRestriction() {
    const user = auth.currentUser;
    if (!user) {
        console.log('No user logged in');
        return;
    }

    try {
        console.log('Checking restrictions for:', user.email);
        const restrictionsRef = database.ref('userRestrictions');
        
        // Add error handling for the query
        try {
            const snapshot = await restrictionsRef.orderByChild('email').equalTo(user.email).once('value');
            const restrictions = snapshot.val();
            console.log('Restrictions data:', restrictions);

            if (restrictions) {
                const restrictionData = Object.values(restrictions)[0];
                const contactForm = document.getElementById('contact-form');
                const contactContainer = document.querySelector('.contact-container');
                
                if (!contactForm || !contactContainer) {
                    console.error('Contact form or container not found');
                    return;
                }

                // Create overlay
                const overlay = document.createElement('div');
                overlay.className = 'contact-form-overlay';
                
                overlay.innerHTML = `
                    <div class="overlay-content">
                        <svg class="lock-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0110 0v4"></path>
                        </svg>
                        <h3>Access Restricted</h3>
                        <p>Your access to the contact form has been restricted.</p>
                        <div class="restriction-details">
                            <p><strong>Reason:</strong> ${restrictionData.reason}</p>
                            <p><strong>Restricted on:</strong> ${new Date(restrictionData.timestamp).toLocaleDateString()}</p>
                            <p><strong>Restricted by:</strong> ${restrictionData.restrictedBy}</p>
                        </div>
                    </div>
                `;

                // Set container position to relative if not already
                if (getComputedStyle(contactContainer).position === 'static') {
                    contactContainer.style.position = 'relative';
                }

                // Add overlay to container
                contactContainer.appendChild(overlay);

                // Disable all form inputs
                const inputs = contactForm.querySelectorAll('input, textarea, button');
                inputs.forEach(input => {
                    input.disabled = true;
                });

                console.log('Overlay added and form disabled');
            }
        } catch (queryError) {
            console.error('Error querying restrictions:', queryError);
        }
    } catch (error) {
        console.error('Error in checkAndShowRestriction:', error);
    }
}