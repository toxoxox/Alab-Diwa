import { auth, database } from './firebase-config.js';
import { checkDatabaseAccess } from './firebase-config.js';
import { checkIfAdmin } from './admin-claim-setup.js';

document.addEventListener('DOMContentLoaded', function() {
    emailjs.init("KMtLS07YL8ny518ug");
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await setupAdminFeatures();
            await checkAndShowRestriction();
        }
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
        checkAndShowRestriction();
    }
});

async function setupAdminFeatures() {
    const user = auth.currentUser;
    if (!user) {
        return;
    }

    const dropdownMenu = document.querySelector('.dropdown-menu');
    const divider = document.querySelector('.dropdown-divider');
    
    if (!dropdownMenu || !divider) {
        return;
    }

    const isAdmin = await checkIfAdmin(user.uid);
    
    if (isAdmin) {
        const adminPanelButton = document.createElement('button');
        adminPanelButton.className = 'dropdown-item admin-panel-button';
        adminPanelButton.innerHTML = `
            <span>Admin Panel</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        const restrictButton = document.createElement('button');
        restrictButton.className = 'dropdown-item restrict-users-btn';
        restrictButton.innerHTML = `
            <span>Restrict Users</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" fill="currentColor"/>
            </svg>
        `;
        
        dropdownMenu.insertBefore(adminPanelButton, divider);
        dropdownMenu.insertBefore(restrictButton, divider);
        
        adminPanelButton.addEventListener('click', showAdminPanel);
        restrictButton.addEventListener('click', showRestrictUserPopup);
    }
}

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
    
    const closeBtn = popup.querySelector('.close-popup');
    const cancelBtn = popup.querySelector('.cancel-btn');
    const restrictBtn = popup.querySelector('.restrict-btn');
    
    closeBtn.addEventListener('click', () => document.body.removeChild(popup));
    cancelBtn.addEventListener('click', () => document.body.removeChild(popup));
    
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
        
        popup.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
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
            const restrictionsRef = database.ref('userRestrictions');
            const snapshot = await restrictionsRef.orderByChild('email').equalTo(email).once('value');
            
            if (snapshot.exists()) {
                showNotification('This user is already restricted', 'error');
                return;
            }
            
            const timestamp = Date.now();
            const restrictedBy = auth.currentUser.email;

            const newRestrictionRef = await restrictionsRef.push({
                email: email,
                reason: reason,
                timestamp: timestamp,
                restrictedBy: restrictedBy
            });

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
            loadRestrictedUsers();
            
        } catch (error) {
            console.error('Error restricting user:', error);
            showNotification('Failed to restrict user', 'error');
        }
    });
}

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

async function checkUserRestriction(email) {
    const restrictionsRef = database.ref('userRestrictions');
    const snapshot = await restrictionsRef.orderByChild('email').equalTo(email).once('value');
    return snapshot.val();
}

document.getElementById('contact-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const submitBtn = this.querySelector('.submit-btn');
    const statusMessage = document.getElementById('status-message');
    
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    const name = this.querySelector('#from_name').value;
    const email = this.querySelector('#from_email').value;
    const message = this.querySelector('#message').value;
    
    const restriction = await checkUserRestriction(email);
    if (restriction) {
        const restrictionData = Object.values(restriction)[0];
        statusMessage.className = 'status-message error';
        statusMessage.textContent = `Your access has been restricted. Reason: ${restrictionData.reason}`;
        return;
    }
    
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const messageError = validateMessage(message);
    
    if (nameError || emailError || messageError) {
        if (nameError) document.getElementById('name-error').textContent = nameError;
        if (emailError) document.getElementById('email-error').textContent = emailError;
        if (messageError) document.getElementById('message-error').textContent = messageError;
        return;
    }
    
    submitBtn.classList.add('loading');
    statusMessage.className = 'status-message';
    statusMessage.textContent = '';
    
    try {
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
        
        statusMessage.className = 'status-message success';
        statusMessage.textContent = 'Message sent successfully!';
        this.reset();
        
    } catch (error) {
        statusMessage.className = 'status-message error';
        statusMessage.textContent = 'Failed to send message. Please try again.';
        console.error('EmailJS error:', error);
    } finally {
        submitBtn.classList.remove('loading');
    }
});

function validateEmail(email) {
    if (!email) {
        return 'Email is required';
    }
    if (!email.match(/^[^\s@]+@gmail\.com$/)) {
        return 'Please enter a valid Gmail address';
    }
    return null;
}

function setupInputValidation(popup) {
    const inputs = popup.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.nextElementSibling.textContent = '';
        });
    });
}

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
    
    setTimeout(() => adminPanel.classList.add('show'), 10);
    
    const closeBtn = adminPanel.querySelector('.close-popup');
    closeBtn.addEventListener('click', () => {
        adminPanel.classList.remove('show');
        setTimeout(() => document.body.removeChild(adminPanel), 300);
    });
    
    adminPanel.addEventListener('click', (e) => {
        if (e.target === adminPanel) {
            adminPanel.classList.remove('show');
            setTimeout(() => document.body.removeChild(adminPanel), 300);
        }
    });
    
    setTimeout(() => {
        loadRestrictedUsers();
    }, 0);
}

async function loadRestrictedUsers() {
    const userList = document.getElementById('user-list');
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
        
        const adminButton = document.querySelector('.admin-panel-button');
        const restrictButton = document.querySelector('.restrict-users-btn');
        if (adminButton) adminButton.remove();
        if (restrictButton) restrictButton.remove();
    }
}

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

async function unrestrictUser(restrictionKey) {
    try {
        const hasAccess = await checkDatabaseAccess('userRestrictions');
        if (!hasAccess) {
            throw new Error('Unauthorized access');
        }

        const restrictionRef = database.ref(`userRestrictions/${restrictionKey}`);
        const snapshot = await restrictionRef.once('value');
        const restrictionData = snapshot.val();

        if (!restrictionData) {
            throw new Error('Restriction not found');
        }

        const historyData = {
            ...restrictionData,
            unrestrictedAt: Date.now(),
            unrestrictedBy: auth.currentUser.email,
            action: 'unrestricted'
        };

        await database.ref('restrictionHistory').push(historyData);
        await restrictionRef.remove();

        showNotification('User has been unrestricted', 'success');
        loadRestrictedUsers();

    } catch (error) {
        console.error('Error unrestricting user:', error);
        showNotification('Failed to unrestrict user: ' + error.message, 'error');
    }
}

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
                        .sort((a, b) => b[1].timestamp - a[1].timestamp)
                        .slice(0, 4)
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

        const closeBtn = historyDialog.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(historyDialog);
        });

    } catch (error) {
        console.error('Error viewing restriction history:', error);
        showNotification('Failed to load restriction history', 'error');
    }
}

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

async function checkAndShowRestriction() {
    const user = auth.currentUser;
    if (!user) {
        return;
    }

    try {
        console.log('Checking restrictions for:', user.email);
        const restrictionsRef = database.ref('userRestrictions');
        
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

                if (getComputedStyle(contactContainer).position === 'static') {
                    contactContainer.style.position = 'relative';
                }

                contactContainer.appendChild(overlay);

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