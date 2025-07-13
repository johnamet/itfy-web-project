import { fetchEventDetails } from "./utils/fetchEventDetails.js";
import { fetchCandidateData } from "./utils/fetchCandidateData.js";
import { fetchData } from "./utils/fetchData.js";
import { baseUrl, socket } from "./utils/constants.js";
import { fetchRawVotes, fetchVotes } from "./utils/fetchVotes.js";

document.addEventListener('DOMContentLoaded', async () => {
    const backgroundOverlay = document.getElementById('background-overlay');
    const eventName = document.getElementById('event-name');
    const candidateImage = document.getElementById('candidate-image');
    const candidateName = document.getElementById('candidate-name');
    const candidateVotes = document.getElementById('candidate-votes');
    const candidateDescription = document.getElementById('candidate-description');
    const categorySelect = document.getElementById('category-select');
    const voteButton = document.getElementById('vote-button');
    const voteForm = document.getElementById('vote-form');
    const voteModal = document.getElementById('vote-modal');
    const voteSummary = document.getElementById('vote-summary');
    const confirmVoteBtn = document.getElementById('confirm-vote');
    const cancelVoteBtn = document.getElementById('cancel-vote');
    const voteTrendChart = document.getElementById('voteTrendChart');
    const qrCodeDiv = document.getElementById('qr-code');
    const shareFacebook = document.getElementById('share-facebook');
    const shareTwitter = document.getElementById('share-twitter');
    const shareLinkedin = document.getElementById('share-linkedin');
    const voteHistory = document.getElementById('vote-history');
    const voteBundlesContainer = document.getElementById('vote-bundles');
    const bundleSelect = document.getElementById('bundle-select');
    const selectedBundlesContainer = document.getElementById('selected-bundles');
    const paymentReference = document.getElementById('payment-reference');
    const emailInput = document.getElementById('email');
    const subtotalElement = document.getElementById('subtotal');
    const discountAmountElement = document.getElementById('discount-amount');
    const totalAmountElement = document.getElementById('total-amount');
    const bundleInfoModal = document.getElementById('bundle-info-modal');
    const bundleInfoTitle = document.getElementById('bundle-info-title');
    const bundleInfoContent = document.getElementById('bundle-info-content');
    const closeBundleInfoBtn = document.getElementById('close-bundle-info');
    const selectBundleBtn = document.getElementById('select-bundle');
    const categoryLoading = document.getElementById('category-loading');
    const noBundlesMessage = document.getElementById('no-bundles-message');

    let selectedCandidate = null;
    let selectedEvent = null;
    let chartInstance = null;
    let voteData = []; // Store vote trend data
    const colorThief = new ColorThief();
    let voteBundles = []; // Store available vote bundles
    let selectedBundles = new Map(); // Map to store selected bundles and quantities
    let currentBundleInModal = null; // Currently viewed bundle in modal

    // Initialize WebSocket
    function initWebSocket(candidateId, votes) {
        socket.on("connect", () => console.log("WebSocket connected"));
        socket.on(`voteUpdate:${candidateId}`, (data) => {
            updateVoteTrend(data);
            addVoteToHistory(data);
            updateDisplay(votes, data);
        });
    }

    // Load event and candidate data
    async function loadData() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('event');
        const candidateId = urlParams.get('candidate');
        const categoryId = parseInt(urlParams.get('category'));

        if (!eventId || !candidateId) {
            showNotification('Missing event or candidate information. Redirecting to the events list.', 'error');
            setTimeout(() => {
                window.location.href = 'events.html';
            }, 3000);
            return;
        }

        try {
            const [eventData, candidateData, votes, bundlesData] = await Promise.all([
                fetchEventDetails(eventId, false),
                fetchCandidateData(candidateId),
                fetchVotes(eventId),
                fetchData("GET", `${baseUrl}/bundles`)
            ]);

            const votesData = votes.votes || [];
            voteBundles = bundlesData.bundles || [];

            selectedEvent = eventData;
            selectedCandidate = candidateData;

            populateCategoryDropdown(selectedEvent.categories.filter(category => selectedCandidate.category_ids.includes(category.id)), categoryId);
            displayEventInfo(selectedEvent);
            await displayCandidateInfo(selectedCandidate, votes);
            setPageTheme(selectedEvent.image);
            initVoteTrendChart(votesData);
            generateQRCode();
            initWebSocket(candidateId, votes);
            createHistory(votesData.slice(-5));

            // Initialize vote bundles for the selected category (if any)
            if (categoryId) {
                renderVoteBundles(categoryId);
                initializeBundleSelect(categoryId);
            } else {
                noBundlesMessage.classList.remove('hidden');
                voteBundlesContainer.innerHTML = '';
            }

            // Initialize Select2 for bundle multi-select
            $(document).ready(function() {
                $('#bundle-select').select2({
                    placeholder: "Select vote bundles",
                    allowClear: true
                });
                $('#bundle-select').on('change', handleBundleSelectChange);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Failed to load event, candidate, or bundle data. Please try again.', 'error');
            noBundlesMessage.textContent = 'Error loading bundles. Please try again later.';
            noBundlesMessage.classList.remove('hidden');
        }
    }

    // Display event information
    function displayEventInfo(event) {
        eventName.textContent = event.name;
    }

    // Display candidate information
    async function displayCandidateInfo(candidate, votes) {
        candidateImage.src = candidate.image || '../images/placeholder-user.jpg';
        candidateImage.alt = candidate.name;
        candidateName.textContent = candidate.name;
        candidateVotes.textContent = `Votes: ${votes.votes[0]?.votes || 0}`;
        candidateDescription.textContent = candidate.description || 'No description available.';
    }

    function updateDisplay(votes, vote) {
        const totalVotes = (votes.votes[0]?.votes || 0) + vote.number_of_votes;
        candidateVotes.textContent = `Votes: ${totalVotes || 0}`;
    }

    // Populate category dropdown
    function populateCategoryDropdown(categories, selectedCategoryId) {
        categorySelect.innerHTML = '<option value="">Choose a category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            if (category.id === selectedCategoryId) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
    }

    // Set page theme using Color Thief
    function setPageTheme(imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        img.onload = function () {
            const color = colorThief.getColor(img);
            document.body.style.setProperty('--primary-color', `rgb(${color[0]}, ${color[1]}, ${color[2]})`);
            backgroundOverlay.style.backgroundImage = `url(${imageUrl})`;
        };
    }

    // Initialize Vote Trend Chart
    function initVoteTrendChart(votesData) {
        voteData = votesData.map((vote) => {
            vote.time = new Date(vote.created_at);
            vote.votes = vote.number_of_votes;
            return vote;
        });

        chartInstance = new Chart(voteTrendChart, {
            type: 'line',
            data: {
                labels: voteData.map(d => d.time.toLocaleTimeString()),
                datasets: [{
                    label: 'Votes Over Time',
                    data: voteData.map(d => d.votes),
                    borderColor: '#34D399',
                    backgroundColor: 'rgba(52, 211, 153, 0.2)',
                    fill: true,
                    tension: 0.4,
                }],
            },
            options: {
                animation: { duration: 1000, easing: 'easeOutQuart' },
                scales: {
                    x: { title: { display: true, text: 'Time' } },
                    y: { beginAtZero: true, title: { display: true, text: 'Votes' } },
                },
                plugins: { legend: { display: false } },
            },
        });
    }

    // Update Vote Trend
    function updateVoteTrend(newVoteCount) {
        voteData.push({ time: new Date(newVoteCount.created_at), votes: newVoteCount.number_of_votes });
        if (voteData.length > 10) voteData.shift();
        chartInstance.data.labels = voteData.map(d => d.time.toLocaleTimeString());
        chartInstance.data.datasets[0].data = voteData.map(d => d.votes);
        chartInstance.update();
    }

    // Add Vote to History
    function createHistory(votes) {
        votes.forEach(d => {
            const li = document.createElement('li');
            li.textContent = `${d.number_of_votes} votes at ${new Date(d.created_at).toLocaleTimeString()}`;
            voteHistory.prepend(li);
        });
    }

    function addVoteToHistory(votes) {
        const li = document.createElement('li');
        li.textContent = `${votes.number_of_votes} votes at ${new Date().toLocaleTimeString()}`;
        voteHistory.prepend(li);
        if (voteHistory.children.length > 5) voteHistory.removeChild(voteHistory.lastChild);
    }

    // Generate QR Code with Logo
    function generateQRCode() {
        const votingUrl = window.location.href;
        const qrCode = new QRCodeStyling({
            width: 150,
            height: 150,
            data: votingUrl,
            image: '../images/Asset-1.png',
            dotsOptions: { color: "#000", type: "rounded" },
            backgroundOptions: { color: "#fff" },
            imageOptions: { crossOrigin: "anonymous", margin: 1 }
        });

        qrCodeDiv.innerHTML = '';
        qrCode.append(qrCodeDiv);
    }

    // Social Sharing
    function shareOnSocial(platform) {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`Vote for ${selectedCandidate.name} in ${selectedEvent.name}!`);
        let shareUrl;
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
                break;
        }
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    // Render vote bundles for the selected category
    function renderVoteBundles(categoryId) {
        noBundlesMessage.classList.add('hidden');
        voteBundlesContainer.innerHTML = '';

        if (!voteBundles || voteBundles.length === 0) {
            noBundlesMessage.textContent = 'No vote bundles available for this event.';
            noBundlesMessage.classList.remove('hidden');
            return;
        }

        const filteredBundles = voteBundles.filter(bundle => bundle.category_ids.includes(categoryId));
        if (filteredBundles.length === 0) {
            noBundlesMessage.textContent = 'No vote bundles available for the selected category.';
            noBundlesMessage.classList.remove('hidden');
            return;
        }

        filteredBundles.forEach(bundle => {
            const bundleCard = document.createElement('div');
            bundleCard.className = 'bundle-card bg-white border rounded-lg p-4 cursor-pointer';
            bundleCard.dataset.bundleId = bundle.id;

            bundleCard.innerHTML = `
                <div class="flex justify-between items-center">
                    <h3 class="font-semibold">${bundle.name}</h3>
                    <span class="text-vibrant font-bold">GHS ${bundle.price_per_vote.toFixed(2)}</span>
                </div>
                <div class="text-sm text-gray-500 mt-1">${bundle.votes_in_bundle} votes</div>
                <div class="bundle-info mt-2 text-sm text-gray-600">
                    <p>${bundle.description || 'No additional information available.'}</p>
                    ${bundle.features ? `
                        <ul class="list-disc list-inside mt-2">
                            ${bundle.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `;

            bundleCard.addEventListener('click', () => showBundleInfoModal(bundle));
            voteBundlesContainer.appendChild(bundleCard);
        });
    }

    // Initialize bundle select dropdown for the selected category
    function initializeBundleSelect(categoryId) {
        bundleSelect.innerHTML = '';
        const filteredBundles = voteBundles.filter(bundle => bundle.category_ids.includes(categoryId));
        if (filteredBundles.length === 0) {
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = 'No bundles available';
            bundleSelect.appendChild(option);
            return;
        }

        filteredBundles.forEach(bundle => {
            const option = document.createElement('option');
            option.value = bundle.id;
            option.textContent = `${bundle.name} - ${bundle.votes_in_bundle} votes (GHS ${bundle.price_per_vote.toFixed(2)})`;
            bundleSelect.appendChild(option);
        });
    }

    // Handle category change
    async function handleCategoryChange() {
        const categoryId = parseInt(categorySelect.value);
        if (!categoryId) {
            noBundlesMessage.textContent = 'Please select a category to view available vote bundles.';
            noBundlesMessage.classList.remove('hidden');
            voteBundlesContainer.innerHTML = '';
            bundleSelect.innerHTML = '<option disabled>Please select a category</option>';
            selectedBundles.clear();
            renderSelectedBundles();
            updateTotals();
            updateVoteButtonState();
            return;
        }

        try {
            categoryLoading.classList.remove('hidden');
            noBundlesMessage.classList.add('hidden');

            // Clear previous selections
            selectedBundles.clear();
            $(bundleSelect).val(null).trigger('change');
            renderSelectedBundles();
            updateTotals();

            // Render bundles for the selected category
            renderVoteBundles(categoryId);
            initializeBundleSelect(categoryId);
        } catch (error) {
            console.error('Error filtering bundles:', error);
            noBundlesMessage.textContent = 'Error loading bundles for this category. Please try again.';
            noBundlesMessage.classList.remove('hidden');
            voteBundlesContainer.innerHTML = '';
            showNotification('Failed to load bundles for the selected category.', 'error');
        } finally {
            categoryLoading.classList.add('hidden');
        }
    }

    // Handle bundle select change
    function handleBundleSelectChange(e) {
        const selectedIds = Array.from(e.target.selectedOptions).map(option => option.value);

        // Clear previous selections that are no longer selected
        for (const [bundleId] of selectedBundles) {
            if (!selectedIds.includes(bundleId)) {
                selectedBundles.delete(bundleId);
            }
        }

        // Add new selections
        selectedIds.forEach(id => {
            if (!selectedBundles.has(id)) {
                const bundle = voteBundles.find(b => b.id === id);
                if (bundle) {
                    selectedBundles.set(id, { bundle, quantity: 1 });
                }
            }
        });

        renderSelectedBundles();
        updateTotals();
        updateVoteButtonState();
    }

    // Show bundle info modal
    function showBundleInfoModal(bundle) {
        currentBundleInModal = bundle;
        bundleInfoTitle.textContent = bundle.name;

        bundleInfoContent.innerHTML = `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold">Price:</span>
                    <span class="text-vibrant font-bold">GHS ${bundle.price_per_vote.toFixed(2)}</span>
                </div>
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold">Votes:</span>
                    <span>${bundle.votes_in_bundle}</span>
                </div>
                <div class="mb-4">
                    <p class="text-gray-600">${bundle.description || 'No additional information available.'}</p>
                </div>
                ${bundle.features ? `
                    <div class="mb-2">
                        <span class="font-semibold">Features:</span>
                        <ul class="list-disc list-inside mt-1">
                            ${bundle.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
            <div class="mt-4">
                <label class="block text-dark font-medium mb-1">Quantity:</label>
                <input type="number" id="bundle-quantity" class="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary" min="1" value="1">
            </div>
        `;

        bundleInfoModal.classList.remove('hidden');
    }

    // Close bundle info modal
    function closeBundleInfoModal() {
        bundleInfoModal.classList.add('hidden');
        currentBundleInModal = null;
    }

    // Select bundle from modal
    function selectBundleFromModal() {
        if (currentBundleInModal) {
            const quantity = parseInt(document.getElementById('bundle-quantity').value) || 1;
            selectedBundles.set(currentBundleInModal.id, {
                bundle: currentBundleInModal,
                quantity: quantity
            });

            // Update the multi-select to reflect this selection
            const option = Array.from(bundleSelect.options).find(opt => opt.value === currentBundleInModal.id);
            if (option) {
                option.selected = true;
                $(bundleSelect).trigger('change');
            }

            renderSelectedBundles();
            updateTotals();
            updateVoteButtonState();
            closeBundleInfoModal();
        }
    }

    // Render selected bundles
    function renderSelectedBundles() {
        selectedBundlesContainer.innerHTML = '';

        if (selectedBundles.size === 0) {
            return;
        }

        const bundlesList = document.createElement('div');
        bundlesList.className = 'space-y-4';

        selectedBundles.forEach(({ bundle, quantity }, bundleId) => {
            const bundleItem = document.createElement('div');
            bundleItem.className = 'bg-gray-50 p-4 rounded-lg';

            bundleItem.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-medium">${bundle.name}</h4>
                    <button type="button" class="remove-bundle text-red-500 hover:text-red-700" data-bundle-id="${bundleId}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">${bundle.votes_in_bundle} votes × GHS ${bundle.price_per_vote.toFixed(2)}</span>
                    <div class="flex items-center">
                        <button type="button" class="decrease-quantity bg-gray-200 text-gray-700 w-8 h-8 rounded-l-lg flex items-center justify-center hover:bg-gray-300" data-bundle-id="${bundleId}">-</button>
                        <input type="number" class="bundle-quantity w-12 h-8 text-center border-t border-b border-gray-300" value="${quantity}" min="1" data-bundle-id="${bundleId}">
                        <button type="button" class="increase-quantity bg-gray-200 text-gray-700 w-8 h-8 rounded-r-lg flex items-center justify-center hover:bg-gray-300" data-bundle-id="${bundleId}">+</button>
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm">Subtotal:</span>
                    <span class="font-medium">GHS ${(bundle.price_per_vote * quantity).toFixed(2)}</span>
                </div>
                <div class="mt-2">
                    <label class="block text-sm text-gray-600 mb-1">Discount Code (Optional):</label>
                    <div class="flex">
                        <input type="text" class="bundle-discount-code flex-grow p-1 text-sm rounded-l-md border border-gray-300" placeholder="Enter code" data-bundle-id="${bundleId}">
                        <button type="button" class="apply-bundle-discount bg-gray-200 text-dark px-2 py-1 text-sm rounded-r-md hover:bg-gray-300" data-bundle-id="${bundleId}">Apply</button>
                    </div>
                    <p class="bundle-discount-message text-xs mt-1" data-bundle-id="${bundleId}"></p>
                </div>
            `;

            bundlesList.appendChild(bundleItem);
        });

        selectedBundlesContainer.appendChild(bundlesList);

        // Add event listeners for quantity controls and discount codes
        document.querySelectorAll('.remove-bundle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bundleId = e.currentTarget.dataset.bundleId;
                selectedBundles.delete(bundleId);
                const option = Array.from(bundleSelect.options).find(opt => opt.value === bundleId);
                if (option) {
                    option.selected = false;
                    $(bundleSelect).trigger('change');
                }
                renderSelectedBundles();
                updateTotals();
                updateVoteButtonState();
            });
        });

        document.querySelectorAll('.decrease-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bundleId = e.currentTarget.dataset.bundleId;
                const bundleData = selectedBundles.get(bundleId);
                if (bundleData && bundleData.quantity > 1) {
                    bundleData.quantity--;
                    selectedBundles.set(bundleId, bundleData);
                    renderSelectedBundles();
                    updateTotals();
                }
            });
        });

        document.querySelectorAll('.increase-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bundleId = e.currentTarget.dataset.bundleId;
                const bundleData = selectedBundles.get(bundleId);
                if (bundleData) {
                    bundleData.quantity++;
                    selectedBundles.set(bundleId, bundleData);
                    renderSelectedBundles();
                    updateTotals();
                }
            });
        });

        document.querySelectorAll('.bundle-quantity').forEach(input => {
            input.addEventListener('change', (e) => {
                const bundleId = e.currentTarget.dataset.bundleId;
                const quantity = parseInt(e.currentTarget.value) || 1;
                const bundleData = selectedBundles.get(bundleId);
                if (bundleData) {
                    bundleData.quantity = Math.max(1, quantity);
                    selectedBundles.set(bundleId, bundleData);
                    renderSelectedBundles();
                    updateTotals();
                }
            });
        });

        document.querySelectorAll('.apply-bundle-discount').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const bundleId = e.currentTarget.dataset.bundleId;
                const codeInput = document.querySelector(`.bundle-discount-code[data-bundle-id="${bundleId}"]`);
                const messageElement = document.querySelector(`.bundle-discount-message[data-bundle-id="${bundleId}"]`);

                if (!codeInput.value.trim()) {
                    messageElement.textContent = 'Please enter a discount code.';
                    messageElement.className = 'bundle-discount-message text-xs mt-1 text-red-500';
                    return;
                }

                try {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    const response = await fetchData("GET", `${baseUrl}/promo/${codeInput.value.trim()}`);
                    if (response.success && response.promo.discount) {
                        messageElement.textContent = `Discount applied: ${response.promo.discount}% off`;
                        messageElement.className = 'bundle-discount-message text-xs mt-1 text-green-500';
                        const bundleData = selectedBundles.get(bundleId);
                        if (!response.promo.applicable_bundle_ids.includes(bundleId)) {
                            messageElement.textContent = 'Invalid discount code for this bundle.';
                            messageElement.className = 'bundle-discount-message text-xs mt-1 text-red-500';
                        } else if (bundleData) {
                            bundleData.discount = response.promo.discount;
                            selectedBundles.set(bundleId, bundleData);
                            updateTotals();
                        }
                    } else {
                        messageElement.textContent = response.message || 'Invalid discount code.';
                        messageElement.className = 'bundle-discount-message text-xs mt-1 text-red-500';
                    }
                } catch (error) {
                    console.error('Error applying discount:', error);
                    messageElement.textContent = 'Error applying discount code.';
                    messageElement.className = 'bundle-discount-message text-xs mt-1 text-red-500';
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Apply';
                }
            });
        });
    }

    // Update totals
    function updateTotals() {
        let subtotal = 0;
        let totalVotes = 0;
        let discountAmount = 0;

        selectedBundles.forEach(({ bundle, quantity, discount = 0 }) => {
            const bundleSubtotal = bundle.price_per_vote * quantity;
            subtotal += bundleSubtotal;
            discountAmount += bundleSubtotal * (discount / 100);
            totalVotes += bundle.votes_in_bundle * quantity;
        });

        const total = subtotal - discountAmount;

        subtotalElement.textContent = `GHS ${subtotal.toFixed(2)}`;
        discountAmountElement.textContent = `GHS ${discountAmount.toFixed(2)}`;
        totalAmountElement.textContent = `GHS ${total.toFixed(2)}`;

        voteButton.textContent = `Vote Now (${totalVotes} votes)`;
    }

    // Enable/disable vote button
    function updateVoteButtonState() {
        const hasCategory = categorySelect.value !== '';
        const hasBundles = selectedBundles.size > 0;
        const hasEmail = emailInput.value.trim() !== '';
        voteButton.disabled = !(hasCategory && hasBundles && hasEmail);
    }

    // Generate payment reference code
    function generatePaymentReferenceCode(email) {
        if (!email || typeof email !== "string" || !email.trim()) {
            return `ITFY-VOTE-ANON-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const emailPrefix = email.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase();
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        return `ITFY-VOTE-${emailPrefix}-${randomNumber}`;
    }

    // Initialize payment
    async function initializePayment(voteData) {
        try {
            const reference = generatePaymentReferenceCode(voteData.email);
            const total = Array.from(selectedBundles.entries()).reduce((sum, [, { bundle, quantity }]) => {
                return sum + (bundle.price_per_vote * quantity * (1 - ((selectedBundles.get(bundle.id)?.discount || 0) / 100)));
            }, 0);

            const response = await fetchData("POST", `${baseUrl}/payment/initialise-payment`, {
                email: voteData.email,
                amount: total,
                reference,
                callback_url: `${window.location.origin}/pages/process-vote.html?candidate_id=${voteData.candidate_id}&event_id=${voteData.event_id}&category_id=${voteData.category_id}`,
                metadata: voteData
            });

            if (response.success) {
                window.location.href = response.data.authorization_url;
            } else {
                throw new Error(response.message || 'Payment initialization failed');
            }
        } catch (error) {
            console.error('Payment initialization error:', error);
            showNotification('An error occurred while initializing payment.', 'error');
        }
    }

    // Open vote confirmation modal
    function openVoteModal() {
        let totalVotes = 0;
        let summaryHTML = '';

        selectedBundles.forEach(({ bundle, quantity }) => {
            const bundleVotes = bundle.votes_in_bundle * quantity;
            totalVotes += bundleVotes;

            summaryHTML += `
                <div class="mb-2">
                    <div class="flex justify-between">
                        <span>${bundle.name} × ${quantity}</span>
                        <span>${bundleVotes} votes</span>
                    </div>
                </div>
            `;
        });

        summaryHTML += `
            <div class="mt-4 pt-2 border-t border-gray-200">
                <div class="flex justify-between font-bold">
                    <span>Total Votes:</span>
                    <span>${totalVotes} votes</span>
                </div>
                <div class="flex justify-between mt-2">
                    <span>Category:</span>
                    <span>${categorySelect.options[categorySelect.selectedIndex].text}</span>
                </div>
                <div class="flex justify-between mt-2">
                    <span>Email:</span>
                    <span>${emailInput.value}</span>
                </div>
        `;

        if (paymentReference.value.trim()) {
            summaryHTML += `
                <div class="flex justify-between mt-2">
                    <span>Payment Reference:</span>
                    <span>${paymentReference.value}</span>
                </div>
            `;
        }

        summaryHTML += `
            </div>
            <div class="mt-4 bg-blue-50 p-3 rounded-md">
                <p class="text-sm">You are about to cast <strong>${totalVotes} votes</strong> for <strong>${selectedCandidate.name}</strong>.</p>
            </div>
        `;

        voteSummary.innerHTML = summaryHTML;
        voteModal.classList.remove('hidden');
    }

    // Close vote confirmation modal
    function closeVoteModal() {
        voteModal.classList.add('hidden');
    }

    // Handle vote confirmation
    async function confirmVote() {
        try {
            confirmVoteBtn.disabled = true;
            confirmVoteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            const total = Array.from(selectedBundles.entries()).reduce((sum, [, { bundle, quantity }]) => {
                return sum + (bundle.price_per_vote * quantity * (1 - ((selectedBundles.get(bundle.id)?.discount || 0) / 100)));
            }, 0);

            const voteData = {
                candidate_id: selectedCandidate.id,
                event_id: selectedEvent.id,
                category_id: categorySelect.value,
                email: emailInput.value.trim(),
                amount: total,
                payment_reference: paymentReference.value.trim() || null,
                bundles: Array.from(selectedBundles.entries()).map(([bundleId, { quantity }]) => ({
                    bundle_id: bundleId,
                    quantity: quantity,
                    discount_code: document.querySelector(`.bundle-discount-code[data-bundle-id="${bundleId}"]`)?.value.trim() || null
                })),
            };

            if (paymentReference.value.trim()) {
                const response = await fetchData("POST", `${baseUrl}/votes`, voteData);
                if (response.success) {
                    showNotification(`Thank you for voting for ${selectedCandidate.name}!`, 'success');
                    closeVoteModal();
                    selectedBundles.clear();
                    renderSelectedBundles();
                    updateTotals();
                    paymentReference.value = '';
                    emailInput.value = '';
                    $(bundleSelect).val(null).trigger('change');
                    if (response.votes) {
                        const currentVotes = parseInt(candidateVotes.textContent.replace('Votes: ', '')) || 0;
                        const newVotes = currentVotes + response.votes;
                        candidateVotes.textContent = `Votes: ${newVotes}`;
                    }
                } else {
                    showNotification(`Failed to submit vote: ${response.message || "Unknown error"}`, 'error');
                }
            } else {
                await initializePayment(voteData);
                closeVoteModal();
            }
        } catch (error) {
            console.error('Vote submission error:', error);
            showNotification('An error occurred while processing your vote.', 'error');
        } finally {
            confirmVoteBtn.disabled = false;
            confirmVoteBtn.innerHTML = 'Confirm Vote';
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    // Event listeners
    categorySelect.addEventListener('change', () => {
        handleCategoryChange();
        updateVoteButtonState();
    });
    paymentReference.addEventListener('input', updateVoteButtonState);
    emailInput.addEventListener('input', updateVoteButtonState);
    voteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        openVoteModal();
    });
    confirmVoteBtn.addEventListener('click', confirmVote);
    cancelVoteBtn.addEventListener('click', closeVoteModal);
    closeBundleInfoBtn.addEventListener('click', closeBundleInfoModal);
    selectBundleBtn.addEventListener('click', selectBundleFromModal);
    window.addEventListener('click', (event) => {
        if (event.target === voteModal) closeVoteModal();
        if (event.target === bundleInfoModal) closeBundleInfoModal();
    });
    shareFacebook.addEventListener('click', () => shareOnSocial('facebook'));
    shareTwitter.addEventListener('click', () => shareOnSocial('twitter'));
    shareLinkedin.addEventListener('click', () => shareOnSocial('linkedin'));

    // Initialize the page
    await loadData();
});