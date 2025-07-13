import { baseUrl } from "./utils/constants.js";
import { fetchData } from "./utils/fetchData.js";

document.addEventListener("DOMContentLoaded", async () => {
    const eventSelector = document.getElementById("eventSelector");
    const resultsContainer = document.getElementById("results-container");
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
    const closeNotification = document.getElementById("closeNotification");

    // Close Notification
    closeNotification.addEventListener("click", () => {
        notification.classList.add("hidden");
        notification.classList.remove("bg-green-600", "bg-red-600", "animate-fade-in");
    });

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

    // Fetch Events
    async function fetchEvents() {
        try {
            const response = await fetchData("GET", `${baseUrl}/events`);
            const events = response.events || [];
            events.forEach(event => {
                const option = document.createElement("option");
                option.value = event.id;
                option.textContent = event.name;
                eventSelector.appendChild(option);
            });
            if (events.length === 0) {
                showNotification("No events available", "error");
            }
        } catch (err) {
            console.error("Error fetching events:", err);
            error.classList.remove("hidden");
            error.innerHTML = `
                <div class="text-center text-red-600">
                    <p class="text-lg font-semibold">Error Loading Events</p>
                    <p class="text-sm">Please try again later.</p>
                </div>
            `;
            showNotification("Failed to load events", "error");
        }
    }

    // Fetch Results for Selected Event
    async function fetchResults(eventId) {
        try {
            loading.classList.remove("hidden");
            resultsContainer.classList.add("hidden");
            error.classList.add("hidden");

            const response = await fetchData("GET", `${baseUrl}/votes/summary?event_id=${eventId}`);
            const results = response.summary || [];

            renderResults(results);
            loading.classList.add("hidden");
            resultsContainer.classList.remove("hidden");
        } catch (err) {
            loading.classList.add("hidden");
            resultsContainer.classList.add("hidden");
            error.classList.remove("hidden");
            error.innerHTML = `
                <div class="text-center text-red-600">
                    <p class="text-lg font-semibold">Error Loading Results</p>
                    <p class="text-sm">Please try again later.</p>
                </div>
            `;
            console.error("Error fetching results:", err);
            showNotification("Failed to load results", "error");
        }
    }

    // Render Results (Chart + Table)
    function renderResults(results) {
        resultsContainer.innerHTML = "";

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center text-gray-600 p-6">
                    <p class="text-lg font-semibold">No Results Found</p>
                    <p class="text-sm">This event has no voting results yet.</p>
                </div>
            `;
            return;
        }

        // Chart Section
        const chartDiv = document.createElement("div");
        chartDiv.className = "bg-white/90 p-6 rounded-lg shadow-premium animate-slide-in backdrop-blur-md";
        chartDiv.innerHTML = `
            <h2 class="text-xl font-semibold text-primary mb-4">Vote Distribution</h2>
            <canvas id="resultsChart" class="w-full h-64"></canvas>
        `;
        resultsContainer.appendChild(chartDiv);

        // Table Section
        const tableDiv = document.createElement("div");
        tableDiv.className = "bg-white/90 p-6 rounded-lg shadow-premium animate-slide-in backdrop-blur-md";
        tableDiv.innerHTML = `
            <h2 class="text-xl font-semibold text-primary mb-4">Results Details</h2>
            <div class="table-responsive">
                <table class="w-full divide-y divide-gray-200">
                    <thead class="bg-platinum">
                        <tr>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Candidate</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Category</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Votes</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200" id="resultsTableBody"></tbody>
                </table>
            </div>
        `;
        resultsContainer.appendChild(tableDiv);

        // Populate Table
        const tableBody = document.getElementById("resultsTableBody");
        results.forEach((result, index) => {
            const row = document.createElement("tr");
            row.className = "bg-white/90 hover:bg-platinum transition duration-200 animate-slide-in";
            row.style.animationDelay = `${index * 0.1}s`;
            row.innerHTML = `
                <td class="px-6 py-4 text-luxury font-medium">${result.candidate_name}</td>
                <td class="px-6 py-4 text-gray-600">${result.category}</td>
                <td class="px-6 py-4 text-gray-600">${result.total_votes}</td>
            `;
            tableBody.appendChild(row);
        });

        // Render Chart
        const ctx = document.getElementById("resultsChart").getContext("2d");
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: results.map(r => r.candidate_name),
                datasets: [{
                    label: 'Votes',
                    data: results.map(r => r.total_votes),
                    backgroundColor: '#10B981',
                    borderColor: '#1E3A8A',
                    borderWidth: 1,
                }],
            },
            options: {
                animation: { duration: 1500, easing: 'easeOutQuart' },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#E5E7EB' } },
                    x: { grid: { display: false } },
                },
                plugins: { legend: { display: false } },
            },
        });
    }

    // Event Selector Change
    eventSelector.addEventListener("change", (e) => {
        const eventId = e.target.value;
        if (eventId) {
            fetchResults(eventId);
        } else {
            resultsContainer.classList.add("hidden");
            resultsContainer.innerHTML = "";
        }
    });

    // Initial Load
    await fetchEvents();
});