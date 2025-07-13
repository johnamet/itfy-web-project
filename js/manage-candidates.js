import { baseUrl } from "./utils/constants.js";
import { fetchData } from "./utils/fetchData.js";
import { formatDateTime } from "./utils/dateTimeFormatter.js";
import emptyNotice from "./utils/components/emptyNotice.js";

document.addEventListener("DOMContentLoaded", async () => {
    const addCandidateBtn = document.getElementById("addCandidateBtn");
    const candidateForm = document.getElementById("candidateForm");
    const candidateFormElement = document.getElementById("candidateFormElement");
    const formTitle = document.getElementById("formTitle");
    const cancelBtn = document.getElementById("cancelBtn");
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
    const closeNotification = document.getElementById("closeNotification");
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");
    const candidatesTable = document.getElementById("candidatesTable");
    const candidatesBody = document.getElementById("candidatesBody");
    const eventDropdown = document.getElementById("event");
    const categoryDropdown = document.getElementById("categories");
    const statusDropDown = document.getElementById("status");
    const selectedCategories = document.getElementById("selectedCategories");
    const tabCandidates = document.getElementById("tab-candidates");
    const tabPending = document.getElementById("tab-pending");
    const tabFormSettings = document.getElementById("tab-form-settings");
    const candidatesTab = document.getElementById("candidatesTab");
    const pendingTab = document.getElementById("pendingTab");
    const formSettingsTab = document.getElementById("formSettingsTab");
    const pendingRegistrations = document.getElementById("pendingRegistrations");
    const formSettingsForm = document.getElementById("formSettingsForm");
    const formEvent = document.getElementById("formEvent");
    const addCustomFieldBtn = document.getElementById("addCustomField");
    const customFieldsContainer = document.getElementById("customFields");
    const registrationModal = document.getElementById("registrationModal");
    const closeModal = document.getElementById("closeModal");
    const registrationDetails = document.getElementById("registrationDetails");
    const approveBtn = document.getElementById("approveBtn");
    const rejectBtn = document.getElementById("rejectBtn");

    let candidates = [];
    let pendingRegistrationsData = [];
    let isEditing = false;
    let editingCandidateId = null;
    let currentRegistrationId = null;
    let customFieldCount = 0;
    let events = [];
    let categories = [];

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
    closeNotification.addEventListener("click", () => {
        notification.classList.add("hidden");
        notification.classList.remove("bg-green-600", "bg-red-600", "animate-fade-in");
    });

    // Fetch Candidates
    async function fetchCandidates() {
        try {
            const response = await fetchData("GET", `${baseUrl}/candidates`);
            candidates = response.candidates || [];
            renderCandidates();
            loading.classList.add("hidden");
            candidatesTable.classList.remove("hidden");
        } catch (err) {
            error.classList.remove("hidden");
            loading.classList.add("hidden");
            candidatesTable.classList.add("hidden");
            error.innerHTML = emptyNotice({
                message: "Error Loading Candidates",
                subMessage: "Please try again later."
            });
        }
    }

    // Fetch Pending Registrations
    async function fetchPendingRegistrations() {
        try {
            const response = await fetchData("GET", `${baseUrl}/candidates`);
            pendingRegistrationsData = response.candidates.filter((candidate) => candidate.status === "pending") || [];
            renderPendingRegistrations();
            loading.classList.add("hidden");
            pendingTab.classList.remove("hidden");
        } catch (err) {
            error.classList.remove("hidden");
            loading.classList.add("hidden");
            pendingTab.classList.add("hidden");
            error.innerHTML = emptyNotice({
                message: "Error Loading Pending Registrations",
                subMessage: "Please try again later."
            });
        }
    }

    // Fetch Events
    async function fetchEvents() {
        try {
            const response = await fetchData("GET", `${baseUrl}/events`);
            events = response.events || [];
            eventDropdown.innerHTML = '<option value="">Select Event</option>';
            formEvent.innerHTML = '<option value="">Select Open Event</option>';
            events.forEach(event => {
                const option = document.createElement("option");
                option.value = event.id;
                option.textContent = event.name;
                eventDropdown.appendChild(option.cloneNode(true));
                if (event.type === "open") {
                    formEvent.appendChild(option);
                }
            });
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    }

    function renderStatus() {
        const statusOptions = {
            "pending": "Pending",
            "approved": "Approved",
            "rejected": "Rejected"
        };
        statusDropDown.innerHTML = '<option value="">Select Status</option>';
        for (const [key, value] of Object.entries(statusOptions)) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = value;
            statusDropDown.appendChild(option);
        }
    }

    renderStatus();

    // Fetch Categories
    async function fetchCategories(eventId) {
        try {
            const response = await fetchData("GET", `${baseUrl}/categories?eventId=${eventId}`);
            categories = response.categories || [];
            categoryDropdown.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categoryDropdown.appendChild(option);
            });
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }

    // Fetch Form Settings
    async function fetchFormSettings(eventId) {
        try {
            const response = await fetchData("GET", `${baseUrl}/candidates/form/${eventId}`);
            if (response.success && response.form) {
                renderFormSettings(response.form);
            } else {
                customFieldsContainer.innerHTML = "";
                customFieldCount = 0;
            }
        } catch (err) {
            showNotification("Error fetching form settings.", "error");
            customFieldsContainer.innerHTML = "";
            customFieldCount = 0;
        }
    }

    // Render Form Settings
    function renderFormSettings(formSettings) {
        customFieldsContainer.innerHTML = "";
        customFieldCount = 0;

        const fields = formSettings.fields || [];
        fields.forEach(field => {
            if (field.name !== "name" && field.name !== "email") {
                addCustomField(field.name, field.type);
            }
        });
    }

    // Render Candidates
    function renderCandidates() {
        candidatesBody.innerHTML = "";
        if (candidates.length === 0) {
            candidatesBody.innerHTML = emptyNotice({
                message: "No Candidates Found",
                subMessage: "Add a new candidate to get started."
            });
        } else {
            candidates.forEach((candidate, index) => {
                const row = document.createElement("tr");
                row.className = "hover:bg-platinum transition duration-200";
                row.innerHTML = `
                    <td class="px-6 py-3 whitespace-nowrap text-luxury text-sm font-medium">${candidate.name}</td>
                    <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">${candidate.email}</td>
                    <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">${candidate.reference_code || "N/A"}</td>
                    <td class="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">${formatDateTime(candidate.created_at).formattedDate}</td>
                    <td class="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button title="Edit Candidate" class="text-primary hover:text-gold mr-3 edit-btn" data-id="${candidate.id}"><i class="fas fa-edit text-lg"></i></button>
                        <button title="Delete Candidate" class="text-red-600 hover:text-red-800 delete-btn" data-id="${candidate.id}"><i class="fas fa-trash text-lg"></i></button>
                    </td>
                `;
                row.style.animation = `slideIn 0.5s ease-out ${index * 0.1}s both`;
                candidatesBody.appendChild(row);
            });
        }
    }

    // Render Pending Registrations
    function renderPendingRegistrations() {
        pendingRegistrations.innerHTML = "";
        if (pendingRegistrationsData.length === 0) {
            pendingRegistrations.innerHTML = emptyNotice({
                message: "No Pending Registrations",
                subMessage: "No candidates have registered yet."
            });
        } else {
            pendingRegistrationsData.forEach((reg, index) => {
                const card = document.createElement("div");
                card.className = "bg-white/90 p-6 rounded-lg shadow-premium hover:shadow-md transition duration-200 animate-slide-in";
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = `
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 class="text-lg font-semibold text-luxury">${reg.name}</h3>
                            <p class="text-gray-600 text-sm">Event: ${events.find((event) => event.id === reg.event_id)?.name || 'N/A'}</p>
                            <p class="text-gray-600 text-sm">Submitted: ${formatDateTime(reg.created_at).formattedDate}</p>
                        </div>
                        <button class="btn bg-gradient-premium text-white font-semibold py-2 px-6 rounded-full shadow-premium view-registration" data-id="${reg.id}"><i class="fas fa-eye mr-2"></i>View Details</button>
                    </div>
                `;
                pendingRegistrations.appendChild(card);
            });
        }
    }

    async function fetchCategoryDetail(categoryId) {
        try {
            const response = await fetchData(`GET`, `${baseUrl}/categories/${categoryId}`);
            if (response.success) {
                return response.category;
            } else {
                return { name: `Category ${categoryId}` };
            }
        } catch (e) {
            console.error("Error fetching category:", e);
            return { name: `Category ${categoryId}` };
        }
    }

    // Show Registration Details
    async function showRegistrationDetails(registrationId) {
        const registration = pendingRegistrationsData.find(r => r.id === registrationId);
        if (!registration) return;

        registrationDetails.innerHTML = `
            <p class="flex items-center"><i class="fas fa-user mr-2 text-gold"></i><strong class="font-semibold">Name:</strong> <span class="ml-2">${registration.name}</span></p>
            <p class="flex items-center"><i class="fas fa-envelope mr-2 text-gold"></i><strong class="font-semibold">Email:</strong> <span class="ml-2">${registration.email}</span></p>
            ${registration.bio ? `<p class="flex items-center"><i class="fas fa-info-circle mr-2 text-gold"></i><strong class="font-semibold">Bio:</strong> <span class="ml-2">${registration.bio}</span></p>` : ''}
            ${registration.position ? `<p class="flex items-center"><i class="fas fa-briefcase mr-2 text-gold"></i><strong class="font-semibold">Position:</strong> <span class="ml-2">${registration.position}</span></p>` : ''}
            ${registration.photo_url ? `<img src="${registration.photo_url}" alt="Candidate Photo" class="w-32 h-32 rounded-lg mt-2">` : ''}
            <p class="flex items-center"><i class="fas fa-calendar-alt mr-2 text-gold"></i><strong class="font-semibold">Event:</strong> <span class="ml-2">${events.find((event) => event.id === registration.event_id)?.name || 'N/A'}</span></p>
            <p class="flex items-center"><i class="fas fa-list mr-2 text-gold"></i><strong class="font-semibold">Categories:</strong> <span class="ml-2">${registration.category_ids.length > 0 ? (await Promise.all(registration.category_ids.map(async (catId) => {
                const category = await fetchCategoryDetail(catId);
                return category.name;
            }))).join(", ") : 'None'}</span></p>
            <p class="flex items-center"><i class="fas fa-clock mr-2 text-gold"></i><strong class="font-semibold">Submitted:</strong> <span class="ml-2">${formatDateTime(registration.created_at).formattedDate}</span></p>
        `;
        currentRegistrationId = registrationId;
        registrationModal.classList.remove("hidden");
    }

    // Add Custom Field
    function addCustomField(name = "", type = "text") {
        const fieldId = `custom-field-${customFieldCount++}`;
        const fieldDiv = document.createElement("div");
        fieldDiv.id = fieldId;
        fieldDiv.className = "flex items-center space-x-3 bg-platinum p-3 rounded-lg shadow-sm animate-slide-in";
        fieldDiv.innerHTML = `
            <input type="text" class="field-name w-1/2 p-2 rounded-lg bg-white focus:ring-0 focus:shadow-sm" placeholder="Field Name" value="${name}">
            <select class="field-type w-1/3 p-2 rounded-lg bg-white focus:ring-0 focus:shadow-sm text-sm">
                <option value="text" ${type === "text" ? "selected" : ""}>Text</option>
                <option value="textarea" ${type === "textarea" ? "selected" : ""}>Textarea</option>
                <option value="number" ${type === "number" ? "selected" : ""}>Number</option>
                <option value="file" ${type === "file" ? "selected" : ""}>File</option>
            </select>
            <button type="button" class="remove-field text-red-600 hover:text-red-800"><i class="fas fa-trash text-lg"></i></button>
        `;
        customFieldsContainer.appendChild(fieldDiv);
    }

    // Remove Custom Field
    customFieldsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-field") || e.target.parentElement.classList.contains("remove-field")) {
            e.target.closest("div").remove();
        }
    });

    // Add Custom Field Button
    addCustomFieldBtn.addEventListener("click", () => addCustomField());

    // Tab Switching
    function switchTab(activeTab, activeContent) {
        [tabCandidates, tabPending, tabFormSettings].forEach(tab => tab.classList.remove("active", "bg-gradient-premium", "text-white"));
        [candidatesTab, pendingTab, formSettingsTab].forEach(content => content.classList.add("hidden"));
        activeTab.classList.add("active", "bg-gradient-premium", "text-white");
        activeContent.classList.remove("hidden");
    }

    tabCandidates.addEventListener("click", () => switchTab(tabCandidates, candidatesTab));
    tabPending.addEventListener("click", () => {
        switchTab(tabPending, pendingTab);
        fetchPendingRegistrations();
    });
    tabFormSettings.addEventListener("click", () => switchTab(tabFormSettings, formSettingsTab));

    // Event Dropdown Change (Candidate Form)
    eventDropdown.addEventListener("change", (e) => {
        const eventId = e.target.value;
        categoryDropdown.innerHTML = '<option value="">Select Category</option>';
        selectedCategories.innerHTML = "";
        if (eventId) fetchCategories(eventId);
    });

    // Form Event Dropdown Change (Form Settings)
    formEvent.addEventListener("change", (e) => {
        const eventId = e.target.value;
        if (eventId) {
            fetchFormSettings(eventId);
        } else {
            customFieldsContainer.innerHTML = "";
            customFieldCount = 0;
        }
    });

    // Category Dropdown Change
    categoryDropdown.addEventListener("change", () => {
        const selectedCategoryId = categoryDropdown.value;
        const selectedCategoryName = categoryDropdown.options[categoryDropdown.selectedIndex].text;

        if (selectedCategoryId && !document.getElementById(`category-${selectedCategoryId}`)) {
            const categoryTag = document.createElement("div");
            categoryTag.id = `category-${selectedCategoryId}`;
            categoryTag.className = "flex items-center bg-platinum px-3 py-1 rounded-full m-1 animate-slide-in";
            categoryTag.innerHTML = `
                <span class="mr-2 text-luxury text-sm">${selectedCategoryName}</span>
                <button type="button" class="text-red-600 hover:text-red-800 remove-category" data-id="${selectedCategoryId}">×</button>
                <input type="hidden" name="category_ids[]" value="${selectedCategoryId}">
            `;
            selectedCategories.appendChild(categoryTag);
        }
    });

    // Remove Category
    selectedCategories.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-category")) {
            const categoryId = e.target.getAttribute("data-id");
            document.getElementById(`category-${categoryId}`).remove();
        }
    });

    // Add Candidate Button
    addCandidateBtn.addEventListener("click", () => {
        formTitle.textContent = "Add New Candidate";
        candidateFormElement.reset();
        selectedCategories.innerHTML = "";
        eventDropdown.value = "";
        categoryDropdown.innerHTML = '<option value="">Select Category</option>';
        statusDropDown.value = "";
        candidateForm.classList.remove("hidden");
        isEditing = false;
        editingCandidateId = null;
    });

    // Cancel Button
    cancelBtn.addEventListener("click", () => {
        candidateForm.classList.add("hidden");
        isEditing = false;
        editingCandidateId = null;
    });

    // Form Submission (Candidate)
    candidateFormElement.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(candidateFormElement);
        const candidateData = Object.fromEntries(formData.entries());
        candidateData.category_ids = Array.from(document.querySelectorAll('input[name="category_ids[]"]')).map(input => input.value) || [];
        try {
            let response;
            if (isEditing && editingCandidateId) {
                response = await fetchData("PUT", `${baseUrl}/candidates/${editingCandidateId}`, candidateData);
                if (response.success) {
                    showNotification("Candidate updated successfully!", "success");
                } else {
                    showNotification(`Failed to update candidate: ${response.error || "Unknown error"}`, "error");
                    return;
                }
            } else {
                candidateData.event_id = candidateData.event_id;
                response = await fetchData("POST", `${baseUrl}/candidates`, candidateData);
                if (response.success) {
                    showNotification("Candidate saved successfully!", "success");
                } else {
                    showNotification(`Failed to save candidate: ${response.error || "Unknown error"}`, "error");
                    return;
                }
            }
            await fetchCandidates();
            candidateForm.classList.add("hidden");
            isEditing = false;
            editingCandidateId = null;
        } catch (err) {
            showNotification("An error occurred while saving.", "error");
        }
    });

    // Form Submission (Form Settings)
    formSettingsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const eventId = formEvent.value;
        if (!eventId) {
            showNotification("Please select an event.", "error");
            return;
        }

        const fields = [
            { name: "name", type: "text", required: true },
            { name: "email", type: "email", required: true }
        ];

        const customFieldElements = customFieldsContainer.querySelectorAll(".flex");
        const customFields = Array.from(customFieldElements).map((el, index) => {
            const nameInput = el.querySelector(".field-name");
            const typeSelect = el.querySelector(".field-type");
            const name = nameInput.value.trim();
            if (!name) {
                throw new Error(`Custom field ${index + 1} name is empty`);
            }
            return { name, type: typeSelect.value, required: false };
        });

        const allFieldNames = fields.concat(customFields).map(f => f.name);
        if (new Set(allFieldNames).size !== allFieldNames.length) {
            showNotification("Field names must be unique.", "error");
            return;
        }

        const formSettings = {
            event_id: eventId,
            fields: fields.concat(customFields)
        };

        try {
            const response = await fetchData("POST", `${baseUrl}/candidates/form/${eventId}`, formSettings);
            if (response.success) {
                showNotification("Form settings saved successfully!", "success");
                formSettingsForm.reset();
                formEvent.value = "";
                customFieldsContainer.innerHTML = "";
                customFieldCount = 0;
            } else {
                showNotification(`Failed to save form settings: ${response.error || "Unknown error"}`, "error");
            }
        } catch (err) {
            showNotification("An error occurred while saving form settings.", "error");
        }
    });

    // Registration Modal Actions
    closeModal.addEventListener("click", () => {
        registrationModal.classList.add("hidden");
        currentRegistrationId = null;
    });

    approveBtn.addEventListener("click", async () => {
        if (!currentRegistrationId) return;
        try {
            const response = await fetchData("PUT", `${baseUrl}/candidates/${currentRegistrationId}`, { status: "approved" });
            if (response.success) {
                showNotification("Registration approved successfully!", "success");
                await fetchPendingRegistrations();
                await fetchCandidates();
                registrationModal.classList.add("hidden");
                currentRegistrationId = null;
            } else {
                showNotification(`Failed to approve registration: ${response.error || "Unknown error"}`, "error");
            }
        } catch (err) {
            showNotification("An error occurred while approving.", "error");
        }
    });

    rejectBtn.addEventListener("click", async () => {
        if (!currentRegistrationId) return;
        try {
            const response = await fetchData("PUT", `${baseUrl}/candidates/${currentRegistrationId}`, { status: "rejected" });
            if (response.success) {
                showNotification("Registration rejected successfully!", "success");
                await fetchPendingRegistrations();
                registrationModal.classList.add("hidden");
                currentRegistrationId = null;
            } else {
                showNotification(`Failed to reject registration: ${response.error || "Unknown error"}`, "error");
            }
        } catch (err) {
            showNotification("An error occurred while rejecting.", "error");
        }
    });

    // View Registration Details
    pendingRegistrations.addEventListener("click", (e) => {
        const target = e.target.closest(".view-registration");
        if (target) {
            const registrationId = target.getAttribute("data-id");
            showRegistrationDetails(registrationId);
        }
    });

    // Edit/Delete Buttons
    candidatesBody.addEventListener("click", async (e) => {
        const target = e.target.closest(".edit-btn, .delete-btn");
        if (!target) return;

        const candidateId = target.getAttribute("data-id");
        const candidate = candidates.find(c => c.id === candidateId);

        if (target.classList.contains("edit-btn")) {
            formTitle.textContent = "Edit Candidate";
            candidateFormElement.name.value = candidate.name;
            candidateFormElement.email.value = candidate.email;
            candidateFormElement.status.value = candidate.status || "pending";
            candidateForm.classList.remove("hidden");
            isEditing = true;
            editingCandidateId = candidateId;

            if (candidate.event_id) {
                eventDropdown.value = candidate.event_id;
                await fetchCategories(candidate.event_id);
            }
            if (candidate.category_ids && candidate.category_ids.length > 0) {
                selectedCategories.innerHTML = "";
                candidate.category_ids.forEach((catId, index) => {
                    const categoryOption = categoryDropdown.querySelector(`option[value="${catId}"]`);
                    if (categoryOption) {
                        const categoryName = categoryOption.textContent;
                        const categoryTag = document.createElement("div");
                        categoryTag.id = `category-${catId}`;
                        categoryTag.className = "flex items-center bg-platinum px-3 py-1 rounded-full m-1 animate-slide-in";
                        categoryTag.style.animationDelay = `${index * 0.1}s`;
                        categoryTag.innerHTML = `
                            <span class="mr-2 text-luxury text-sm">${categoryName}</span>
                            <button type="button" class="text-red-600 hover:text-red-800 remove-category" data-id="${catId}">×</button>
                            <input type="hidden" name="category_ids[]" value="${catId}">
                        `;
                        selectedCategories.appendChild(categoryTag);
                    }
                });
            }
        } else if (target.classList.contains("delete-btn")) {
            if (confirm("Are you sure you want to delete this candidate?")) {
                try {
                    await fetchData("DELETE", `${baseUrl}/candidates/${candidateId}`);
                    showNotification("Candidate deleted successfully!", "success");
                    await fetchCandidates();
                } catch (err) {
                    showNotification("Failed to delete candidate.", "error");
                }
            }
        }
    });

    // Initial Load
    await Promise.all([
        fetchEvents(),
        fetchCandidates(),
        switchTab(tabCandidates, candidatesTab)
    ]);
});