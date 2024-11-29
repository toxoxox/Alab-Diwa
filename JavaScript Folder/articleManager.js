import { auth, firestore } from './firebase-config.js';
import { handleArticleUpload } from './uploadArticle.js';
import adminManager from './adminManager.js';

class ArticleManager {
    constructor() {
        // Bind the showNotification method to this instance
        this.showNotification = this.showNotification.bind(this);
        
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupArticleUploadUI();
            this.setupArticleListeners();
        });
    }

    setupArticleUploadUI() {
        const uploadButton = document.querySelector('.upload-article-btn');
        const popup = document.querySelector('.article-popup-overlay');
        const form = document.getElementById('article-upload-form');
        const cancelBtn = form?.querySelector('.cancel-btn');
        const imageInput = form?.querySelector('#article-image');
        const imagePreview = form?.querySelector('.image-preview');

        if (!uploadButton || !popup || !form) {
            console.error('Required elements not found');
            return;
        }

        // Show popup when upload button is clicked
        uploadButton.addEventListener('click', () => {
            popup.classList.add('active');
        });

        // Hide popup when cancel is clicked
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                popup.classList.remove('active');
                form.reset();
                if (imagePreview) imagePreview.innerHTML = '';
            });
        }

        // Handle image preview
        if (imageInput && imagePreview) {
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 1024 * 1024) {
                        this.showNotification('error', 'Image size must be less than 1MB');
                        imageInput.value = '';
                        imagePreview.innerHTML = '';
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagePreview.innerHTML = `
                            <img src="${e.target.result}" alt="Preview">
                            <div class="file-name">${file.name}</div>
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Uploading...';
            }

            try {
                await handleArticleUpload(form);
                popup.classList.remove('active');
                form.reset();
                if (imagePreview) imagePreview.innerHTML = '';
                this.showNotification('success', 'Article uploaded successfully!');
                location.reload(); // Refresh to show new article
            } catch (error) {
                console.error('Error uploading article:', error);
                this.showNotification('error', error.message || 'Failed to upload article');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Upload';
                }
            }
        });
    }

    setupArticleListeners() {
        // Show/hide upload button based on admin status
        auth.onAuthStateChanged(async (user) => {
            const uploadBtn = document.querySelector('.upload-article-btn');
            if (uploadBtn) {
                if (user && await adminManager.checkIfAdmin(user.uid)) {
                    uploadBtn.style.display = 'flex';
                } else {
                    uploadBtn.style.display = 'none';
                }
            }
        });
    }

    showNotification(type, message) {
        // Remove any existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <div class="notification__icon">
                    ${type === 'success' 
                        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>'
                        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
                    }
                </div>
                <p class="notification__message">${message}</p>
            </div>
            <button class="notification__close" aria-label="Close notification">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
            </button>
        `;

        // Add to document
        document.body.appendChild(notification);

        // Add click handler for close button
        notification.querySelector('.notification__close').addEventListener('click', () => {
            notification.classList.add('notification--fade-out');
            setTimeout(() => notification.remove(), 300);
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('notification--fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Initialize the article manager
const articleManager = new ArticleManager();
export default articleManager; 