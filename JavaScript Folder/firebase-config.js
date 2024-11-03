// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyD0xRQ1DV9g7Wm7E1mlzOUjTwiNu4sZnR0",
    authDomain: "alab-diwa-7b218.firebaseapp.com",
    databaseURL: "https://alab-diwa-7b218-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "alab-diwa-7b218",
    storageBucket: "alab-diwa-7b218.firebasestorage.app",
    messagingSenderId: "616583811825",
    appId: "1:616583811825:web:51faebbe29dce783594f50",
    measurementId: "G-0RV9SV4TGX"
};

// Initialize Firebase using compat version
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Add admin check function
export async function checkIfAdmin(uid) {
    if (!uid) return false;
    
    try {
        const adminRef = database.ref(`admins/${uid}`);
        const snapshot = await adminRef.once('value');
        return snapshot.exists();
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Add this function to check database access
export async function checkDatabaseAccess(path) {
    const user = auth.currentUser;
    if (!user) return false;
    
    try {
        // Only check admins node since we've simplified the admin structure
        const adminRef = database.ref(`admins/${user.uid}`);
        const snapshot = await adminRef.once('value');
        return snapshot.exists();
    } catch (error) {
        console.error('Error checking database access:', error);
        return false;
    }
}

export { auth, database, firebaseConfig }; 