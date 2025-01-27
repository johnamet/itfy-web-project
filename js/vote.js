import {fetchEventDetails} from "./utils/fetchEventDetails.js";
import {fetchCandidateData} from "./utils/fetchCandidateData.js";

document.addEventListener('DOMContentLoaded', async () => {
    const backgroundOverlay = document.getElementById('background-overlay');
    const eventInfo = document.getElementById('event-info');
    const eventName = document.getElementById('event-name');
    const candidateInfo = document.getElementById('candidate-info');
    const candidateImage = document.getElementById('candidate-image');
    const candidateName = document.getElementById('candidate-name');
    const candidateDescription = document.getElementById('candidate-description');
    const categorySelect = document.getElementById('category-select');
    const voteCount = document.getElementById('vote-count');
    const voteButton = document.getElementById('vote-button');
    const voteForm = document.getElementById('vote-form');
    const voteModal = document.getElementById('vote-modal');
    const voteCountConfirm = document.getElementById('vote-count-confirm');
    const candidateNameConfirm = document.getElementById('candidate-name-confirm');
    const categoryNameConfirm = document.getElementById('category-name-confirm');
    const confirmVoteBtn = document.getElementById('confirm-vote');
    const cancelVoteBtn = document.getElementById('cancel-vote');

    let selectedCandidate = null;
    let selectedEvent = null;

    const colorThief = new ColorThief();


    // Load event and candidate data
    async function loadData() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('event');
        const candidateId = urlParams.get('candidate');
        const categoryId = urlParams.get('category');

        if (!eventId || !candidateId) {
            alert('Missing event or candidate information. Redirecting to the events list.');
            window.location.href = 'events.html';
            return;
        }

        try {
            const [eventData, candidateData] = await Promise.all([
                fetchEventDetails(eventId, false),
                fetchCandidateData(candidateId)
            ]);

            selectedEvent = eventData;
            console.log("Event Data", selectedEvent);
            selectedCandidate = candidateData;
            console.log("Candidate Data", selectedCandidate);
            populateCategoryDropdown(selectedEvent.categories.filter(category => selectedCandidate.category_ids.includes(category.id)), categoryId);

            displayEventInfo(selectedEvent);
            displayCandidateInfo(selectedCandidate);
            setPageTheme(selectedEvent.image);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load event or candidate data. Please try again.');
        }
    }

    // Display event information
    function displayEventInfo(event) {
        eventName.textContent = event.name;
    }

    // Display candidate information
    function displayCandidateInfo(candidate) {
        candidateImage.src = candidate.image;
        candidateImage.alt = candidate.name;
        candidateName.textContent = candidate.name;
        candidateDescription.textContent = candidate.description;
    }

    // Populate category dropdown
    function populateCategoryDropdown(categories, selectedCategoryId) {
        categorySelect.innerHTML = '<option value="">Choose a category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            if (category.id === parseInt(selectedCategoryId)) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
    }

    // Set page theme using Color Thief
    function setPageTheme(imageUrl) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;
        img.onload = function () {
            const color = colorThief.getColor(img);
            document.body.style.setProperty('--primary-color', `rgb(${color[0]}, ${color[1]}, ${color[2]})`);
            backgroundOverlay.style.backgroundImage = `url(${imageUrl})`;
        };
    }

    // Enable/disable vote button based on form validity
    function updateVoteButtonState() {
        voteButton.disabled = !(categorySelect.value && voteCount.value);
    }

    // Event listeners for form inputs
    categorySelect.addEventListener('change', updateVoteButtonState);
    voteCount.addEventListener('input', updateVoteButtonState);

    // Handle form submission
    voteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        openVoteModal();
    });

    // Open vote confirmation modal
    function openVoteModal() {
        voteCountConfirm.textContent = voteCount.value;
        candidateNameConfirm.textContent = selectedCandidate.name;
        categoryNameConfirm.textContent = categorySelect.options[categorySelect.selectedIndex].text;
        voteModal.style.display = 'block';
    }

    // Close vote confirmation modal
    function closeVoteModal() {
        voteModal.style.display = 'none';
    }

    // Handle vote confirmation
    function confirmVote() {
        // Simulated vote submission (replace with actual API call)
        console.log(`Vote submitted for ${selectedCandidate.name}`);
        console.log(`Event: ${selectedEvent.name}`);
        console.log(`Category: ${categorySelect.value}`);
        console.log(`Number of votes: ${voteCount.value}`);
        alert(`Thank you for voting for ${selectedCandidate.name}!`);
        closeVoteModal();
        // Optionally, redirect to a thank you page or refresh the candidate list
    }

    // Event listeners for modal buttons
    confirmVoteBtn.addEventListener('click', confirmVote);
    cancelVoteBtn.addEventListener('click', closeVoteModal);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === voteModal) {
            closeVoteModal();
        }
    });

    // Initialize the page
    await loadData();
});

