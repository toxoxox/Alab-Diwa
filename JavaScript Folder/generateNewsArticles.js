import { auth, database } from './firebase-config.js';
import { newsArticles } from './newsArticlesData.js';
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
    
    const openArticleId = sessionStorage.getItem('openArticleId');
    
    console.log('Initial articles loaded:', newsArticles);
    
    function truncateContent(content, maxLength = 150) {
        const plainText = content.replace(/<[^>]*>/g, '');
        if (plainText.length <= maxLength) return plainText;
        return plainText.substr(0, maxLength) + '...';
    }
    
    function generateArticles(articles) {
        newsArticlesGrid.innerHTML = '';
        
        articles.forEach((item, index) => {
            const articleId = `article-${index}`;
            const newsArticleElement = document.createElement('article');
            newsArticleElement.className = 'news-article-card';
            newsArticleElement.dataset.articleId = articleId;

            newsArticleElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="news-article-image">
                <div class="news-article-content">
                    <span class="news-article-category">${item.category}</span>
                    <h2 class="news-article-title">${item.title}</h2>
                    <div class="news-article-meta">
                        <span class="news-article-date">${item.date}</span>
                        <span class="news-article-author">Ni ${item.author}</span>
                    </div>
                    <div class="news-article-preview">${truncateContent(item.content)}</div>
                    <div class="news-article-full-content" style="display: none;">${item.content}</div>
                    <button class="read-more-btn">Read More</button>
                </div>

                <!-- Comments Section -->
                <section class="comments-section" style="display: none;">
                    <h2 class="comments-section__title">Comments</h2>
                    <div class="comments-container"></div>
                    
                    <!-- Comment Form -->
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

            const readMoreBtn = newsArticleElement.querySelector('.read-more-btn');
            readMoreBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const allCards = document.querySelectorAll('.news-article-card');
                const commentsSection = newsArticleElement.querySelector('.comments-section');
                const articleId = newsArticleElement.dataset.articleId;

                // Hide all other cards
                allCards.forEach(card => {
                    if (card !== newsArticleElement) {
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

                // Handle back button click
                backButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    allCards.forEach(card => {
                        card.style.display = '';
                        card.classList.remove('expanded');
                        const cardCommentsSection = card.querySelector('.comments-section');
                        if (cardCommentsSection) {
                            cardCommentsSection.style.display = 'none';
                        }
                        card.querySelector('.news-article-preview').style.display = 'block';
                        card.querySelector('.news-article-full-content').style.display = 'none';
                        card.querySelector('.read-more-btn').style.display = 'block';
                    });
                    backButton.remove();
                    newsArticlesGrid.classList.remove('single-article-view');
                });

                // Expand clicked card
                newsArticleElement.classList.add('expanded');
                newsArticlesGrid.classList.add('single-article-view');
                newsArticleElement.querySelector('.news-article-preview').style.display = 'none';
                newsArticleElement.querySelector('.news-article-full-content').style.display = 'block';
                commentsSection.style.display = 'block';
                readMoreBtn.style.display = 'none';

                // Load existing comments
                await loadComments(articleId, newsArticleElement);

                // Setup comment form when article is expanded
                setupCommentForm(newsArticleElement, articleId);
            });

            newsArticlesGrid.appendChild(newsArticleElement);
            
            if (openArticleId === articleId) {
                sessionStorage.removeItem('openArticleId');
                setTimeout(() => {
                    const readMoreBtn = newsArticleElement.querySelector('.read-more-btn');
                    if (readMoreBtn) {
                        readMoreBtn.click();
                        newsArticleElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        });
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

    function filterArticles(category) {
        console.log('Filtering by category:', category);
        let articlesToShow;
        
        if (category === 'All') {
            articlesToShow = newsArticles;
        } else {
            articlesToShow = newsArticles.filter(article => article.category === category);
        }
        
        console.log('Articles to show:', articlesToShow);
        newsArticlesGrid.innerHTML = ''; // Clear the grid
        generateArticles(articlesToShow);

        // Check if there's a selected article from highlights
        const selectedArticle = sessionStorage.getItem('selectedArticle');
        if (selectedArticle) {
            // Find the article card with matching title
            const articleCards = document.querySelectorAll('.news-article-card');
            articleCards.forEach(card => {
                const cardTitle = card.querySelector('.news-article-title').textContent;
                if (cardTitle === selectedArticle) {
                    // Click the read more button of this card
                    const readMoreBtn = card.querySelector('.read-more-btn');
                    if (readMoreBtn) {
                        readMoreBtn.click();
                        // Scroll to the article
                        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
            // Clear the selected article from session storage
            sessionStorage.removeItem('selectedArticle');
        }
    }

    categoryButtons.forEach(button => {
        const category = button.dataset.category;
        console.log('Setting up button for category:', category);
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Button clicked:', category);
            
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
});