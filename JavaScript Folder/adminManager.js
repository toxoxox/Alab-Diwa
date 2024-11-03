import { auth, database } from './firebase-config.js';

class AdminManager {
    constructor() {
        this.isAdmin = false;
        this.initAdminCheck();
    }

    async initAdminCheck() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const adminSnapshot = await database.ref(`admins/${user.uid}`).once('value');
                this.isAdmin = adminSnapshot.exists();
                this.updateAdminUI();
            } else {
                this.isAdmin = false;
                this.updateAdminUI();
            }
        });
    }

    async checkIfAdmin(uid) {
        if (!uid) return false;
        try {
            const adminSnapshot = await database.ref(`admins/${uid}`).once('value');
            const isAdmin = adminSnapshot.exists();
            this.isAdmin = isAdmin;
            return isAdmin;
        } catch (error) {
            return false;
        }
    }

    updateAdminUI() {
        const deleteButtons = document.querySelectorAll('.admin-delete-comment');
        const restoreButtons = document.querySelectorAll('.admin-restore-comment');
        
        deleteButtons.forEach(button => {
            button.style.display = this.isAdmin ? 'block' : 'none';
        });
        
        restoreButtons.forEach(button => {
            button.style.display = this.isAdmin ? 'block' : 'none';
        });
    }

    async deleteComment(commentId, articleId) {
        try {
            const user = auth.currentUser;
            if (!user) return false;

            // Check admin status
            const adminSnapshot = await database.ref(`admins/${user.uid}`).once('value');
            if (!adminSnapshot.exists()) return false;

            const commentRef = database.ref(`comments/${articleId}/${commentId}`);
            const snapshot = await commentRef.once('value');
            const commentData = snapshot.val();

            if (!commentData) return false;

            // Update comment with deletion info
            await commentRef.update({
                isDeleted: true,
                deletedAt: Date.now(),
                deletedBy: {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email
                }
            });

            // Log deletion
            await database.ref('deletionLogs').push({
                commentId,
                articleId,
                deletedAt: Date.now(),
                deletedBy: {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email
                },
                originalComment: commentData
            });

            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            return false;
        }
    }

    async restoreComment(commentId, articleId) {
        try {
            const user = auth.currentUser;
            if (!user) return false;

            // Check admin status
            const adminSnapshot = await database.ref(`admins/${user.uid}`).once('value');
            if (!adminSnapshot.exists()) return false;

            const commentRef = database.ref(`comments/${articleId}/${commentId}`);
            const snapshot = await commentRef.once('value');
            const commentData = snapshot.val();

            if (!commentData) return false;

            // Update comment with restoration info
            await commentRef.update({
                isDeleted: false,
                deletedAt: null,
                deletedBy: null,
                restoredAt: Date.now(),
                restoredBy: {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email
                }
            });

            return true;
        } catch (error) {
            console.error('Error restoring comment:', error);
            return false;
        }
    }

    async permanentlyDeleteComment(commentId, articleId) {
        try {
            const user = auth.currentUser;
            if (!user) return false;

            // Check admin status
            const adminSnapshot = await database.ref(`admins/${user.uid}`).once('value');
            if (!adminSnapshot.exists()) return false;

            // Get comment data for logging before deletion
            const commentRef = database.ref(`comments/${articleId}/${commentId}`);
            const snapshot = await commentRef.once('value');
            const commentData = snapshot.val();

            if (!commentData) return false;

            // Log the permanent deletion
            await database.ref('permanentDeletionLogs').push({
                commentId,
                articleId,
                deletedAt: Date.now(),
                deletedBy: {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email
                },
                originalComment: commentData
            });

            // Permanently remove the comment
            await commentRef.remove();

            return true;
        } catch (error) {
            console.error('Error permanently deleting comment:', error);
            return false;
        }
    }
}

const adminManager = new AdminManager();
export default adminManager; 