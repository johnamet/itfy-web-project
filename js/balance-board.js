import { baseUrl } from "./utils/constants.js";
import { fetchData } from "./utils/fetchData.js";

document.addEventListener("DOMContentLoaded", async () => {
    // DOM Elements
    const eventSelector = document.getElementById("eventSelector");
    const summaryContainer = document.getElementById("summary-container");
    const eventsList = document.getElementById("events-list");
    const eventDetailsContainer = document.getElementById("event-details-container");
    const totalBalanceAmount = document.getElementById("total-balance-amount");
    const totalTransactionsCount = document.getElementById("total-transactions-count");
    const eventBalanceAmount = document.getElementById("event-balance-amount");
    const eventTransactionsCount = document.getElementById("event-transactions-count");
    const categoryCostsList = document.getElementById("category-costs-list");
    const paymentListContainer = document.getElementById("payment-list-container");
    const paymentDetailsContainer = document.getElementById("payment-details-container");
    const voteBundleDetailsContainer = document.getElementById("vote-bundle-details-container");
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
    const closeNotification = document.getElementById("closeNotification");
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");

    // Chart Instances
    let balanceChartInstance = null;
    let transactionChartInstance = null;
    let categoryDistributionChartInstance = null;

    // Initialize Socket.IO
    const socket = io(baseUrl);

    // Notification Handlers
    closeNotification.addEventListener("click", () => {
        notification.classList.add("hidden");
        notification.classList.remove("bg-green-600", "bg-red-600", "animate-fade-in");
    });

    function showNotification(message, type) {
        notificationMessage.textContent = message;
        notification.classList.remove("hidden");
        notification.classList.add(type === "success" ? "bg-green-600" : "bg-red-600", "animate-fade-in");
        setTimeout(() => {
            notification.classList.add("hidden");
            notification.classList.remove("bg-green-600", "bg-red-600", "animate-fade-in");
        }, 5000);
    }

    // Error and Empty Notice Handlers
    function showError(message, retryFn) {
        error.innerHTML = `
            <p class="text-lg font-semibold text-red-600">${message}</p>
            <p class="text-sm text-gray-600">Please try again later.</p>
            ${retryFn ? `<button id="retryBtn" class="mt-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600">Retry</button>` : ""}
        `;
        error.classList.remove("hidden");
        if (retryFn) {
            document.getElementById("retryBtn").addEventListener("click", async () => {
                error.classList.add("hidden");
                await retryFn();
            });
        }
    }

    function showEmptyNotice(message, subMessage) {
        error.innerHTML = `
            <p class="text-lg font-semibold text-gray-600">${message}</p>
            <p class="text-sm text-gray-500">${subMessage}</p>
        `;
        error.classList.remove("hidden");
    }

    // Fetch Events and Initial Summary
    async function fetchEventsAndSummary() {
        try {
            loading.classList.remove("hidden");
            summaryContainer.classList.add("hidden");
            error.classList.add("hidden");

            const eventsResponse = await fetchData("GET", `${baseUrl}/events`);
            const events = eventsResponse.events || [];
            const balanceData = await Promise.all(events.map(event =>
                fetchData("GET", `${baseUrl}/balance/aggregate?event_id=${event.id}`)
            ));

            renderEventsAndSummary(events, balanceData);

            loading.classList.add("hidden");
            summaryContainer.classList.remove("hidden");
        } catch (err) {
            loading.classList.add("hidden");
            summaryContainer.classList.add("hidden");
            showError("Error Loading Balance Data", fetchEventsAndSummary);
            console.error("Error fetching events or balance:", err);
        }
    }

    // Render Events and Summary Chart
    function renderEventsAndSummary(events, balanceData) {
        eventsList.innerHTML = "";
        eventSelector.innerHTML = '<option value="">Select an Event</option>';

        if (events.length === 0) {
            eventsList.innerHTML = showEmptyNotice("No Events Found", "There are no events available.");
            renderBalanceChart([]);
            return;
        }

        let totalBalance = 0;
        let totalTransactions = 0;
        events.forEach((event, index) => {
            const balance = (balanceData[index]?.aggregate?.totalAmount || 0) / 100;
            const transactionsCount = balanceData[index]?.aggregate?.transactionCount || 0;
            totalBalance += balance;
            totalTransactions += transactionsCount;
            const card = document.createElement("div");
            card.className = "bg-white p-6 rounded-lg shadow-sm animate-slide-in hover:bg-platinum transition-all duration-200";
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <h3 class="text-lg font-semibold text-luxury mb-2">${event.name}</h3>
                <p class="text-sm text-gray-600 mb-2">Status: ${event.status || 'Unknown'}</p>
                <p class="text-primary font-semibold mb-2">Balance: GHS${balance.toFixed(2)}</p>
                <p class="text-sm text-gray-600 mb-4">Transactions: ${transactionsCount}</p>
                <button class="btn bg-primary text-white rounded-full px-4 py-2 hover:bg-secondary view-details" data-id="${event.id}">View Details</button>
            `;
            eventsList.appendChild(card);

            const option = document.createElement("option");
            option.value = event.id;
            option.textContent = event.name;
            eventSelector.appendChild(option);
        });

        totalBalanceAmount.textContent = `GHS${totalBalance.toFixed(2)}`;
        totalTransactionsCount.textContent = `${totalTransactions} Transactions`;
        renderBalanceChart(events.map((e, i) => ({
            name: e.name,
            balance: (balanceData[i]?.aggregate?.totalAmount || 0) / 100,
            transactions: balanceData[i]?.aggregate?.transactionCount || 0
        })));
    }

    // Render Balance Chart
    function renderBalanceChart(eventBalances) {
        const ctx = document.getElementById("balanceChart").getContext("2d");
        if (balanceChartInstance) balanceChartInstance.destroy();

        balanceChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: eventBalances.map(e => e.name),
                datasets: [
                    {
                        label: 'Balance (GHS)',
                        data: eventBalances.map(e => e.balance),
                        backgroundColor: '#10B981',
                        borderColor: '#1E3A8A',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Transactions',
                        data: eventBalances.map(e => e.transactions),
                        backgroundColor: '#D4AF37',
                        borderColor: '#1E3A8A',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ],
            },
            options: {
                maintainAspectRatio: false,
                layout: { padding: 30 },
                animation: { duration: 1500, easing: 'easeOutQuart' },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#E5E7EB' },
                        title: { display: true, text: 'Balance (GHS)', font: { family: 'Inter', size: 14 } },
                        ticks: { font: { family: 'Inter', size: 12 } }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: { display: false },
                        title: { display: true, text: 'Transactions', font: { family: 'Inter', size: 14 } },
                        ticks: { font: { family: 'Inter', size: 12 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 12 } }
                    }
                },
                plugins: {
                    legend: { display: true, labels: { font: { family: 'Inter', size: 12 } } },
                    tooltip: {
                        backgroundColor: '#1F2937',
                        titleFont: { family: 'Inter', size: 14 },
                        bodyFont: { family: 'Inter', size: 12 }
                    }
                }
            }
        });
    }

    // Fetch Event Details
    async function fetchEventDetails(eventId) {
        try {
            loading.classList.remove("hidden");
            eventDetailsContainer.classList.add("hidden");
            paymentListContainer.classList.add("hidden");
            paymentDetailsContainer.classList.add("hidden");
            voteBundleDetailsContainer.classList.add("hidden");
            error.classList.add("hidden");

            const balanceResponse = await fetchData("GET", `${baseUrl}/balance/aggregate?event_id=${eventId}`);
            const categoriesResponse = await fetchData("GET", `${baseUrl}/categories?eventId=${eventId}`);
            const transactionsResponse = await fetchData("GET", `${baseUrl}/balance/transactions?event_id=${eventId}`);
            const paymentsResponse = await fetchData("GET", `${baseUrl}/balance/payments?event_id=${eventId}`);
            const categoryBalanceResponse = await Promise.all(categoriesResponse.categories.map(category =>
                fetchData("GET", `${baseUrl}/balance/aggregate?event_id=${eventId}&category_id=${category.id}`)
            ));

            const balance = (balanceResponse.aggregate?.totalAmount || 0) / 100;
            const transactionCount = balanceResponse.aggregate?.transactionCount || 0;
            const categories = categoriesResponse.categories || [];
            const transactions = transactionsResponse.transactions?.data || [];
            const payments = paymentsResponse.payments || [];
            const categoryBalances = categoryBalanceResponse.map((resp, index) => ({
                categoryName: categories[index].name,
                balance: (resp.aggregate?.totalAmount || 0) / 100,
                transactions: resp.aggregate?.transactionCount || 0
            }));

            renderEventDetails(eventId, balance, transactionCount, categories, transactions, categoryBalances);
            renderPaymentsList(eventId, payments);

            loading.classList.add("hidden");
            eventDetailsContainer.classList.remove("hidden");
            paymentListContainer.classList.remove("hidden");
            summaryContainer.classList.add("hidden");
        } catch (err) {
            loading.classList.add("hidden");
            eventDetailsContainer.classList.add("hidden");
            paymentListContainer.classList.add("hidden");
            voteBundleDetailsContainer.classList.add("hidden");
            showError("Error Loading Event Details", () => fetchEventDetails(eventId));
            console.error("Error fetching event details:", err);
        }
    }

    // Render Event Details
    function renderEventDetails(eventId, balance, transactionCount, categories, transactions, categoryBalances) {
        eventBalanceAmount.textContent = `GHS${balance.toFixed(2)}`;
        eventTransactionsCount.textContent = `${transactionCount} Transactions`;
        categoryCostsList.innerHTML = "";

        if (categories.length === 0) {
            categoryCostsList.innerHTML = showEmptyNotice("No Categories Found", "No categories are available for this event.");
        } else {
            categories.forEach((category, index) => {
                const card = document.createElement("div");
                card.className = "flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-100 rounded-lg animate-slide-in";
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = `
                    <h3 class="text-lg font-semibold text-luxury">${category.name}</h3>
                    <button class="btn bg-primary text-white rounded-full px-4 py-2 hover:bg-secondary view-bundles" data-id="${category.id}">Manage Vote Bundles</button>
                `;
                categoryCostsList.appendChild(card);
            });
        }

        renderTransactionChart(transactions);
        renderCategoryDistributionChart(categoryBalances);
    }

    // Render Transaction Chart
    function renderTransactionChart(transactions) {
        const ctx = document.getElementById("transactionChart").getContext("2d");
        if (transactionChartInstance) transactionChartInstance.destroy();

        const dates = transactions.map(t => new Date(t.paid_at).toLocaleDateString());
        const amounts = transactions.map(t => (t.amount || 0) / 100);

        transactionChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Transaction Amount (GHS)',
                    data: amounts,
                    borderColor: '#1E3A8A',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    fill: true,
                    tension: 0.4,
                }],
            },
            options: {
                maintainAspectRatio: false,
                layout: { padding: 30 },
                animation: { duration: 1500, easing: 'easeOutQuart' },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#E5E7EB' },
                        title: { display: true, text: 'Amount (GHS)', font: { family: 'Inter', size: 14 } },
                        ticks: { font: { family: 'Inter', size: 12 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 12 } }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1F2937',
                        titleFont: { family: 'Inter', size: 14 },
                        bodyFont: { family: 'Inter', size: 12 }
                    }
                }
            }
        });
    }

    // Render Category Distribution Chart
    function renderCategoryDistributionChart(categoryBalances) {
        const ctx = document.getElementById("categoryDistributionChart").getContext("2d");
        if (categoryDistributionChartInstance) categoryDistributionChartInstance.destroy();

        categoryDistributionChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categoryBalances.map(c => c.categoryName),
                datasets: [
                    {
                        label: 'Balance (GHS)',
                        data: categoryBalances.map(c => c.balance),
                        backgroundColor: '#10B981',
                        borderColor: '#1E3A8A',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Transactions',
                        data: categoryBalances.map(c => c.transactions),
                        backgroundColor: '#D4AF37',
                        borderColor: '#1E3A8A',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ],
            },
            options: {
                maintainAspectRatio: false,
                layout: { padding: 30 },
                animation: { duration: 1500, easing: 'easeOutQuart' },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#E5E7EB' },
                        title: { display: true, text: 'Balance (GHS)', font: { family: 'Inter', size: 14 } },
                        ticks: { font: { family: 'Inter', size: 12 } }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: { display: false },
                        title: { display: true, text: 'Transactions', font: { family: 'Inter', size: 14 } },
                        ticks: { font: { family: 'Inter', size: 12 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 12 } }
                    }
                },
                plugins: {
                    legend: { display: true, labels: { font: { family: 'Inter', size: 12 } } },
                    tooltip: {
                        backgroundColor: '#1F2937',
                        titleFont: { family: 'Inter', size: 14 },
                        bodyFont: { family: 'Inter', size: 12 }
                    }
                }
            }
        });
    }

    // Render Payments List
    function renderPaymentsList(eventId, payments) {
        paymentListContainer.innerHTML = "";
        if (payments.length === 0) {
            paymentListContainer.innerHTML = showEmptyNotice("No Payments Found", "No payment records are available for this event.");
            return;
        }

        payments.forEach((payment, index) => {
            const card = document.createElement("div");
            card.className = "bg-white p-4 rounded-lg shadow-sm animate-slide-in cursor-pointer hover:bg-platinum transition-all duration-200";
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-semibold text-luxury">Ref: ${payment._id}</h3>
                        <p class="text-sm text-gray-600">Status: ${payment.status}</p>
                        <p class="text-sm text-gray-600">Amount: GHS${(payment.amount / 100).toFixed(2)}</p>
                        <p class="text-sm text-gray-600">Redemption: ${payment.redeemed}</p>
                    </div>
                    <button class="btn bg-primary text-white rounded-full px-4 py-2 hover:bg-secondary view-payment-details" data-id="${payment._id}">View Details</button>
                </div>
            `;
            card.addEventListener("click", () => fetchPaymentDetails(eventId, payment._id));
            paymentListContainer.appendChild(card);
        });
    }

    // Fetch Payment Details
    async function fetchPaymentDetails(eventId, paymentId) {
        try {
            loading.classList.remove("hidden");
            paymentDetailsContainer.classList.add("hidden");
            voteBundleDetailsContainer.classList.add("hidden");
            error.classList.add("hidden");

            const paymentResponse = await fetchData("GET", `${baseUrl}/balance/payments/${paymentId}`);
            renderPaymentDetails(eventId, paymentResponse.payment);

            loading.classList.add("hidden");
            paymentDetailsContainer.classList.remove("hidden");
            paymentListContainer.classList.add("hidden");
            eventDetailsContainer.classList.add("hidden");
            summaryContainer.classList.add("hidden");
        } catch (err) {
            loading.classList.add("hidden");
            paymentDetailsContainer.classList.add("hidden");
            showError("Error Loading Payment Details", () => fetchPaymentDetails(eventId, paymentId));
            console.error("Error fetching payment details:", err);
        }
    }

    // Render Payment Details
    function renderPaymentDetails(eventId, payment) {
        paymentDetailsContainer.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h2 class="text-2xl font-semibold text-primary mb-4">Payment Details</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p><strong>Reference ID:</strong> ${payment._id}</p>
                        <p><strong>Status:</strong> ${payment.status}</p>
                        <p><strong>Amount:</strong> GHS${(payment.amount / 100).toFixed(2)}</p>
                        <p><strong>Redemption Status:</strong> ${payment.redeemed}</p>
                        <p><strong>Created At:</strong> ${new Date(payment.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                        <p><strong>Transaction ID:</strong> ${payment.reference || 'N/A'}</p>
                        <p><strong>Payment Method:</strong> ${payment.payment_method || 'N/A'}</p>
                        <p><strong>Payer Email:</strong> ${payment.metadata?.email || 'N/A'}</p>
                        <p><strong>Last Updated:</strong> ${new Date(payment.updated_at).toLocaleString()}</p>
                    </div>
                </div>
                <div class="mt-6 flex space-x-4">
                    <select id="paymentStatusSelect" class="p-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-secondary">
                        <option value="processing">Processing</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                    </select>
                    <button class="btn bg-primary text-white rounded-full px-4 py-2 hover:bg-secondary update-status" data-id="${payment._id}">Update Status</button>
                    <button class="btn bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600 mark-refunded" data-id="${payment._id}">Mark for Refund</button>
                </div>
                <button class="mt-4 btn bg-gray-500 text-white rounded-full px-4 py-2 hover:bg-gray-600 back-to-payments" data-event-id="${eventId}">Back to Payments</button>
            </div>
        `;
    }

    // Fetch Vote Bundles for Category
    async function fetchVoteBundlesForCategory(categoryId) {
        try {
            const response = await fetchData("GET", `${baseUrl}/bundles?category_id=${categoryId}`);
            return response.bundles || [];
        } catch (err) {
            console.error("Error fetching vote bundles:", err);
            showNotification("Failed to fetch vote bundles.", "error");
            return [];
        }
    }

    // Fetch Vote Bundle Details
    async function fetchVoteBundleDetails(categoryId, bundleId, bundles) {
        try {
            loading.classList.remove("hidden");
            voteBundleDetailsContainer.classList.add("hidden");
            error.classList.add("hidden");

            // Try to use cached bundle data first
            let bundle = bundles.find(b => b.id === bundleId);
            if (!bundle) {
                // Fallback to API if not found in cache
                const response = await fetchData("GET", `${baseUrl}/bundles/${bundleId}`);
                if (!response.success) throw new Error(response.error || "Failed to fetch bundle details");
                bundle = response.bundle;
            }

            renderVoteBundleDetails(categoryId, bundle);

            loading.classList.add("hidden");
            voteBundleDetailsContainer.classList.remove("hidden");
            categoryCostsList.classList.add("hidden");
            eventDetailsContainer.classList.add("hidden");
            paymentListContainer.classList.add("hidden");
            paymentDetailsContainer.classList.add("hidden");
            summaryContainer.classList.add("hidden");
        } catch (err) {
            loading.classList.add("hidden");
            voteBundleDetailsContainer.classList.add("hidden");
            showError("Error Loading Vote Bundle Details", () => fetchVoteBundleDetails(categoryId, bundleId, bundles));
            console.error("Error fetching vote bundle details:", err);
        }
    }

    // Render Vote Bundle Details
    function renderVoteBundleDetails(categoryId, bundle) {
        voteBundleDetailsContainer.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-sm animate-slide-in">
                <h2 class="text-2xl font-semibold text-primary mb-4">Vote Bundle Details</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p><strong>Bundle ID:</strong> ${bundle.id}</p>
                        <p><strong>Name:</strong> ${bundle.name}</p>
                        <p><strong>Votes in Bundle:</strong> ${bundle.votes_in_bundle}</p>
                        <p><strong>Price per Vote:</strong> GHS${(bundle.price_per_vote / 100).toFixed(2)}</p>
                    </div>
                    <div>
                        <p><strong>Category ID:</strong> ${bundle.category_id || 'N/A'}</p>
                    </div>
                </div>
                <button class="mt-6 btn bg-gray-500 text-white rounded-full px-4 py-2 hover:bg-gray-600 back-to-bundles" data-category-id="${categoryId}">Back to Bundles</button>
            </div>
        `;
    }

    // Render Vote Bundles Editor
    async function renderVoteBundlesEditor(categoryId) {
        const bundles = await fetchVoteBundlesForCategory(categoryId);
        eventDetailsContainer.classList.add("hidden");
        paymentListContainer.classList.add("hidden");
        paymentDetailsContainer.classList.add("hidden");
        voteBundleDetailsContainer.classList.add("hidden");
        summaryContainer.classList.add("hidden");

        categoryCostsList.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h2 class="text-2xl font-semibold text-primary mb-4">Vote Bundle Management</h2>
                <div id="vote-bundles-list" class="space-y-4"></div>
                <div class="mt-6">
                    <h3 class="text-lg font-semibold text-luxury mb-2">Add New Bundle</h3>
                    <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <input id="newBundleName" type="text" placeholder="Bundle Name" class="p-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-secondary">
                        <input id="newBundleVotes" type="number" min="1" placeholder="Number of Votes" class="p-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-secondary">
                        <input id="newBundlePrice" type="number" min="0" step="0.01" placeholder="Price (GHS)" class="p-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-secondary">
                        <button id="addBundleBtn" class="btn bg-primary text-white rounded-full px-4 py-2 hover:bg-secondary" data-category-id="${categoryId}">Add Bundle</button>
                    </div>
                </div>
                <button class="mt-4 btn bg-gray-500 text-white rounded-full px-4 py-2 hover:bg-gray-600 back-to-details" data-category-id="${categoryId}">Back to Event Details</button>
            </div>
        `;

        const voteBundlesList = document.getElementById("vote-bundles-list");
        if (bundles.length === 0) {
            voteBundlesList.innerHTML = showEmptyNotice("No Vote Bundles Found", "No vote bundles are available for this category.");
        } else {
            bundles.forEach((bundle, index) => {
                const card = document.createElement("div");
                card.className = "flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-100 rounded-lg animate-slide-in";
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = `
                    <div>
                        <h3 class="text-lg font-semibold text-luxury">${bundle.name}</h3>
                        <p class="text-sm text-gray-600">Votes: ${bundle.votes_in_bundle}</p>
                        <p class="text-sm text-gray-600">Price: GHS${(bundle.price_per_vote / 100).toFixed(2)}</p>
                    </div>
                    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
                        <input type="text" placeholder="Name" value="${bundle.name}" class="p-2 w-24 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-secondary bundle-name-input" data-id="${bundle.id}">
                        <input type="number" min="1" placeholder="Votes" value="${bundle.votes_in_bundle}" class="p-2 w-24 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-secondary bundle-votes-input" data-id="${bundle.id}">
                        <input type="number" min="0" step="0.01" placeholder="Price" value="${(bundle.price_per_vote / 100).toFixed(2)}" class="p-2 w-24 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-secondary bundle-price-input" data-id="${bundle.id}">
                        <button class="btn bg-primary text-white rounded-full px-4 py-2 hover:bg-secondary view-bundle-details" data-id="${bundle.id}">View Details</button>
                        <button class="btn bg-primary text-white rounded-full px-4 py-2 hover:bg-secondary update-bundle" data-id="${bundle.id}">Update</button>
                        <button class="btn bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600 delete-bundle" data-id="${bundle.id}">Delete</button>
                    </div>
                `;
                voteBundlesList.appendChild(card);
            });
        }
    }

    // Vote Bundle CRUD Operations
    async function createVoteBundle(categoryId, newBundleData) {
        try {
            const response = await fetchData("POST", `${baseUrl}/bundles`, newBundleData);
            if (response.success) {
                showNotification("Vote bundle created.", "success");
            } else {
                throw new Error(response.error || "Failed to create vote bundle");
            }
        } catch (err) {
            console.error("Error creating vote bundle:", err);
            showNotification("Failed to create vote bundle.", "error");
        }
    }

    async function updateVoteBundle(bundleId, updatedData) {
        try {
            const response = await fetchData("PUT", `${baseUrl}/bundles/${bundleId}`, updatedData);
            if (response.success) {
                showNotification("Vote bundle updated.", "success");
            } else {
                throw new Error(response.error || "Failed to update vote bundle");
            }
        } catch (err) {
            console.error("Error updating vote bundle:", err);
            showNotification("Failed to update vote bundle.", "error");
        }
    }

    async function deleteVoteBundle(bundleId) {
        try {
            const response = await fetchData("DELETE", `${baseUrl}/bundles/${bundleId}`);
            if (response.success) {
                showNotification("Vote bundle deleted.", "success");
            } else {
                throw new Error(response.error || "Failed to delete vote bundle");
            }
        } catch (err) {
            console.error("Error deleting vote bundle:", err);
            showNotification("Failed to delete vote bundle.", "error");
        }
    }

    // Payment Operations
    async function updatePaymentStatus(paymentId, newStatus) {
        try {
            const response = await fetchData("PUT", `${baseUrl}/balance/payments/${paymentId}/status`, { status: newStatus });
            if (response.success) {
                showNotification("Payment status updated.", "success");
            } else {
                throw new Error(response.error || "Failed to update payment status");
            }
        } catch (err) {
            console.error("Error updating payment status:", err);
            showNotification("Failed to update payment status.", "error");
        }
    }

    async function markPaymentForRefund(paymentId) {
        try {
            const response = await fetchData("POST", `${baseUrl}/balance/payments/${paymentId}/refund`);
            if (response.success) {
                showNotification("Payment marked for refund.", "success");
            } else {
                throw new Error(response.error || "Failed to mark payment for refund");
            }
        } catch (err) {
            console.error("Error marking payment for refund:", err);
            showNotification("Failed to mark payment for refund.", "error");
        }
    }

    // Event Listeners
    eventSelector.addEventListener("change", (e) => {
        const eventId = e.target.value;
        if (eventId) {
            fetchEventDetails(eventId);
        } else {
            eventDetailsContainer.classList.add("hidden");
            paymentListContainer.classList.add("hidden");
            paymentDetailsContainer.classList.add("hidden");
            voteBundleDetailsContainer.classList.add("hidden");
            summaryContainer.classList.remove("hidden");
        }
    });

    eventsList.addEventListener("click", (e) => {
        if (e.target.classList.contains("view-details")) {
            const eventId = e.target.getAttribute("data-id");
            eventSelector.value = eventId;
            fetchEventDetails(eventId);
        }
    });

    categoryCostsList.addEventListener("click", async (e) => {
        if (e.target.classList.contains("view-bundles")) {
            const categoryId = e.target.getAttribute("data-id");
            await renderVoteBundlesEditor(categoryId);
        } else if (e.target.classList.contains("view-bundle-details")) {
            const bundleId = e.target.getAttribute("data-id");
            const categoryId = e.target.closest(".bg-white").querySelector(".back-to-details").getAttribute("data-category-id");
            const bundles = await fetchVoteBundlesForCategory(categoryId);
            await fetchVoteBundleDetails(categoryId, bundleId, bundles);
        }
    });

    paymentListContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("view-payment-details")) {
            const paymentId = e.target.getAttribute("data-id");
            const eventId = eventSelector.value;
            fetchPaymentDetails(eventId, paymentId);
        }
    });

    paymentDetailsContainer.addEventListener("click", async (e) => {
        const eventId = eventSelector.value;
        if (e.target.classList.contains("update-status")) {
            const paymentId = e.target.getAttribute("data-id");
            const statusSelect = document.getElementById("paymentStatusSelect");
            const newStatus = statusSelect.value;
            await updatePaymentStatus(paymentId, newStatus);
            await fetchPaymentDetails(eventId, paymentId);
        } else if (e.target.classList.contains("mark-refunded")) {
            const paymentId = e.target.getAttribute("data-id");
            await markPaymentForRefund(paymentId);
            await fetchPaymentDetails(eventId, paymentId);
        } else if (e.target.classList.contains("back-to-payments")) {
            await fetchEventDetails(eventId);
        }
    });

    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("update-bundle")) {
            const bundleId = e.target.getAttribute("data-id");
            const nameInput = document.querySelector(`.bundle-name-input[data-id="${bundleId}"]`);
            const votesInput = document.querySelector(`.bundle-votes-input[data-id="${bundleId}"]`);
            const priceInput = document.querySelector(`.bundle-price-input[data-id="${bundleId}"]`);
            const updatedData = {
                name: nameInput.value,
                votes_in_bundle: parseInt(votesInput.value),
                price_per_vote: Math.round(parseFloat(priceInput.value) * 100)
            };
            if (!updatedData.name || isNaN(updatedData.votes_in_bundle) || isNaN(updatedData.price_per_vote)) {
                showNotification("Please fill all bundle fields correctly.", "error");
                return;
            }
            await updateVoteBundle(bundleId, updatedData);
            await renderVoteBundlesEditor(e.target.closest(".bg-white").querySelector(".back-to-details").getAttribute("data-category-id"));
        } else if (e.target.classList.contains("delete-bundle")) {
            const bundleId = e.target.getAttribute("data-id");
            await deleteVoteBundle(bundleId);
            await renderVoteBundlesEditor(e.target.closest(".bg-white").querySelector(".back-to-details").getAttribute("data-category-id"));
        } else if (e.target.classList.contains("back-to-details")) {
            const eventId = eventSelector.value;
            await fetchEventDetails(eventId);
        } else if (e.target.id === "addBundleBtn") {
            const categoryId = e.target.getAttribute("data-category-id");
            const nameInput = document.getElementById("newBundleName");
            const votesInput = document.getElementById("newBundleVotes");
            const priceInput = document.getElementById("newBundlePrice");
            const newBundleData = {
                name: nameInput.value,
                votes_in_bundle: parseInt(votesInput.value),
                price_per_vote: Math.round(parseFloat(priceInput.value) * 100)
            };
            if (!newBundleData.name || isNaN(newBundleData.votes_in_bundle) || isNaN(newBundleData.price_per_vote)) {
                showNotification("Please fill all bundle fields correctly.", "error");
                return;
            }
            await createVoteBundle(categoryId, newBundleData);
            await renderVoteBundlesEditor(categoryId);
        } else if (e.target.classList.contains("back-to-bundles")) {
            const categoryId = e.target.getAttribute("data-category-id");
            await renderVoteBundlesEditor(categoryId);
        }
    });

    // Socket.IO Event Handlers
    socket.on("balanceUpdate", async (data) => {
        if (data.eventId === eventSelector.value) {
            await fetchEventDetails(eventSelector.value);
        }
        await fetchEventsAndSummary();
    });

    // Initial Load
    await fetchEventsAndSummary();
});