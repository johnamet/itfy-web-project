import { baseUrl } from "./utils/constants.js";
import { formatDateTime } from "./utils/dateTimeFormatter.js";
import { fetchData, uploadImage } from "./utils/fetchData.js";

document.addEventListener("DOMContentLoaded", async () => {
    const createEventBtn = document.getElementById("createEventBtn");
    const eventFormSection = document.getElementById("event-form");
    const formTitle = document.getElementById("formTitle");
    const cancelBtn = document.getElementById("cancelBtn");
    const saveBtn = document.getElementById("saveBtn");
    const eventForm = document.querySelector("#eventFormElement");
    const addTimelineFieldBtn = document.getElementById("addTimelineFieldBtn");
    const timelineFieldsContainer = document.getElementById("timelineFieldsContainer");
    const addFieldBtn = document.getElementById("addFieldBtn");
    const dynamicFieldsContainer = document.getElementById("dynamicFieldsContainer");
    const addRelatedEventBtn = document.getElementById("addRelatedEventBtn");
    const relatedEventsDropdown = document.getElementById("relatedEventsDropdown");
    const relatedEventsContainer = document.getElementById("relatedEventsContainer");
    const eventsTable = document.getElementById("eventsTable");
    const eventsPagination = document.getElementById("events-pagination");
    const tabButtons = document.querySelectorAll(".tab-button");
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
    const closeNotification = document.getElementById("closeNotification");

    let events = [];
    let editingEventId = null;
    let currentPage = 1;
    const pageSize = 10;
    let currentTab = "active";

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
    async function fetchEvents(page = 1) {
        try {
            const response = await fetchData("GET", `${baseUrl}/events?page=${page}&size=${pageSize}`);
            if (response.success) {
                events = response.events;
                currentPage = page;
                await renderEvents();
                renderPagination(response.totalPages, page);
                populateRelatedEventsDropdown();
            } else {
                showNotification(`Failed to fetch events: ${response.error || "Unknown error"}`, "error");
            }
        } catch (e) {
            showNotification(`Error fetching events: ${e.message || "Unknown error"}`, "error");
            console.error("Error fetching events:", e);
        }
    }

    // Populate Related Events Dropdown
    function populateRelatedEventsDropdown() {
        relatedEventsDropdown.innerHTML = '<option value="">Select Related Event</option>';
        events.forEach(event => {
            const option = document.createElement("option");
            option.value = event.id;
            option.textContent = event.name;
            relatedEventsDropdown.appendChild(option);
        });
    }

    // Render Events
    async function renderEvents() {
        eventsTable.innerHTML = "";
        const filteredEvents = events.filter(e => e.status === currentTab || (!e.status && currentTab === "active"));
        if (filteredEvents.length === 0) {
            eventsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-600 text-sm font-medium">
                        No ${currentTab} events available
                    </td>
                </tr>
            `;
        } else {
            filteredEvents.forEach((event, index) => {
                const row = document.createElement("tr");
                row.className = "bg-white/90 hover:bg-platinum transition duration-200 animate-slide-in";
                row.style.animationDelay = `${index * 0.1}s`;
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-luxury font-medium">${event.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-600">${formatDateTime(event.created_at).formattedDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-600">${formatDateTime(event.startDate || event.start_date).formattedDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-600">${formatDateTime(event.endDate || event.end_date).formattedDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)}">
                            ${event.status || "active"}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-primary hover:text-secondary mr-4 edit-btn" data-id="${event.id}">Edit</button>
                        <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${event.id}">Delete</button>
                    </td>
                `;
                eventsTable.appendChild(row);
            });
        }

        // Add event listeners for edit and delete buttons
        document.querySelectorAll(".edit-btn").forEach(btn => btn.addEventListener("click", editEvent));
        document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", deleteEvent));
    }

    // Get Status Color
    function getStatusColor(status) {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "upcoming":
                return "bg-blue-100 text-blue-800";
            case "archived":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }

    // Render Pagination
    function renderPagination(totalPages, currentPage) {
        eventsPagination.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.className = `px-3 py-1 rounded-full font-medium ${
                i === currentPage ? "bg-gradient-premium text-white" : "bg-platinum text-luxury hover:bg-secondary hover:text-white"
            } mr-2 transition-all duration-200`;
            button.addEventListener("click", () => fetchEvents(i));
            eventsPagination.appendChild(button);
        }
    }

    // Tab Switching
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentTab = button.getAttribute("data-tab");
            renderEvents();
        });
    });

    // Add Timeline Field
    addTimelineFieldBtn.addEventListener("click", () => {
        const fieldContainer = document.createElement("div");
        fieldContainer.className = "grid grid-cols-3 gap-4 mb-4";
        fieldContainer.innerHTML = `
            <div class="input-label">
                <input type="text" placeholder=" " class="timeline-title w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm">
                <span class="label-text">Timeline Title</span>
            </div>
            <div class="input-label">
                <input type="text" placeholder=" " class="timeline-description w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm">
                <span class="label-text">Timeline Description</span>
            </div>
            <div class="input-label">
                <input type="time" placeholder=" " class="timeline-time w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm">
                <span class="label-text">Timeline Time</span>
            </div>
        `;
        timelineFieldsContainer.appendChild(fieldContainer);
    });

    // Add Dynamic Field
    addFieldBtn.addEventListener("click", () => {
        const fieldContainer = document.createElement("div");
        fieldContainer.className = "grid grid-cols-2 gap-4 mb-4";
        fieldContainer.innerHTML = `
            <div class="input-label">
                <input type="text" placeholder=" " class="field-label w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm">
                <span class="label-text">Field Label</span>
            </div>
            <div class="input-label">
                <input type="text" placeholder=" " class="field-value w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm">
                <span class="label-text">Field Value</span>
            </div>
        `;
        dynamicFieldsContainer.appendChild(fieldContainer);
    });

    // Add Related Event
    addRelatedEventBtn.addEventListener("click", () => {
        const selectedEventId = relatedEventsDropdown.value;
        const selectedEvent = events.find(e => e.id === selectedEventId);
        if (selectedEvent) {
            const eventDiv = document.createElement("div");
            eventDiv.className = "flex items-center justify-between p-2 bg-platinum rounded-lg mb-2";
            eventDiv.innerHTML = `
                <span>${selectedEvent.name}</span>
                <button type="button" class="text-red-600 hover:text-red-800 remove-related-event" data-id="${selectedEventId}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            relatedEventsContainer.appendChild(eventDiv);
            relatedEventsDropdown.value = "";
            // Add event listener for remove button
            eventDiv.querySelector(".remove-related-event").addEventListener("click", () => {
                eventDiv.remove();
            });
        } else {
            showNotification("Please select a related event", "error");
        }
    });

    // Event Form Submission
    eventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(eventForm);
        const eventData = {
            name: formData.get("eventName").trim(),
            startDate: formData.get("eventStartDate"),
            startTime: formData.get("eventStartTime"),
            endDate: formData.get("eventEndDate"),
            endTime: formData.get("eventEndTime"),
            status: formData.get("eventStatus"),
            description: formData.get("eventDescription").trim(),
            timeline: [],
            additionalFields: [],
            relatedEvents: [],
        };

        // Validate required fields
        if (!eventData.name || !eventData.startDate || !eventData.startTime || !eventData.endDate || !eventData.endTime || !eventData.description) {
            showNotification("All required fields must be filled", "error");
            return;
        }

        // Collect timeline fields
        const timelineContainers = timelineFieldsContainer.querySelectorAll(".grid");
        timelineContainers.forEach(container => {
            const title = container.querySelector(".timeline-title")?.value.trim();
            const description = container.querySelector(".timeline-description")?.value.trim();
            const time = container.querySelector(".timeline-time")?.value;
            if (title && description && time) {
                eventData.timeline.push({ title, description, time });
            }
        });

        // Collect dynamic fields
        const fieldContainers = dynamicFieldsContainer.querySelectorAll(".grid");
        fieldContainers.forEach(container => {
            const label = container.querySelector(".field-label")?.value.trim();
            const value = container.querySelector(".field-value")?.value.trim();
            if (label && value) {
                eventData.additionalFields.push({ label, value });
            }
        });

        // Collect related events
        const relatedEventIds = Array.from(relatedEventsContainer.querySelectorAll(".remove-related-event")).map(btn => btn.getAttribute("data-id"));
        eventData.relatedEvents = relatedEventIds;

        try {
            let response;
            if (editingEventId) {
                response = await fetchData("PUT", `${baseUrl}/events/${editingEventId}`, eventData);
                if (response.success) {
                    const thumbnail = formData.get("eventThumbnail");
                    if (thumbnail && thumbnail.size > 0) {
                        const uploadThumbnail = await uploadImage(`${baseUrl}/app/files`, 'events', editingEventId, thumbnail);
                        if (!uploadThumbnail.success) {
                            showNotification(`Failed to upload thumbnail: ${uploadThumbnail.error || "Unknown error"}`, "error");
                            return;
                        }
                    }
                    const index = events.findIndex(e => e.id === editingEventId);
                    events[index] = { ...events[index], ...eventData, id: editingEventId };
                    showNotification("Event updated successfully!", "success");
                } else if (response.error === "Insufficient permissions") {
                    showNotification("Insufficient permissions. Contact a senior administrator to update events.", "error");
                    return;
                } else {
                    showNotification(`Failed to update event: ${response.error || "Unknown error"}`, "error");
                    return;
                }
            } else {
                response = await fetchData("POST", `${baseUrl}/events`, eventData, true);
                if (response.success) {
                    const thumbnail = formData.get("eventThumbnail");
                    if (thumbnail && thumbnail.size > 0) {
                        const uploadThumbnail = await uploadImage(`${baseUrl}/app/files`, 'events', response.event.id, thumbnail);
                        if (!uploadThumbnail.success) {
                            showNotification(`Failed to upload thumbnail: ${uploadThumbnail.error || "Unknown error"}`, "error");
                            return;
                        }
                    }
                    events.push(response.event);
                    showNotification("Event created successfully!", "success");
                } else if (response.error === "Insufficient permissions") {
                    showNotification("Insufficient permissions. Contact a senior administrator to create events.", "error");
                    return;
                } else {
                    showNotification(`Failed to create event: ${response.error || "Unknown error"}`, "error");
                    return;
                }
            }
            await fetchEvents(currentPage);
            eventFormSection.classList.add("hidden");
            eventForm.reset();
            timelineFieldsContainer.innerHTML = "";
            dynamicFieldsContainer.innerHTML = "";
            relatedEventsContainer.innerHTML = "";
            editingEventId = null;
        } catch (e) {
            showNotification(`An error occurred while saving: ${e.message || "Unknown error"}`, "error");
            console.error("Error saving event:", e);
        }
    });

    // Edit Event
    async function editEvent(e) {
        const eventId = e.target.getAttribute("data-id");
        const event = events.find(e => e.id === eventId);
        if (event) {
            formTitle.textContent = "Edit Event";
            eventForm.eventName.value = event.name || "";
            eventForm.eventStartDate.value = event.startDate ? formatDateTime(event.startDate).date : "";
            eventForm.eventStartTime.value = event.startDate ? formatDateTime(event.startDate).time : "";
            eventForm.eventEndDate.value = event.endDate ? formatDateTime(event.endDate).date : "";
            eventForm.eventEndTime.value = event.endDate ? formatDateTime(event.endDate).time : "";
            eventForm.eventStatus.value = event.status || "active";
            eventForm.eventDescription.value = event.description || "";

            // Populate timeline fields
            timelineFieldsContainer.innerHTML = "";
            if (event.timeline && Array.isArray(event.timeline)) {
                event.timeline.forEach(field => {
                    const fieldContainer = document.createElement("div");
                    fieldContainer.className = "grid grid-cols-3 gap-4 mb-4";
                    fieldContainer.innerHTML = `
                        <div class="input-label">
                            <input type="text" placeholder=" " class="timeline-title w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" value="${field.title || ''}">
                            <span class="label-text">Timeline Title</span>
                        </div>
                        <div class="input-label">
                            <input type="text" placeholder=" " class="timeline-description w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" value="${field.description || ''}">
                            <span class="label-text">Timeline Description</span>
                        </div>
                        <div class="input-label">
                            <input type="time" placeholder=" " class="timeline-time w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" value="${field.time || ''}">
                            <span class="label-text">Timeline Time</span>
                        </div>
                    `;
                    timelineFieldsContainer.appendChild(fieldContainer);
                });
            }

            // Populate dynamic fields
            dynamicFieldsContainer.innerHTML = "";
            if (event.additionalFields && Array.isArray(event.additionalFields)) {
                event.additionalFields.forEach(field => {
                    const fieldContainer = document.createElement("div");
                    fieldContainer.className = "grid grid-cols-2 gap-4 mb-4";
                    fieldContainer.innerHTML = `
                        <div class="input-label">
                            <input type="text" placeholder=" " class="field-label w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" value="${field.label || ''}">
                            <span class="label-text">Field Label</span>
                        </div>
                        <div class="input-label">
                            <input type="text" placeholder=" " class="field-value w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" value="${field.value || ''}">
                            <span class="label-text">Field Value</span>
                        </div>
                    `;
                    dynamicFieldsContainer.appendChild(fieldContainer);
                });
            }

            // Populate related events
            relatedEventsContainer.innerHTML = "";
            if (event.relatedEvents && Array.isArray(event.relatedEvents)) {
                event.relatedEvents.forEach(eventId => {
                    const relatedEvent = events.find(e => e.id === eventId);
                    if (relatedEvent) {
                        const eventDiv = document.createElement("div");
                        eventDiv.className = "flex items-center justify-between p-2 bg-platinum rounded-lg mb-2";
                        eventDiv.innerHTML = `
                            <span>${relatedEvent.name}</span>
                            <button type="button" class="text-red-600 hover:text-red-800 remove-related-event" data-id="${eventId}">
                                <i class="fas fa-times"></i>
                            </button>
                        `;
                        relatedEventsContainer.appendChild(eventDiv);
                        eventDiv.querySelector(".remove-related-event").addEventListener("click", () => {
                            eventDiv.remove();
                        });
                    }
                });
            }

            eventFormSection.classList.remove("hidden");
            editingEventId = eventId;
        } else {
            showNotification("Event not found", "error");
            console.error("Event not found:", eventId);
        }
    }

    // Delete Event
    async function deleteEvent(e) {
        const eventId = e.target.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this event?")) {
            try {
                const response = await fetchData("DELETE", `${baseUrl}/events/${eventId}`);
                if (response.success) {
                    events = events.filter(e => e.id !== eventId);
                    await fetchEvents(currentPage);
                    showNotification("Event deleted successfully!", "success");
                } else if (response.error === "Insufficient permissions") {
                    showNotification("Insufficient permissions. Contact a senior administrator to delete events.", "error");
                } else {
                    showNotification(`Failed to delete event: ${response.error || "Unknown error"}`, "error");
                }
            } catch (e) {
                showNotification(`Error deleting event: ${e.message || "Unknown error"}`, "error");
                console.error("Error deleting event:", e);
            }
        }
    }

    // Initial Load
    await fetchEvents();
});