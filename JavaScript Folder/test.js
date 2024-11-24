import { auth, database } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Remove or comment out this event listener since it conflicts with auth-session.js
    /*
    const googleSignInBtn = document.getElementById('google-signin');
    
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async () => {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await auth.signInWithPopup(provider);
            } catch (error) {
                console.error('Error signing in:', error);
            }
        });
    }
    */

    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User signed in:', user);
        } else {
            console.log('User signed out');
        }
    });
});

const checkMyAdminStatus = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.log('Please sign in first');
        return;
    }

    try {
        const adminSnapshot = await database.ref(`admins/${user.uid}`).once('value');
        console.log('Current user:', {
            email: user.email,
            displayName: user.displayName,
            uid: user.uid
        });
        console.log('Admin status:', adminSnapshot.exists());
        if (adminSnapshot.exists()) {
            console.log('Admin data:', adminSnapshot.val());
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
};

window.checkMyAdminStatus = checkMyAdminStatus;

// Add these helper functions
const listArticleComments = async (articleId) => {
    try {
        const snapshot = await database.ref(`comments/${articleId}`).once('value');
        const comments = snapshot.val();
        console.log(`Comments for ${articleId}:`, comments);
        if (comments) {
            Object.entries(comments).forEach(([commentId, comment]) => {
                console.log(`Comment ID: ${commentId}`);
                console.log('Content:', comment);
                console.log('---');
            });
        } else {
            console.log('No comments found for this article');
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
};

const listAllArticles = () => {
    const articles = document.querySelectorAll('.news-article-card');
    articles.forEach(article => {
        console.log('Article ID:', article.dataset.articleId);
    });
};

// Make functions available globally
window.listArticleComments = listArticleComments;
window.listAllArticles = listAllArticles;