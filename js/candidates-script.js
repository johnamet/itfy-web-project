import {createCandidateCard2} from './utils/components/createCandidateCard.js';
import { fetchData } from './utils/fetchData.js';
import { baseUrl } from './utils/constants.js';
import EmptyNotice from "./utils/components/emptyNotice.js";

document.addEventListener('DOMContentLoaded', async () => {
    const emptyNotice = document.getElementById('emptyNotice');
    const candidateList = document.getElementById('candidateList');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let page = 1;
    const limit = 9;

    async function loadCandidates() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const categoryId = urlParams.get('category');
            const eventId = urlParams.get('eventId');
            const category_ids = categoryId ? [categoryId] : [];

            const response = await fetchData('GET',
                `${baseUrl}/candidates?page=${page}&limit=${limit}&category_ids=${category_ids}&event_id=${eventId}`);

            const candidates = response.candidates;

            candidates.forEach(candidate => {
                const candidateCard = createCandidateCard2(candidate);
                candidateList.appendChild(candidateCard);
            });

            if (candidates.length === 0 && page === 1) {
                candidateList.style.display = 'none';
                loadMoreBtn.style.display = 'none';
                emptyNotice.style.display = 'block';
                emptyNotice.innerHTML = EmptyNotice({
                    message: "No candidates found for this category",
                    subMessage: "Try exploring other categories or check back later for updates"
                });
            }
            if (candidates.length < limit) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }

            page++;
        } catch (error) {
            candidateList.style.display = 'none';
            loadMoreBtn.style.display = 'none';
            emptyNotice.style.display = 'block';
            emptyNotice.innerHTML = EmptyNotice({
                message: "No candidates found for this category",
                subMessage: "Try exploring other categories or check back later for updates"
            });
            console.error('Error loading candidates:', error);
        }
    }

    loadMoreBtn.addEventListener('click', loadCandidates);

    // Initial load
    await loadCandidates();

    // Add animation to candidate cards
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        observer.observe(node);
                    }
                });
            }
        });
    });

    observer.observe(candidateList, { childList: true });
});