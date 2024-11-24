document.addEventListener('DOMContentLoaded', function() {
    const isMobile = window.innerWidth <= 768;
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const newsArticlesGrid = document.getElementById('news-articles-grid');
    let autocompleteDropdown;

    // Only create autocomplete dropdown if we're not on mobile
    if (!isMobile && searchInput) {
        function createAutocompleteDropdown() {
            autocompleteDropdown = document.createElement('div');
            autocompleteDropdown.className = 'autocomplete-dropdown';
            searchInput.parentNode.appendChild(autocompleteDropdown);
        }

        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase();
            const articles = newsArticlesGrid.querySelectorAll('.news-article-card');

            articles.forEach(article => {
                const title = article.querySelector('.news-article-title').textContent.toLowerCase();
                const content = article.querySelector('.news-article-full-content').textContent.toLowerCase();

                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    article.style.display = '';
                } else {
                    article.style.display = 'none';
                }
            });
        }

        function updateAutocomplete() {
            const searchTerm = searchInput.value.toLowerCase();
            const articles = newsArticlesGrid.querySelectorAll('.news-article-card');
            const suggestions = [];

            articles.forEach(article => {
                const title = article.querySelector('.news-article-title').textContent;
                if (title.toLowerCase().includes(searchTerm) && !suggestions.includes(title)) {
                    suggestions.push(title);
                }
            });

            displaySuggestions(suggestions);
        }

        function displaySuggestions(suggestions) {
            autocompleteDropdown.innerHTML = '';
            if (suggestions.length > 0) {
                suggestions.forEach(suggestion => {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.className = 'autocomplete-item';
                    suggestionElement.textContent = suggestion;
                    suggestionElement.addEventListener('click', () => {
                        searchInput.value = suggestion;
                        performSearch();
                        autocompleteDropdown.style.display = 'none';
                    });
                    autocompleteDropdown.appendChild(suggestionElement);
                });
                autocompleteDropdown.style.display = 'block';
            } else {
                autocompleteDropdown.style.display = 'none';
            }
        }

        createAutocompleteDropdown();

        // Add event listeners for desktop search
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
                autocompleteDropdown.style.display = 'none';
            }
        });
        searchInput.addEventListener('input', updateAutocomplete);
        searchInput.addEventListener('focus', updateAutocomplete);
        searchInput.addEventListener('click', function() {
            this.select();
        });
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
                autocompleteDropdown.style.display = 'none';
            }
        });
    }

    // Mobile search functionality
    const mobileSearchButton = document.querySelector('.mobile-search-button');
    const mobileSearchOverlay = document.querySelector('.mobile-search-overlay');
    const mobileSearchBack = document.querySelector('.mobile-search-back');
    const mobileSearchInput = document.querySelector('.mobile-search-input');
    const mobileSearchResults = document.querySelector('.mobile-search-results');

    if (mobileSearchButton && mobileSearchOverlay) {
        // Function to close search overlay
        function closeSearchOverlay() {
            mobileSearchOverlay.classList.remove('active');
            document.body.style.overflow = '';
            mobileSearchInput.value = ''; // Clear input
            mobileSearchResults.innerHTML = ''; // Clear results
        }

        // Function to display recent articles
        function showRecentArticles() {
            const articles = document.querySelectorAll('.news-article-card');
            mobileSearchResults.innerHTML = '';
            
            // Show first 5 articles as suggestions
            for(let i = 0; i < Math.min(5, articles.length); i++) {
                const title = articles[i].querySelector('.news-article-title').textContent;
                const resultItem = document.createElement('div');
                resultItem.className = 'mobile-search-result-item';
                resultItem.innerHTML = `
                    <h3>${title}</h3>
                `;
                resultItem.addEventListener('click', () => {
                    closeSearchOverlay();
                    articles[i].scrollIntoView({ behavior: 'smooth' });
                });
                mobileSearchResults.appendChild(resultItem);
            }
        }

        // Open mobile search and show recent articles
        mobileSearchButton.addEventListener('click', () => {
            mobileSearchOverlay.classList.add('active');
            mobileSearchInput.focus();
            document.body.style.overflow = 'hidden';
            showRecentArticles();
        });

        // Add back button functionality
        mobileSearchBack.addEventListener('click', closeSearchOverlay);

        // Update the input event listener
        mobileSearchInput.addEventListener('input', () => {
            const searchTerm = mobileSearchInput.value.toLowerCase();
            const articles = document.querySelectorAll('.news-article-card');
            mobileSearchResults.innerHTML = '';

            if (searchTerm === '') {
                showRecentArticles();
                return;
            }

            articles.forEach(article => {
                const title = article.querySelector('.news-article-title').textContent;
                
                if (title.toLowerCase().includes(searchTerm)) {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'mobile-search-result-item';
                    resultItem.innerHTML = `
                        <h3>${title}</h3>
                    `;
                    resultItem.addEventListener('click', () => {
                        closeSearchOverlay();
                        article.scrollIntoView({ behavior: 'smooth' });
                    });
                    mobileSearchResults.appendChild(resultItem);
                }
            });
        });

        // Close search overlay on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileSearchOverlay.classList.contains('active')) {
                closeSearchOverlay();
            }
        });
    }
});
