document.addEventListener('DOMContentLoaded', () => {
    const loadStoriesBtn = document.getElementById('loadStoriesBtn');
    const loadSeoBtn = document.getElementById('loadSeoBtn');
    const storiesTableBody = document.querySelector('#storiesTable tbody');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const API_TOKEN = '';
    const BASE_URL = 'https://mapi.storyblok.com/v1/spaces/103684/stories/';
    let allStories = []; // To store all fetched stories

    loadStoriesBtn.addEventListener('click', fetchAllStories);
    loadSeoBtn.addEventListener('click', fetchSeoData);

    async function fetchAllStories() {
        loadingIndicator.style.display = 'block';
        loadStoriesBtn.disabled = true;
        storiesTableBody.innerHTML = ''; // Clear previous data
        allStories = []; // Reset stories
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                const url = `${BASE_URL}?per_page=100&page=${page}&starts_with=damen/en&filter_query[component][in]=site,Family&is_published=true`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': API_TOKEN
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.stories && data.stories.length > 0) {
                    allStories = allStories.concat(data.stories);
                    page++;
                } else {
                    hasMore = false;
                }
            } catch (error) {
                console.error('Error fetching stories:', error);
                alert('Failed to load stories. Check console for details.');
                hasMore = false;
            }
        }
        renderStoriesTable();
        loadStoriesBtn.disabled = false;
        loadSeoBtn.disabled = false;
        loadingIndicator.style.display = 'none';
    }

    function renderStoriesTable() {
        storiesTableBody.innerHTML = ''; // Clear table before rendering
        allStories.forEach(story => {
            const row = storiesTableBody.insertRow();
            row.insertCell().textContent = story.id;
            row.insertCell().textContent = story.name;
            row.insertCell().textContent = story.parent_id || 'N/A'; // Parent ID might be null
            const linkCell = row.insertCell();
            const storyLink = `https://app.storyblok.com/#/me/spaces/103684/stories/0/0/${story.id}`;
            linkCell.innerHTML = `<a href="${storyLink}" target="_blank">link</a>`;
            row.insertCell().textContent = ''; // Placeholder for SEO Title
            row.insertCell().textContent = ''; // Placeholder for SEO Description
        });
    }

    async function fetchSeoData() {
        if (allStories.length === 0) {
            alert('Please load stories first!');
            return;
        }

        loadingIndicator.style.display = 'block';
        loadSeoBtn.disabled = true;

        const tableRows = storiesTableBody.querySelectorAll('tr');

        for (let i = 0; i < allStories.length; i++) {
            const story = allStories[i];
            const row = tableRows[i]; // Get the corresponding table row

            try {
                const url = `${BASE_URL}${story.id}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': API_TOKEN
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const seoTitle = data.story.content.seo_fields?.title || 'N/A';
                const seoDescription = data.story.content.seo_fields?.description || 'N/A';

                row.cells[4].textContent = seoTitle; // Update SEO Title column
                row.cells[5].textContent = seoDescription; // Update SEO Description column
            } catch (error) {
                console.error(`Error fetching SEO data for story ${story.id}:`, error);
                row.cells[4].textContent = 'Error';
                row.cells[5].textContent = 'Error';
            }
        }
        loadingIndicator.style.display = 'none';
        loadSeoBtn.disabled = false;
    }
});
