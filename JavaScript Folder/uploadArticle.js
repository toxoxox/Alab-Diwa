import { auth, database } from './firebase-config.js';

async function handleArticleUpload(form) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('You must be signed in to upload articles');
        }

        const title = form.querySelector('#article-title').value;
        const content = form.querySelector('#article-content').value;
        const category = form.querySelector('#article-category').value;
        const author = form.querySelector('#article-author').value;
        const date = form.querySelector('#article-date').value;
        const imageFile = form.querySelector('#article-image').files[0];

        // Convert image to base64
        const imageBase64 = await convertImageToBase64(imageFile);

        // Create a new article reference
        const articleRef = database.ref('articles').push();

        // Save the article data
        await articleRef.set({
            title,
            content,
            category,
            author,
            authorId: user.uid,
            imageUrl: imageBase64,
            createdAt: date,
            updatedAt: new Date().toLocaleDateString()
        });

        console.log('Article saved successfully');
        return true;
    } catch (error) {
        console.error('Error uploading article:', error);
        throw error;
    }
}

function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

export { handleArticleUpload }; 