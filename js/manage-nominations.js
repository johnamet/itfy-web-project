import fetchEvents from "./utils/fetch-events.js";
import { fetchNominations, fetchNominationRequirements } from "./utils/fetch-nominations.js";
import { fetchData } from "./utils/fetchData.js";
import { baseUrl } from "./utils/constants.js";

document.addEventListener("DOMContentLoaded", async () => {
    const eventSelector = document.getElementById("eventSelector");
    const requirementsForm = document.getElementById("requirements-form");
    const requirementsFields = document.getElementById("requirements-fields");
    const addFieldButton = document.getElementById("add-field");
    const nominationsContainer = document.getElementById("nominations-container");
    const nominationsPagination = document.getElementById("nominations-pagination");
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
    const closeNotification = document.getElementById("closeNotification");

    let nominations = [];
    let currentPage = 1;
    const pageSize = 10;

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

    // Populate event selector
    try {
        const events = await fetchEvents();
        events.forEach((event) => {
            const option = document.createElement("option");
            option.value = event.id;
            option.textContent = event.name;
            eventSelector.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to fetch events:", error);
        showNotification("Failed to load events. Please try refreshing the page.", "error");
    }

    // Event selector change handler
    eventSelector.addEventListener("change", async () => {
        const selectedEventId = eventSelector.value;
        if (selectedEventId) {
            await fetchNominationRequirement(selectedEventId);
            await fetchNominations(selectedEventId, currentPage);
        } else {
            clearRequirements();
            clearNominations();
        }
    });

    // Add requirement field
    addFieldButton.addEventListener("click", () => addRequirementField());

    // Save requirements
    requirementsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedEventId = eventSelector.value;
        if (!selectedEventId) {
            showNotification("Please select an event before saving requirements.", "error");
            return;
        }
        const requirements = Array.from(document.querySelectorAll(".requirement-field")).map((field) => ({
            name: field.querySelector('[name="field-name"]').value.trim(),
            type: field.querySelector('[name="field-type"]').value,
            required: field.querySelector('[name="field-required"]').checked,
        }));
        if (requirements.some(req => !req.name)) {
            showNotification("All requirement fields must have a name.", "error");
            return;
        }
        await saveNominationRequirements(selectedEventId, requirements);
    });

    // Add requirement field dynamically
    function addRequirementField(name = "", type = "text", required = false) {
        const field = document.createElement("div");
        field.className = "requirement-field grid grid-cols-3 gap-4 items-center animate-fade-in";
        field.innerHTML = `
            <div class="input-label">
                <input type="text" name="field-name" value="${name}" placeholder=" " class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" required>
                <span class="label-text">Field Name</span>
            </div>
            <div class="input-label">
                <select name="field-type" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" placeholder=" ">
                    <option value="text" ${type === "text" ? "selected" : ""}>Text</option>
                    <option value="email" ${type === "email" ? "selected" : ""}>Email</option>
                    <option value="number" ${type === "number" ? "selected" : ""}>Number</option>
                    <option value="textarea" ${type === "textarea" ? "selected" : ""}>Textarea</option>
                </select>
                <span class="label-text">Field Type</span>
            </div>
            <div class="flex items-center space-x-2">
                <label class="flex items-center">
                    <input type="checkbox" name="field-required" ${required ? "checked" : ""} class="h-4 w-4 text-secondary border-gray-300 rounded focus:ring-secondary">
                    <span class="ml-2 text-luxury">Required</span>
                </label>
                <button type="button" class="remove-field btn bg-red-600 text-white font-semibold py-2 px-4 rounded-full shadow-premium hover:bg-red-800">Remove</button>
            </div>
        `;
        field.querySelector(".remove-field").addEventListener("click", () => field.remove());
        requirementsFields.appendChild(field);
    }

    // Clear functions
    function clearRequirements() {
        requirementsFields.innerHTML = "";
    }
    function clearNominations() {
        nominationsContainer.innerHTML = `
            <div class="no-nominations text-center p-4 text-gray-600 animate-fade-in">
                <p class="text-lg font-medium text-luxury">No nominations found for this event.</p>
                <p class="text-sm">Select an event or create new nominations to get started.</p>
            </div>
        `;
        nominationsPagination.innerHTML = "";
    }

    // Fetch and populate requirements
    async function fetchNominationRequirement(eventId) {
        try {
            const requirements = await fetchNominationRequirements(eventId);
            clearRequirements();
            if (requirements && requirements.length > 0) {
                requirements.forEach((req) => {
                    addRequirementField(req.name || "", req.type || "text", req.required || false);
                });
            } else {
                addRequirementField(); // Add one empty field if no requirements exist
            }
        } catch (error) {
            console.error("Failed to fetch requirements:", error);
            showNotification("Failed to load nomination requirements. Please try again.", "error");
            clearRequirements();
            addRequirementField();
        }
    }

    // Fetch nominations with pagination
    async function fetchNominations(eventId, page = 1) {
        try {
            const response = await fetchData("GET", `${baseUrl}/nominations?eventId=${eventId}&page=${page}&size=${pageSize}`);
            if (response.success) {
                nominations = response.nominations || [];
                currentPage = page;
                await renderNominations(nominations);
                renderPagination(response.totalPages, page);
            } else {
                showNotification(`Failed to fetch nominations: ${response.error || "Unknown error"}`, "error");
                clearNominations();
            }
        } catch (error) {
            console.error("Failed to fetch nominations:", error);
            showNotification(`Failed to fetch nominations: ${error.message || "Unknown error"}`, "error");
            clearNominations();
        }
    }

    // Save requirements
    async function saveNominationRequirements(eventId, requirements) {
        try {
            const data = { form: requirements, eventId };
            const response = await fetchData("POST", `${baseUrl}/nominations/create-form/${eventId}`, data);
            if (!response.success) {
                throw new Error(response.error || "Failed to save requirements");
            }
            showNotification("Nomination requirements saved successfully!", "success");
            await fetchNominationRequirement(eventId);
        } catch (error) {
            console.error("Error saving requirements:", error);
            showNotification(`Failed to save requirements: ${error.message || "Unknown error"}`, "error");
        }
    }

    // Render nominations
    async function renderNominations(nominations) {
        nominationsContainer.innerHTML = "";
        if (!nominations || nominations.length === 0) {
            clearNominations();
            return;
        }

        nominations.forEach((nomination, index) => {
            const card = document.createElement("div");
            card.className = "nomination-card bg-white/90 p-6 rounded-lg shadow-premium mb-4 animate-slide-in hover:bg-platinum transition-all duration-200";
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="nomination-header flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-semibold text-luxury">${nomination.nominee_name || "Unnamed Nominee"}</h3>
                        <p class="text-sm text-gray-600"><strong>Category:</strong> ${nomination.category || "N/A"}</p>
                        <p class="text-sm text-gray-600"><strong>Status:</strong> <span class="px-2 py-1 rounded-full ${getStatusColor(nomination.status)}">${nomination.status || "Pending"}</span></p>
                    </div>
                    <button class="expand-btn btn bg-platinum text-luxury font-semibold py-2 px-4 rounded-full shadow-sm hover:bg-gray-200">View Details</button>
                </div>
                <div class="nomination-details hidden mt-4 text-luxury">
                    <p><strong>Email:</strong> ${nomination.candidate_email || "N/A"}</p>
                    <p><strong>Event ID:</strong> ${nomination.event_id || "N/A"}</p>
                    <p><strong>Candidate ID:</strong> ${nomination.candidate_id || "N/A"}</p>
                    <p><strong>Details:</strong></p>
                    <ul class="list-disc pl-5 text-sm">
                        ${Object.entries(nomination)
                            .filter(([key]) => !["nominee_name", "category", "status", "candidate_email", "event_id", "candidate_id"].includes(key))
                            .map(([key, value]) => `<li><strong>${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong> ${value || "N/A"}</li>`).join("")}
                    </ul>
                    <div class="mt-4 flex space-x-4">
                        <button class="approve-btn btn bg-green-600 text-white font-semibold py-2 px-4 rounded-full shadow-premium hover:bg-green-700" data-id="${nomination.id}">Approve</button>
                        <button class="reject-btn btn bg-red-600 text-white font-semibold py-2 px-4 rounded-full shadow-premium hover:bg-red-800" data-id="${nomination.id}">Reject</button>
                        <button class="delete-btn btn bg-luxury text-white font-semibold py-2 px-4 rounded-full shadow-premium hover:bg-gray-900" data-id="${nomination.id}">Delete</button>
                    </div>
                </div>
            `;
            card.querySelector(".expand-btn").addEventListener("click", () => {
                card.querySelector(".nomination-details").classList.toggle("hidden");
            });
            card.querySelector(".approve-btn").addEventListener("click", () => updateNominationStatus(nomination.id, "approve"));
            card.querySelector(".reject-btn").addEventListener("click", () => updateNominationStatus(nomination.id, "reject"));
            card.querySelector(".delete-btn").addEventListener("click", () => deleteNomination(nomination.id));
            nominationsContainer.appendChild(card);
        });
    }

    // Get status color
    function getStatusColor(status) {
        switch (status?.toLowerCase()) {
            case "approved":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "pending":
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    }

    // Render pagination
    function renderPagination(totalPages, currentPage) {
        nominationsPagination.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.className = `px-3 py-1 rounded-full font-medium ${
                i === currentPage ? "bg-gradient-premium text-white" : "bg-platinum text-luxury hover:bg-secondary hover:text-white"
            } mr-2 transition-all duration-200`;
            button.addEventListener("click", () => fetchNominations(eventSelector.value, i));
            nominationsPagination.appendChild(button);
        }
    }

    // Update nomination status
    async function updateNominationStatus(nominationId, action) {
        try {
            const response = await fetchData("PUT", `${baseUrl}/nominations/${nominationId}`, { status: action });
            if (response.success) {
                showNotification(`Nomination ${action}d successfully!`, "success");
                await fetchNominations(eventSelector.value, currentPage);
            } else {
                showNotification(`Failed to ${action} nomination: ${response.error || "Unknown error"}`, "error");
            }
        } catch (error) {
            console.error(`Failed to ${action} nomination:`, error);
            showNotification(`Failed to ${action} nomination: ${error.message || "Unknown error"}`, "error");
        }
    }

    // Delete nomination
    async function deleteNomination(nominationId) {
        if (confirm("Are you sure you want to delete this nomination?")) {
            try {
                const response = await fetchData("DELETE", `${baseUrl}/nominations/${nominationId}`);
                if (response.success) {
                    showNotification("Nomination deleted successfully!", "success");
                    await fetchNominations(eventSelector.value, currentPage);
                } else {
                    showNotification(`Failed to delete nomination: ${response.error || "Unknown error"}`, "error");
                }
            } catch (error) {
                console.error("Failed to delete nomination:", error);
                showNotification(`Failed to delete nomination: ${error.message || "Unknown error"}`, "error");
            }
        }
    }

    // Initial state
    clearNominations();
});