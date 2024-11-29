import { auth, database } from './firebase-config.js';
import adminManager from './adminManager.js';

function createModal(title, message, confirmText = 'Confirm', cancelText = 'Cancel', action = 'delete') {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="modal-title">${title}</h3>
            <p class="modal-message">${message}</p>
            <div class="modal-buttons">
                <button class="modal-button cancel">${cancelText}</button>
                <button class="modal-button confirm" data-action="${action}">${confirmText}</button>
            </div>
        </div>
    `;

    return new Promise((resolve) => {
        const confirmBtn = modal.querySelector('.confirm');
        const cancelBtn = modal.querySelector('.cancel');
        const handleClick = (result) => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
            resolve(result);
        };

        confirmBtn.addEventListener('click', () => handleClick(true));
        cancelBtn.addEventListener('click', () => handleClick(false));

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const newsArticlesGrid = document.getElementById('news-articles-grid');
    const categoryButtons = document.querySelectorAll('.category-button');
    const sortSelect = document.getElementById('sort-articles');
    let currentArticles = [];
    let currentCategory = 'All';

    function parseArticleDate(dateStr) {
        try {
            // Handle MM/DD/YYYY format
            const [month, day, year] = dateStr.split('/');
            return new Date(year, month - 1, day);
        } catch (e) {
            console.error('Error parsing date:', dateStr);
            return new Date(0);
        }
    }

    function sortArticles(articles, sortOrder) {
        if (!articles || articles.length === 0) {
            console.log('No articles to sort');
            return [];
        }

        return [...articles].sort((a, b) => {
            // Convert dates to timestamps for comparison
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();

            // Debug logs
            console.log('Sorting:', {
                articleA: a.title,
                dateA: a.createdAt,
                timestampA: dateA,
                articleB: b.title,
                dateB: b.createdAt,
                timestampB: dateB,
                sortOrder
            });

            // Compare timestamps
            const comparison = sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            return comparison;
        });
    }

    function filterArticles(category) {
        currentCategory = category;
        const articlesRef = database.ref('articles');
        
        articlesRef.once('value', (snapshot) => {
            const articles = [];
            snapshot.forEach((childSnapshot) => {
                const article = childSnapshot.val();
                articles.push({
                    id: childSnapshot.key,
                    ...article
                });
            });
            
            // Filter by category
            const filteredArticles = category === 'All' 
                ? articles 
                : articles.filter(article => article.category === category);
            
            // Store the filtered articles
            currentArticles = filteredArticles;
            
            // Sort using current sort order
            const sortedArticles = sortArticles(filteredArticles, sortSelect.value);
            
            // Generate the articles
            newsArticlesGrid.innerHTML = '';
            generateArticles(sortedArticles);
        });
    }

    // Update the sort event listener
    sortSelect.addEventListener('change', (e) => {
        console.log('Sort changed:', e.target.value);
        console.log('Current articles:', currentArticles);
        
        if (!currentArticles || currentArticles.length === 0) {
            console.log('No articles to sort');
            return;
        }

        // Make a fresh copy of the articles array
        const articlesToSort = [...currentArticles];
        
        // Sort the articles
        const sortedArticles = sortArticles(articlesToSort, e.target.value);
        
        // Clear and regenerate the grid with sorted articles
        newsArticlesGrid.innerHTML = '';
        generateArticles(sortedArticles);
    });
    
    const openArticleId = sessionStorage.getItem('openArticleId');
    
    function truncateContent(content, maxLength = 150) {
        const plainText = content.replace(/<[^>]*>/g, '');
        if (plainText.length <= maxLength) return plainText;
        return plainText.substr(0, maxLength) + '...';
    }
    
    function generateArticles(articles) {
        // Clear the grid first
        newsArticlesGrid.innerHTML = '';
        
        // Generate and append articles in the sorted order
        articles.forEach(article => {
            const articleElement = document.createElement('article');
            articleElement.className = 'news-article-card';
            articleElement.dataset.articleId = article.id;

            articleElement.innerHTML = `
                <div class="article-admin-controls" style="display: none;">
                    <button class="delete-article-btn" aria-label="Delete article">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
                <img src="${article.imageUrl}" alt="${article.title}" class="news-article-image">
                <div class="news-article-content">
                    <span class="news-article-category">${article.category}</span>
                    <h2 class="news-article-title">${article.title}</h2>
                    <div class="news-article-meta">
                        <span class="news-article-date">${article.createdAt}</span>
                        <span class="news-article-author">Ni ${article.author}</span>
                    </div>
                    <div class="news-article-preview">${article.content.substring(0, 150)}...</div>
                    <div class="news-article-full-content" style="display: none;">${article.content}</div>
                    <button class="read-more-btn">Read More</button>
                </div>
                <!-- Comments Section -->
                <section class="comments-section" style="display: none;">
                    <h2 class="comments-section__title">Comments</h2>
                    <div class="comments-container"></div>
                    <div class="comment-form">
                        <h3 class="comment-form__title">Leave a Comment</h3>
                        <div class="comment-input-container">
                            <textarea 
                                class="comment-input" 
                                placeholder="Write your comment..." 
                                aria-label="Write your comment"
                                disabled
                            ></textarea>
                            <button class="comment-submit-arrow" aria-label="Post comment" disabled>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </div>
                        <p class="comment-login-message">
                            Please <button class="login-prompt">sign in</button> to leave a comment.
                        </p>
                    </div>
                </section>
            `;

            // Add event listeners
            setupArticleInteractions(articleElement, article.id);
            
            // Append the article to the grid
            newsArticlesGrid.appendChild(articleElement);
        });
    }

    function setupArticleInteractions(articleElement, articleId) {
        const readMoreBtn = articleElement.querySelector('.read-more-btn');
            readMoreBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const allCards = document.querySelectorAll('.news-article-card');
            const commentsSection = articleElement.querySelector('.comments-section');

                // Hide all other cards
                allCards.forEach(card => {
                if (card !== articleElement) {
                        card.style.display = 'none';
                    }
                });

                // Show back button
                const backButton = document.createElement('button');
                backButton.className = 'back-to-articles';
                backButton.innerHTML = '← Back to Articles';
                
                if (!document.querySelector('.back-to-articles')) {
                    newsArticlesGrid.insertBefore(backButton, newsArticlesGrid.firstChild);
                }

                // Expand clicked card
            articleElement.classList.add('expanded');
                newsArticlesGrid.classList.add('single-article-view');
            articleElement.querySelector('.news-article-preview').style.display = 'none';
            articleElement.querySelector('.news-article-full-content').style.display = 'block';
                commentsSection.style.display = 'block';
                readMoreBtn.style.display = 'none';

            // Load comments
            await loadComments(articleId, articleElement);
            setupCommentForm(articleElement, articleId);
        });

            // Check if user is admin and show delete button
            const checkAdminAndSetupControls = async () => {
                const user = auth.currentUser;
                if (user) {
                    const isAdmin = await adminManager.checkIfAdmin(user.uid);
                const adminControls = articleElement.querySelector('.article-admin-controls');
                    if (adminControls) {
                        adminControls.style.display = isAdmin ? 'flex' : 'none';
                    }
                }
            };

            // Setup delete button functionality
        const deleteBtn = articleElement.querySelector('.delete-article-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    const shouldDelete = await createModal(
                        'Delete Article',
                        'Are you sure you want to delete this article? This action cannot be undone.',
                        'Delete',
                        'Cancel'
                    );

                    if (shouldDelete) {
                        try {
                        await database.ref(`articles/${articleId}`).remove();
                        articleElement.remove();
                            showNotification('success', 'Article deleted successfully');
                        } catch (error) {
                            console.error('Error deleting article:', error);
                            showNotification('error', 'Failed to delete article');
                        }
                    }
                });
            }

            // Check admin status when article is created
            checkAdminAndSetupControls();

            // Listen for auth state changes
            auth.onAuthStateChanged(checkAdminAndSetupControls);
    }

    function createCommentElement(comment, commentId, articleId) {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.dataset.commentId = commentId;
        
        // Get current user ID
        const currentUserId = auth.currentUser?.uid;
        
        // Handle deleted comments visibility
        if (comment.isDeleted) {
            // If not admin and not the original commenter, don't show the comment
            if (!adminManager.isAdmin && currentUserId !== comment.userId) {
                return null;
            }
        }

        // Determine what message to show for deleted comments
        let commentContent = comment.text;
        if (comment.isDeleted) {
            if (currentUserId === comment.userId) {
                commentContent = '<em class="deleted-message personal">Your comment has been removed by an administrator.</em>';
            } else if (adminManager.isAdmin) {
                commentContent = `<em class="deleted-message admin">${comment.text}</em>
                                <div class="deleted-indicator">(Deleted)</div>`;
            }
        }

        // Create admin action info if available
        let adminActionInfo = '';
        if (adminManager.isAdmin) {
            if (comment.isDeleted && comment.deletedBy) {
                const deleteDate = new Date(comment.deletedAt).toLocaleString();
                adminActionInfo = `
                    <div class="admin-action-info deleted">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
                        </svg>
                        Deleted by ${comment.deletedBy.displayName} on ${deleteDate}
                    </div>
                `;
            } else if (comment.restoredBy) {
                const restoreDate = new Date(comment.restoredAt).toLocaleString();
                adminActionInfo = `
                    <div class="admin-action-info restored">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12">
                            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                        </svg>
                        Restored by ${comment.restoredBy.displayName} on ${restoreDate}
                    </div>
                `;
            }
        }

        // Add permanent delete button for deleted comments that admins can see
        let permanentDeleteButton = '';
        if (adminManager.isAdmin && comment.isDeleted) {
            permanentDeleteButton = `
                <button class="admin-permanent-delete-comment" data-comment-id="${commentId}" data-article-id="${articleId}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Permanently Delete
                </button>
            `;
        }

        commentElement.innerHTML = `
            <div class="comment-header">
                <div class="comment-avatar-meta">
                    <img src="${comment.userPhoto}" alt="" class="comment-avatar">
                    <div class="comment-meta">
                        <span class="comment-author">${comment.userName}</span>
                        <span class="comment-date">${new Date(comment.timestamp).toLocaleDateString()}</span>
                        ${comment.isDeleted && adminManager.isAdmin ? '<span class="comment-deleted-badge">(Deleted)</span>' : ''}
                    </div>
                </div>
                ${adminManager.isAdmin ? `
                    <div class="admin-comment-actions">
                        ${!comment.isDeleted ? `
                            <button class="admin-delete-comment" data-comment-id="${commentId}" data-article-id="${articleId}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                        ` : `
                            <button class="admin-restore-comment" data-comment-id="${commentId}" data-article-id="${articleId}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                                </svg>
                            </button>
                            ${permanentDeleteButton}
                        `}
                    </div>
                ` : ''}
            </div>
            <div class="comment-content ${comment.isDeleted ? 'comment-deleted' : ''}">
                ${commentContent}
                ${adminActionInfo}
            </div>
        `;

        // Add event listeners after creating the element
        if (adminManager.isAdmin) {
            // For delete button
            const deleteBtn = commentElement.querySelector('.admin-delete-comment');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const shouldDelete = await createModal(
                        'Delete Comment',
                        'Are you sure you want to delete this comment?',
                        'Delete',
                        'Cancel'
                    );

                    if (shouldDelete) {
                        const success = await adminManager.deleteComment(commentId, articleId);
                        if (success) {
                            // Refresh comments immediately
                            const commentsContainer = commentElement.closest('.comments-container');
                            if (commentsContainer) {
                                const articleElement = commentsContainer.closest('article');
                                await loadComments(articleId, articleElement);
                            }
                        }
                    }
                });
            }

            // For restore button
            const restoreBtn = commentElement.querySelector('.admin-restore-comment');
            if (restoreBtn) {
                restoreBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const shouldRestore = await createModal(
                        'Restore Comment',
                        'Are you sure you want to restore this comment?',
                        'Restore',
                        'Cancel',
                        'restore'
                    );

                    if (shouldRestore) {
                        const success = await adminManager.restoreComment(commentId, articleId);
                        if (success) {
                            // Refresh comments immediately
                            const commentsContainer = commentElement.closest('.comments-container');
                            if (commentsContainer) {
                                const articleElement = commentsContainer.closest('article');
                                await loadComments(articleId, articleElement);
                            }
                        }
                    }
                });
            }

            // Add permanent delete button handler
            const permanentDeleteBtn = commentElement.querySelector('.admin-permanent-delete-comment');
            if (permanentDeleteBtn) {
                permanentDeleteBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const shouldPermanentlyDelete = await createModal(
                        'Permanently Delete Comment',
                        'Warning: This action cannot be undone. The comment will be permanently removed from the database. Are you sure?',
                        'Permanently Delete',
                        'Cancel',
                        'permanent-delete'
                    );

                    if (shouldPermanentlyDelete) {
                        const success = await adminManager.permanentlyDeleteComment(commentId, articleId);
                        if (success) {
                            // Remove the comment from UI immediately
                            commentElement.remove();
                        }
                    }
                });
            }
        }

        return commentElement;
    }

    async function loadComments(articleId, articleElement) {
        const commentsContainer = articleElement.querySelector('.comments-container');
        commentsContainer.innerHTML = '';

        // Check admin status before loading comments
        const isAdmin = await adminManager.checkIfAdmin(auth.currentUser?.uid);
        adminManager.isAdmin = isAdmin;

        const commentsRef = database.ref(`comments/${articleId}`);
        commentsRef.off('child_added');
        commentsRef.off('child_changed');
        
        commentsRef.on('child_added', (snapshot) => {
            const comment = snapshot.val();
            const commentElement = createCommentElement(comment, snapshot.key, articleId);
            if (commentElement) {
                commentsContainer.appendChild(commentElement);
            }
        });

        commentsRef.on('child_changed', (snapshot) => {
            const comment = snapshot.val();
            const existingComment = commentsContainer.querySelector(`[data-comment-id="${snapshot.key}"]`);
            if (existingComment) {
                const newCommentElement = createCommentElement(comment, snapshot.key, articleId);
                if (newCommentElement) {
                    existingComment.replaceWith(newCommentElement);
                } else {
                    existingComment.remove();
                }
            }
        });
    }

    const handleCommentSubmit = async (event, articleId, commentInput) => {
        event.preventDefault();
        const comment = commentInput.value.trim();
        if (!comment) return;

        try {
            const user = auth.currentUser;
            if (!user) return;

            // Get the article element from the comment input
            const articleElement = commentInput.closest('article');
            
            const commentRef = database.ref(`comments/${articleId}`).push();
            await commentRef.set({
                text: comment,
                userId: user.uid,
                userName: user.displayName,
                userPhoto: user.photoURL,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                isDeleted: false
            });

            commentInput.value = '';
            // Pass both articleId and articleElement
            await loadComments(articleId, articleElement);
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    function setupCommentForm(articleElement, articleId) {
        const commentInput = articleElement.querySelector('.comment-input');
        const submitButton = articleElement.querySelector('.comment-submit-arrow');
        const loginMessage = articleElement.querySelector('.comment-login-message');

        const updateFormState = (user) => {
            const isSignedIn = !!user;
            commentInput.disabled = !isSignedIn;
            submitButton.disabled = !isSignedIn;
            loginMessage.style.display = isSignedIn ? 'none' : 'block';
        };

        // Handle enter key press
        commentInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleCommentSubmit(event, articleId, commentInput);
            }
        });

        // Handle arrow button click
        submitButton.addEventListener('click', (event) => {
            handleCommentSubmit(event, articleId, commentInput);
        });

        // Update form state based on auth
        auth.onAuthStateChanged(updateFormState);
    }

    categoryButtons.forEach(button => {
        const category = button.dataset.category;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove back button if it exists
            const backButton = document.querySelector('.back-to-articles');
            if (backButton) {
                backButton.remove();
            }
            
            // Reset view
            newsArticlesGrid.classList.remove('single-article-view');
            
            // Update active state
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter and display articles
            filterArticles(category);
        });
    });

    // Initial load - show all articles
    filterArticles('All');

    // Handle back button click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('back-to-articles')) {
            // Get all article cards before modifying the grid
            const articleCards = document.querySelectorAll('.news-article-card');
            if (!articleCards.length) return; // Exit if no cards found

            const articlesGrid = document.getElementById('news-articles-grid');
            if (!articlesGrid) return; // Exit if grid not found

            // Reset grid display
            articlesGrid.style.display = 'grid';
            
            // Show all articles
            articleCards.forEach(card => {
                if (card) {
                    card.style.display = 'block';
                    card.classList.remove('expanded');
                }
            });

            // Show categories section
            const categoriesSection = document.querySelector('.categories-section');
            if (categoriesSection) {
                categoriesSection.style.display = 'flex';
            }

            // Remove back button
            e.target.remove();
        }
    });

    function showNotification(type, message) {
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
});