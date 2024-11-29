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

if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();
const firestore = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
        // Handle error silently or with a proper error handling system
    });

export const checkDatabaseAccess = async () => {
    try {
        const testRef = database.ref('.info/connected');
        await testRef.once('value');
        return true;
    } catch (error) {
        return false;
    }
};

export { auth, database, firestore }; 