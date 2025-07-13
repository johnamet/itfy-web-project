import { baseUrl } from "./utils/constants.js";
import { fetchData } from "./utils/fetchData.js";
import emptyNotice from "./utils/components/emptyNotice.js";

document.addEventListener("DOMContentLoaded", async () => {
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");
    const voteStats = document.getElementById("vote-stats");
    const bundlesTableBody = document.getElementById("bundlesTableBody");
    const promosTableBody = document.getElementById("promosTableBody");
    const createBundleBtn = document.getElementById("createBundleBtn");
    const createPromoBtn = document.getElementById("createPromoBtn");
    const bundleModal = document.getElementById("bundleModal");
    const bundleModalTitle = document.getElementById("bundleModalTitle");
    const bundleForm = document.getElementById("bundleForm");
    const closeBundleModal = document.getElementById("closeBundleModal");
    const cancelBundleBtn = document.getElementById("cancelBundleBtn");
    const bundleEvent = document.getElementById("bundleEvent");
    const bundleCategories = document.getElementById("bundleCategories");
    const promoModal = document.getElementById("promoModal");
    const promoModalTitle = document.getElementById("promoModalTitle");
    const promoForm = document.getElementById("promoForm");
    const closePromoModal = document.getElementById("closePromoModal");
    const cancelPromoBtn = document.getElementById("cancelPromoBtn");
    const promoDetailsModal = document.getElementById("promoDetailsModal");
    const promoDetailsContent = document.getElementById("promoDetailsContent");
    const closePromoDetailsModal = document.getElementById("closePromoDetailsModal");
    const eventSelect = document.getElementById("eventSelect");
    const categorySelect = document.getElementById("categorySelect");
    const closeNotificationBtn = document.getElementById("closeNotification");

    let eventVotesChartInstance = null;
    let categoryVotesChartInstance = null;
    let candidateVotesChartInstance = null;
    let voteGrowthChartInstance = null;
    let editingBundleId = null;
    let editingPromoCode = null;

    // Show Notification
    function showNotification(message, type) {
        notificationMessage.textContent = message;
        notification.classList.remove("hidden");
        notification.classList.add(type === "success" ? "bg-green-600" : "bg-red-600", "animate-fade-in");
        setTimeout(() => {
            notification.classList.add("hidden");
            notification.classList.remove("bg-green-600", "bg-red-600", "animate-fade-in");
        }, 5000);
    }

    // Close Notification
    closeNotificationBtn.addEventListener("click", () => {
        notification.classList.add("hidden");
        notification.classList.remove("bg-green-600", "bg-red-600", "animate-fade-in");
    });

    // Fetch Vote Stats
    async function fetchVoteStats() {
        try {
            loading.classList.remove("hidden");
            voteStats.classList.add("hidden");
            error.classList.add("hidden");

            const response = await fetchData("GET", `${baseUrl}/votes/stats`);
            if (response.success) {
                await renderVoteStats(response.stats);
                loading.classList.add("hidden");
                voteStats.classList.remove("hidden");
            } else {
                throw new Error(response.error || "Failed to fetch vote stats");
            }
        } catch (err) {
            loading.classList.add("hidden");
            voteStats.classList.add("hidden");
            error.classList.remove("hidden");
            error.innerHTML = emptyNotice({
                message: "Error Loading Vote Stats",
                subMessage: "Please try again later."
            });
            console.error("Error fetching vote stats:", err);
        }
    }

    // Populate Event Dropdown
    async function populateEventDropdown(stats) {
        eventSelect.innerHTML = '<option value="">Select Event</option>';
        stats.forEach(event => {
            const option = document.createElement("option");
            option.value = event.event_id;
            option.textContent = event.event_name;
            eventSelect.appendChild(option);
        });
    }

    // Populate Category Dropdown
    async function populateCategoryDropdown(eventId) {
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        if (!eventId) return;
        try {
            const response = await fetchData("GET", `${baseUrl}/categories?eventId=${eventId}`);
            const categories = response.categories || [];
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }

    // Render Vote Stats
    async function renderVoteStats(stats) {
        // Event Votes Chart (Bar)
        const eventData = stats.map(event => ({
            name: event.event_name,
            votes: event.categories.reduce((sum, cat) => sum + cat.candidates.reduce((cSum, c) => cSum + c.votes, 0), 0)
        }));

        const ctxEvent = document.getElementById("eventVotesChart").getContext("2d");
        if (eventVotesChartInstance) eventVotesChartInstance.destroy();

        eventVotesChartInstance = new Chart(ctxEvent, {
            type: 'bar',
            data: {
                labels: eventData.map(e => e.name),
                datasets: [{
                    label: 'Total Votes',
                    data: eventData.map(e => e.votes),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#1E3A8A',
                    borderWidth: 1,
                }],
            },
            options: {
                maintainAspectRatio: false,
                layout: { padding: 20 },
                animation: { duration: 1000, easing: 'easeOutQuart' },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: '#E5E7EB' }, 
                        title: { display: true, text: 'Votes', font: { family: 'Inter', size: 12 } },
                        ticks: { font: { family: 'Inter', size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { family: 'Inter', size: 10 },
                            callback: function(value, index) {
                                const name = this.getLabelForValue(value);
                                return name.length > 8 ? name.substring(0, 8) + '...' : name;
                            }
                        }
                    },
                },
                plugins: { legend: { display: false } },
            },
        });

        // Populate Event Dropdown for Category Chart
        await populateEventDropdown(stats);

        // Vote Growth Chart (Line)
        const voteGrowthData = await fetchVoteGrowthData();
        const ctxGrowth = document.getElementById("voteGrowthChart").getContext("2d");
        if (voteGrowthChartInstance) voteGrowthChartInstance.destroy();

        voteGrowthChartInstance = new Chart(ctxGrowth, {
            type: 'line',
            data: {
                labels: voteGrowthData.labels,
                datasets: [{
                    label: 'Votes Over Time',
                    data: voteGrowthData.votes,
                    borderColor: '#1E3A8A',
                    backgroundColor: 'rgba(30, 58, 138, 0.2)',
                    fill: true,
                    tension: 0.4,
                }],
            },
            options: {
                maintainAspectRatio: false,
                layout: { padding: 20 },
                animation: { duration: 1000, easing: 'easeOutQuart' },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: '#E5E7EB' }, 
                        title: { display: true, text: 'Votes', font: { family: 'Inter', size: 12 } },
                        ticks: { font: { family: 'Inter', size: 10 } }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 10 } }
                    },
                },
                plugins: { 
                    legend: { 
                        display: true, 
                        position: 'top', 
                        labels: { font: { family: 'Inter', size: 12 } }
                    }
                },
            },
        });
    }

    // Render Category Votes Chart
    async function renderCategoryVotesChart(eventId) {
        if (!eventId) {
            if (categoryVotesChartInstance) categoryVotesChartInstance.destroy();
            return;
        }

        try {
            const response = await fetchData("GET", `${baseUrl}/votes/stats`);
            const event = response.stats.find(e => e.event_id === eventId);
            if (!event) throw new Error("Event not found");

            const categoryData = event.categories.map(cat => ({
                name: cat.category_name,
                votes: cat.candidates.reduce((sum, c) => sum + c.votes, 0)
            }));

            const ctxCategory = document.getElementById("categoryVotesChart").getContext("2d");
            if (categoryVotesChartInstance) categoryVotesChartInstance.destroy();

            categoryVotesChartInstance = new Chart(ctxCategory, {
                type: 'pie',
                data: {
                    labels: categoryData.map(c => c.name),
                    datasets: [{
                        data: categoryData.map(c => c.votes),
                        backgroundColor: ['#10B981', '#1E3A8A', '#D4AF37', '#EF4444', '#8B5CF6'],
                        borderColor: '#F9FAFB',
                        borderWidth: 2,
                    }],
                },
                options: {
                    maintainAspectRatio: false,
                    layout: { padding: 20 },
                    animation: { duration: 1000, easing: 'easeOutQuart' },
                    plugins: {
                        legend: { 
                            position: 'right',
                            labels: { 
                                font: { family: 'Inter', size: 10 }, 
                                padding: 15,
                                boxWidth: 10
                            }
                        },
                    },
                },
            });

            await populateCategoryDropdown(eventId);
        } catch (err) {
            showNotification("Error loading category votes.", "error");
            console.error("Error rendering category votes:", err);
        }
    }

    // Render Candidate Votes Chart
    async function renderCandidateVotesChart(eventId, categoryId) {
        if (!eventId || !categoryId) {
            if (candidateVotesChartInstance) candidateVotesChartInstance.destroy();
            return;
        }

        try {
            const response = await fetchData("GET", `${baseUrl}/votes/stats`);
            const event = response.stats.find(e => e.event_id == eventId);
            if (!event) throw new Error("Event not found");

            const category = event.categories.find(c => c.category_id == categoryId);
            if (!category) throw new Error("Category not found");

            const candidateData = category.candidates.map(c => ({
                name: c.candidate_name,
                votes: c.votes
            }));

            const ctxCandidate = document.getElementById("candidateVotesChart").getContext("2d");
            if (candidateVotesChartInstance) candidateVotesChartInstance.destroy();

            candidateVotesChartInstance = new Chart(ctxCandidate, {
                type: 'bar',
                data: {
                    labels: candidateData.map(c => c.name),
                    datasets: [{
                        label: 'Votes',
                        data: candidateData.map(c => c.votes),
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: '#1E3A8A',
                        borderWidth: 1,
                    }],
                },
                options: {
                    maintainAspectRatio: false,
                    layout: { padding: 20 },
                    animation: { duration: 1000, easing: 'easeOutQuart' },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            grid: { color: '#E5E7EB' }, 
                            title: { display: true, text: 'Votes', font: { family: 'Inter', size: 12 } },
                            ticks: { font: { family: 'Inter', size: 10 } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { family: 'Inter', size: 10 },
                                callback: function(value, index) {
                                    const name = this.getLabelForValue(value);
                                    return name.length > 8 ? name.substring(0, 8) + '...' : name;
                                }
                            }
                        },
                    },
                    plugins: { legend: { display: false } },
                },
            });
        } catch (err) {
            showNotification("Error loading candidate votes.", "error");
            console.error("Error rendering candidate votes:", err);
        }
    }

    // Fetch Vote Growth Data
    async function fetchVoteGrowthData() {
        try {
            const response = await fetchData("GET", `${baseUrl}/votes`);
            if (!response.success) {
                throw new Error(response.error || "Failed to fetch votes");
            }

            const votes = response.votes || [];
            const today = new Date();
            const labels = [];
            const voteCounts = {};
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);

            votes.forEach((vote) => {
                const voteDate = new Date(vote.created_at);
                if (voteDate >= thirtyDaysAgo) {
                    const dateStr = voteDate.toLocaleDateString();
                    labels.push(dateStr);
                    voteCounts[dateStr] = (voteCounts[dateStr] || 0) + vote.number_of_votes;
                }
            });

            const uniqueLabels = [...new Set(labels)].sort((a, b) => new Date(a) - new Date(b));
            const votesData = uniqueLabels.map(date => voteCounts[date] || 0);

            return { labels: uniqueLabels, votes: votesData };
        } catch (err) {
            showNotification("Error fetching vote growth data.", "error");
            console.error("Error fetching vote growth data:", err);
            return { labels: [], votes: [] };
        }
    }

    // Fetch Events
    async function fetchEvents() {
        try {
            const response = await fetchData("GET", `${baseUrl}/events`);
            const events = response.events || [];
            bundleEvent.innerHTML = '<option value="">Select Event</option>';
            events.forEach(event => {
                const option = document.createElement("option");
                option.value = event.id;
                option.textContent = event.name;
                bundleEvent.appendChild(option);
            });
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    }

    // Fetch Categories
    async function fetchCategories(eventId) {
        try {
            const response = await fetchData("GET", `${baseUrl}/categories?eventId=${eventId}`);
            const categories = response.categories || [];
            bundleCategories.innerHTML = '';
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                bundleCategories.appendChild(option);
            });
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }

    // Fetch Vote Bundles
    async function fetchVoteBundles() {
        try {
            const response = await fetchData("GET", `${baseUrl}/bundles`);
            if (response.success) {
                renderVoteBundles(response.bundles);
                return response.bundles;
            } else {
                throw new Error(response.error || "Failed to fetch vote bundles");
            }
        } catch (err) {
            showNotification("Error fetching vote bundles.", "error");
            console.error("Error fetching vote bundles:", err);
            return [];
        }
    }

    // Render Vote Bundles
    async function renderVoteBundles(bundles) {
        bundlesTableBody.innerHTML = "";
        if (bundles.length === 0) {
            bundlesTableBody.innerHTML = emptyNotice({
                message: "No Vote Bundles Found",
                subMessage: "Create a new bundle to get started."
            });
            return;
        }

        for (const [index, bundle] of bundles.entries()) {
            const eventResponse = await fetchData("GET", `${baseUrl}/events/${bundle.event_id}`);
            const eventName = eventResponse.event?.name || "Unknown";

            const categoryNames = [];
            for (const catId of bundle.category_ids) {
                const catResponse = await fetchData("GET", `${baseUrl}/categories/${catId}`);
                categoryNames.push(catResponse.category?.name || "Unknown");
            }

            const row = document.createElement("tr");
            row.className = "hover:bg-platinum transition duration-200";
            row.innerHTML = `
                <td class="px-6 py-3 whitespace-nowrap text-luxury text-sm font-medium">${bundle.name}</td>
                <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">${eventName}</td>
                <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">${categoryNames.join(", ")}</td>
                <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">${bundle.votes_in_bundle}</td>
                <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">$${bundle.price_per_vote.toFixed(2)}</td>
                <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">${bundle.discount}%</td>
                <td class="px-6 py-3 whitespace-nowrap text-sm">${bundle.active ? '<span class="text-green-600">Active</span>' : '<span class="text-red-600">Inactive</span>'}</td>
                <td class="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button title="Edit Bundle" class="text-primary hover:text-gold mr-3 edit-bundle-btn" data-id="${bundle.id}"><i class="fas fa-edit text-lg"></i></button>
                    <button title="Delete Bundle" class="text-red-600 hover:text-red-800 delete-bundle-btn" data-id="${bundle.id}"><i class="fas fa-trash text-lg"></i></button>
                </td>
            `;
            row.style.animation = `slideIn 0.5s ease-out ${index * 0.1}s both`;
            bundlesTableBody.appendChild(row);
        }
    }

    // Fetch Promo Codes
    async function fetchPromoCodes() {
        try {
            const response = await fetchData("GET", `${baseUrl}/promo`);
            if (response.success) {
                renderPromoCodes(response.promos);
            } else {
                throw new Error(response.error || "Failed to fetch promo codes");
            }
        } catch (err) {
            showNotification("Error fetching promo codes.", "error");
            console.error("Error fetching promo codes:", err);
        }
    }

    // Render Promo Codes
    function renderPromoCodes(promos) {
        promosTableBody.innerHTML = "";
        if (promos.length === 0) {
            promosTableBody.innerHTML = emptyNotice({
                message: "No Promo Codes Found",
                subMessage: "Create a new promo code to get started."
            });
            return;
        }

        promos.forEach((promo, index) => {
            const row = document.createElement("tr");
            row.className = "hover:bg-platinum transition duration-200";
            row.innerHTML = `
                <td class="px-6 py-3 whitespace-nowrap text-luxury text-sm font-medium">${promo.code}</td>
                <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">${promo.discount}%</td>
                <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">${promo.expiration_date ? new Date(promo.expiration_date).toLocaleString() : 'N/A'}</td>
                <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">${promo.description || "N/A"}</td>
                <td class="px-6 py-3 whitespace-nowrap text-sm">${promo.active ? '<span class="text-green-600">Active</span>' : '<span class="text-red-600">Inactive</span>'}</td>
                <td class="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button title="Edit Promo" class="text-primary hover:text-gold mr-3 edit-promo-btn" data-code="${promo.code}"><i class="fas fa-edit text-lg"></i></button>
                    <button title="View Details" class="text-primary hover:text-gold mr-3 view-promo-btn" data-code="${promo.code}"><i class="fas fa-eye text-lg"></i></button>
                    <button title="${promo.active ? 'Deactivate' : 'Expired'}" class="text-red-600 hover:text-red-800 deactivate-promo-btn" data-code="${promo.code}"><i class="fas fa-power-off text-lg"></i></button>
                </td>
            `;
            row.style.animation = `slideIn 0.5s ease-out ${index * 0.1}s both`;
            promosTableBody.appendChild(row);
        });
    }

    // Fetch Bundles for Promo Modal
    async function populateBundleOptions(selectElement, selectedIds = []) {
        const bundles = await fetchVoteBundles();
        selectElement.innerHTML = '';
        bundles.forEach(bundle => {
            const option = document.createElement("option");
            option.value = bundle.id;
            option.textContent = bundle.name;
            if (selectedIds.includes(bundle.id)) option.selected = true;
            selectElement.appendChild(option);
        });
    }

    // Open Bundle Modal
    function openBundleModal(isEdit = false, bundle = {}) {
        bundleModalTitle.textContent = isEdit ? "Edit Vote Bundle" : "Create Vote Bundle";
        bundleForm.reset();
        bundleEvent.value = bundle.event_id || "";
        bundleCategories.innerHTML = "";
        if (bundle.event_id) fetchCategories(bundle.event_id);
        bundleForm.name.value = bundle.name || "";
        bundleForm.votes_in_bundle.value = bundle.votes_in_bundle || "";
        bundleForm.price_per_vote.value = bundle.price_per_vote || "";
        bundleForm.discount.value = bundle.discount || "";
        bundleForm.promo_code.value = bundle.promo_code || "";
        bundleForm.active.checked = bundle.active !== undefined ? bundle.active : true;
        if (bundle.category_ids) {
            setTimeout(() => {
                bundle.category_ids.forEach(id => {
                    const option = bundleCategories.querySelector(`option[value="${id}"]`);
                    if (option) option.selected = true;
                });
            }, 500);
        }
        editingBundleId = isEdit ? bundle.id : null;
        bundleModal.classList.remove("hidden");
    }

    // Close Bundle Modal
    function closeBundleModalFn() {
        bundleModal.classList.add("hidden");
        editingBundleId = null;
    }

    // Open Promo Modal
    async function openPromoModal(isEdit = false, promo = {}) {
        promoModalTitle.textContent = isEdit ? "Edit Promo Code" : "Create Promo Code";
        promoForm.reset();
        promoForm.code.value = promo.code || "";
        promoForm.discount.value = promo.discount || "";
        promoForm.expiration_date.value = promo.expiration_date ? new Date(promo.expiration_date).toISOString().slice(0, 16) : "";
        promoForm.description.value = promo.description || "";
        promoForm.usage_limit.value = promo.usage_limit || "";
        await populateBundleOptions(document.getElementById("applicableBundles"), promo.applicable_bundle_ids || []);
        editingPromoCode = isEdit ? promo.code : null;
        promoModal.classList.remove("hidden");
    }

    // Close Promo Modal
    function closePromoModalFn() {
        promoModal.classList.add("hidden");
        editingPromoCode = null;
    }

    // Open Promo Details Modal
    async function openPromoDetailsModal(code) {
        try {
            const response = await fetchData("GET", `${baseUrl}/promo/${code}`);
            if (response.success) {
                const promo = response.promo;
                let bundleNames = "None";
                if (promo.applicable_bundle_ids && promo.applicable_bundle_ids.length > 0) {
                    const bundlePromises = promo.applicable_bundle_ids.map(async (id) => {
                        const bundleResponse = await fetchData("GET", `${baseUrl}/votes/bundles/${id}`);
                        return bundleResponse.success ? bundleResponse.bundle.name : "Unknown";
                    });
                    bundleNames = (await Promise.all(bundlePromises)).join(", ");
                }

                promoDetailsContent.innerHTML = `
                    <p class="flex items-center"><i class="fas fa-tag mr-2 text-gold"></i><strong class="font-semibold">Code:</strong> <span class="ml-2">${promo.code}</span></p>
                    <p class="flex items-center"><i class="fas fa-percent mr-2 text-gold"></i><strong class="font-semibold">Discount:</strong> <span class="ml-2">${promo.discount}%</span></p>
                    <p class="flex items-center"><i class="fas fa-calendar-times mr-2 text-gold"></i><strong class="font-semibold">Expires At:</strong> <span class="ml-2">${promo.expiration_date ? new Date(promo.expiration_date).toLocaleString() : 'N/A'}</span></p>
                    <p class="flex items-center"><i class="fas fa-info-circle mr-2 text-gold"></i><strong class="font-semibold">Description:</strong> <span class="ml-2">${promo.description || 'N/A'}</span></p>
                    <p class="flex items-center"><i class="fas fa-boxes mr-2 text-gold"></i><strong class="font-semibold">Applicable Bundles:</strong> <span class="ml-2">${bundleNames}</span></p>
                    <p class="flex items-center"><i class="fas fa-limit mr-2 text-gold"></i><strong class="font-semibold">Usage Limit:</strong> <span class="ml-2">${promo.usage_limit || 'Unlimited'}</span></p>
                    <p class="flex items-center"><i class="fas fa-users mr-2 text-gold"></i><strong class="font-semibold">Used By:</strong> <span class="ml-2">${promo.used_by?.length || 0} users</span></p>
                    <p class="flex items-center"><i class="fas fa-check-circle mr-2 text-gold"></i><strong class="font-semibold">Status:</strong> <span class="ml-2 ${promo.active ? 'text-green-600' : 'text-red-600'}">${promo.active ? 'Active' : 'Inactive'}</span></p>
                `;
                promoDetailsModal.classList.remove("hidden");
            } else {
                showNotification("Failed to fetch promo code details.", "error");
            }
        } catch (err) {
            showNotification("Error fetching promo code details.", "error");
            console.error("Error fetching promo code:", err);
        }
    }

    // Close Promo Details Modal
    function closePromoDetailsModalFn() {
        promoDetailsModal.classList.add("hidden");
    }

    // Handle Bundle Form Submission
    bundleForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(bundleForm);
        const bundleData = Object.fromEntries(formData.entries());
        bundleData.category_ids = Array.from(bundleCategories.selectedOptions).map(opt => opt.value);
        bundleData.votes_in_bundle = parseInt(bundleData.votes_in_bundle);
        bundleData.price_per_vote = parseFloat(bundleData.price_per_vote);
        bundleData.discount = parseInt(bundleData.discount) || 0;
        bundleData.active = bundleData.active === "on";

        try {
            let response;
            if (editingBundleId) {
                response = await fetchData("PUT", `${baseUrl}/bundles/${editingBundleId}`, bundleData);
            } else {
                response = await fetchData("POST", `${baseUrl}/bundles`, bundleData);
            }
            if (response.success) {
                showNotification(`Vote bundle ${editingBundleId ? "updated" : "created"} successfully!`, "success");
                closeBundleModalFn();
                await fetchVoteBundles();
            } else {
                throw new Error(response.error || "Failed to save vote bundle");
            }
        } catch (err) {
            showNotification("Error saving vote bundle.", "error");
            console.error("Error saving vote bundle:", err);
        }
    });

    // Handle Promo Form Submission
    promoForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(promoForm);
        const promoData = Object.fromEntries(formData.entries());
        promoData.discount = parseInt(promoData.discount);
        promoData.expiration_date = new Date(promoData.expiration_date).toISOString();
        promoData.usage_limit = promoData.usage_limit ? parseInt(promoData.usage_limit) : null;
        promoData.applicable_bundle_ids = Array.from(document.getElementById("applicableBundles").selectedOptions).map(opt => opt.value);
        if (!promoData.applicable_bundle_ids.length) promoData.applicable_bundle_ids = [];

        try {
            let response;
            if (editingPromoCode) {
                response = await fetchData("PUT", `${baseUrl}/promo/${editingPromoCode}`, promoData);
            } else {
                response = await fetchData("POST", `${baseUrl}/promo`, promoData);
            }
            if (response.success) {
                showNotification(`Promo code ${editingPromoCode ? "updated" : "created"} successfully!`, "success");
                closePromoModalFn();
                fetchPromoCodes();
            } else {
                showNotification(response.error || "Failed to save promo code", "error");
            }
        } catch (err) {
            showNotification("Error saving promo code: " + err.message, "error");
            console.error("Error saving promo code:", err);
        }
    });

    // Event Listeners
    createBundleBtn.addEventListener("click", () => openBundleModal());
    createPromoBtn.addEventListener("click", () => openPromoModal());
    closeBundleModal.addEventListener("click", closeBundleModalFn);
    cancelBundleBtn.addEventListener("click", closeBundleModalFn);
    closePromoModal.addEventListener("click", closePromoModalFn);
    cancelPromoBtn.addEventListener("click", closePromoModalFn);
    closePromoDetailsModal.addEventListener("click", closePromoDetailsModalFn);
    document.getElementById("refreshBundlesBtn").addEventListener("click", fetchVoteBundles);
    document.getElementById("refreshPromosBtn").addEventListener("click", fetchPromoCodes);

    bundleEvent.addEventListener("change", (e) => {
        const eventId = e.target.value;
        if (eventId) fetchCategories(eventId);
    });

    eventSelect.addEventListener("change", (e) => {
        const eventId = e.target.value;
        renderCategoryVotesChart(eventId);
        renderCandidateVotesChart(eventId, categorySelect.value);
    });

    categorySelect.addEventListener("change", (e) => {
        const categoryId = e.target.value;
        renderCandidateVotesChart(eventSelect.value, categoryId);
    });

    // Handle Bundle Actions
    bundlesTableBody.addEventListener("click", async (e) => {
        const target = e.target.closest(".edit-bundle-btn, .delete-bundle-btn");
        if (!target) return;

        const bundleId = target.getAttribute("data-id");

        if (target.classList.contains("edit-bundle-btn")) {
            try {
                const response = await fetchData("GET", `${baseUrl}/bundles/${bundleId}`);
                if (response.success) {
                    openBundleModal(true, response.bundle);
                } else {
                    showNotification("Failed to fetch bundle details.", "error");
                }
            } catch (err) {
                showNotification("Error fetching bundle.", "error");
            }
        } else if (target.classList.contains("delete-bundle-btn")) {
            if (confirm("Are you sure you want to delete this vote bundle?")) {
                try {
                    const response = await fetchData("DELETE", `${baseUrl}/votes/bundles/${bundleId}`);
                    if (response.success) {
                        showNotification("Vote bundle deleted successfully!", "success");
                        await fetchVoteBundles();
                    } else {
                        showNotification("Failed to delete vote bundle.", "error");
                    }
                } catch (err) {
                    showNotification("Error deleting vote bundle.", "error");
                }
            }
        }
    });

    // Handle Promo Actions
    promosTableBody.addEventListener("click", async (e) => {
        const target = e.target.closest(".edit-promo-btn, .view-promo-btn, .deactivate-promo-btn");
        if (!target) return;

        const code = target.getAttribute("data-code");

        if (target.classList.contains("edit-promo-btn")) {
            try {
                const response = await fetchData("GET", `${baseUrl}/promo/${code}`);
                if (response.success) {
                    openPromoModal(true, response.promo);
                } else {
                    showNotification("Failed to fetch promo code details.", "error");
                }
            } catch (err) {
                showNotification("Error fetching promo code.", "error");
            }
        } else if (target.classList.contains("view-promo-btn")) {
            openPromoDetailsModal(code);
        } else if (target.classList.contains("deactivate-promo-btn")) {
            if (confirm("Are you sure you want to deactivate this promo code?")) {
                try {
                    const response = await fetchData("POST", `${baseUrl}/promo/deactivate/${code}`);
                    if (response.success) {
                        showNotification("Promo code deactivated successfully!", "success");
                        fetchPromoCodes();
                    } else {
                        showNotification("Failed to deactivate promo code.", "error");
                    }
                } catch (err) {
                    showNotification("Error deactivating promo code.", "error");
                }
            }
        }
    });

    // Initial Load
    await Promise.all([
        fetchVoteStats(),
        fetchEvents(),
        fetchVoteBundles(),
        fetchPromoCodes()
    ]);
});