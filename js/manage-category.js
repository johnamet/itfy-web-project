import fetchEvents from "./utils/fetch-events.js";
import {fetchData, uploadImage} from "./utils/fetchData.js";
import { baseUrl } from "./utils/constants.js";
import {getImageUrl} from "./utils/getImageUrl.js";

document.addEventListener("DOMContentLoaded", async () => {
    const createCategoryBtn = document.getElementById("createCategoryBtn");
    const categoryFormSection = document.getElementById("category-form");
    const categoryListSection = document.getElementById("category-list");
    const formTitle = document.getElementById("formTitle");
    const cancelBtn = document.getElementById("cancelBtn");
    const categoryForm = categoryFormSection.querySelector("form");
    const categoryTable = categoryListSection.querySelector("tbody");
    const categoryPagination = document.getElementById("category-pagination");
    const associatedEventSelect = document.getElementById("associatedEvent");
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
    const closeNotification = document.getElementById("closeNotification");
    const catPhoto = document.getElementById("catPhoto");
    const photoPreview = document.getElementById("photoPreview");
    let categories = [];
    let editingCategoryId = null;

    // Close Notification
    closeNotification.addEventListener("click", () => {
        notification.classList.add("hidden");
        notification.classList.remove("bg-green-600", "bg-red-600", "animate-fade-in");
    });

    // Fetch initial categories
    try {
        const catResp = await fetchData("GET", `${baseUrl}/categories`);
        if (catResp.success) {
            categories = catResp.categories;
        } else {
            showNotification(`Error fetching categories: ${catResp.error || "Unknown error"}`, "error");
        }
    } catch (e) {
        console.error("Error fetching categories:", e);
        showNotification("An error occurred while fetching categories", "error");
    }

    // Fetch events for dropdown
    const events = await fetchEvents();
    associatedEventSelect.innerHTML = '<option value="">Select an Event</option>';
    events.forEach(event => {
        const option = document.createElement("option");
        option.value = event.id;
        option.textContent = event.name;
        associatedEventSelect.appendChild(option);
    });

    // Event listeners
    createCategoryBtn.addEventListener("click", () => {
        formTitle.textContent = "Create New Category";
        categoryForm.reset();
        photoPreview.classList.add("hidden");
        photoPreview.src = "";
        categoryFormSection.classList.remove("hidden");
        categoryListSection.classList.add("hidden");
        editingCategoryId = null;
    });

    cancelBtn.addEventListener("click", () => {
        categoryFormSection.classList.add("hidden");
        categoryListSection.classList.remove("hidden");
        categoryForm.reset();
        photoPreview.classList.add("hidden");
        photoPreview.src = "";
        editingCategoryId = null;
    });

    catPhoto.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            photoPreview.src = URL.createObjectURL(file);
            photoPreview.classList.remove("hidden");
        } else {
            photoPreview.classList.add("hidden");
            photoPreview.src = "";
        }
    });

    categoryForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(categoryForm);
        const categoryData = {
            name: formData.get("categoryName").trim(),
            eventId: formData.get("associatedEvent"),
            description: formData.get("categoryDescription").trim(),
        };

        if (!categoryData.name || !categoryData.eventId || !categoryData.description) {
            showNotification("All fields are required", "error");
            return;
        }

        try {
            let response;
            if (editingCategoryId) {
                // Update existing category (PUT)
                response = await fetchData("PUT", `${baseUrl}/categories/${editingCategoryId}`, categoryData);
                if (response.success) {
                    const photo = formData.get("catPhoto");
                    if (photo && photo.size > 0) {
                        const uploadPhoto = await uploadImage(`${baseUrl}/app/files`, 'categories', editingCategoryId, photo);
                        if (!uploadPhoto.success) {
                            showNotification(`Failed to upload photo: ${uploadPhoto.error || "Unknown error"}`, "error");
                            return;
                        }
                    }
                    const index = categories.findIndex(c => c.id === editingCategoryId);
                    if (index !== -1) {
                        categories[index] = { ...categories[index], ...categoryData, id: editingCategoryId };
                        showNotification("Category updated successfully!", "success");
                    } else {
                        showNotification("Category not found in local data", "error");
                    }
                } else {
                    showNotification(`Failed to update category: ${response.error || "Unknown error"}`, "error");
                    return;
                }
            } else {
                // Create new category (POST)
                response = await fetchData("POST", `${baseUrl}/categories`, categoryData);
                if (response.success) {
                    const photo = formData.get("catPhoto");
                    if (photo && photo.size > 0) {
                        const uploadPhoto = await uploadImage(`${baseUrl}/app/files`, 'categories', response.category.id, photo);
                        if (!uploadPhoto.success) {
                            showNotification(`Failed to upload photo: ${uploadPhoto.error || "Unknown error"}`, "error");
                            return;
                        }
                    }
                    categories.push(response.category);
                    showNotification("Category created successfully!", "success");
                } else {
                    showNotification(`Failed to create category: ${response.error || "Unknown error"}`, "error");
                    return;
                }
            }
            await renderCategories();
            categoryFormSection.classList.add("hidden");
            categoryListSection.classList.remove("hidden");
            categoryForm.reset();
            photoPreview.classList.add("hidden");
            photoPreview.src = "";
            editingCategoryId = null;
        } catch (e) {
            showNotification(`An error occurred while saving: ${e.message || "Unknown error"}`, "error");
            console.error("Error saving category:", e);
        }
    });

    // Render categories
    async function renderCategories() {
        categoryTable.innerHTML = "";
        if (categories.length === 0) {
            categoryTable.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-gray-600 text-sm font-medium">
                        No categories available
                    </td>
                </tr>
            `;
        } else {
            categories.forEach((category, index) => {
                const event = events.find(e => e.id === category.eventId);
                const row = document.createElement("tr");
                row.className = "bg-white/90 hover:bg-platinum transition duration-200 animate-slide-in";
                row.style.animationDelay = `${index * 0.1}s`;
                row.innerHTML = `
                    <td class="px-6 py-4 text-luxury font-medium">${category.name}</td>
                    <td class="px-6 py-4 text-gray-600">${event ? event.name : 'Unknown'}</td>
                    <td class="px-6 py-4 text-gray-600">${category.description}</td>
                    <td class="px-6 py-4 text-right text-sm font-medium">
                        <button class="text-primary hover:text-secondary mr-4 edit-btn" data-id="${category.id}">Edit</button>
                        <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${category.id}">Delete</button>
                    </td>
                `;
                categoryTable.appendChild(row);
            });
        }

        // Add event listeners for edit and delete buttons
        document.querySelectorAll(".edit-btn").forEach(btn => btn.addEventListener("click", editCategory));
        document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", deleteCategory));
    }

    // Edit category
    async function editCategory(e) {
        const categoryId = e.target.getAttribute("data-id");
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            formTitle.textContent = "Edit Category";
            categoryForm.categoryName.value = category.name || "";
            categoryForm.associatedEvent.value = category.eventId || "";
            categoryForm.categoryDescription.value = category.description || "";
            const photoUrl = await getImageUrl("categories", categoryId);
            if (photoUrl) {
                photoPreview.src = photoUrl;
                photoPreview.classList.remove("hidden");
            } else {
                photoPreview.src = "";
                photoPreview.classList.add("hidden");
            }
            categoryFormSection.classList.remove("hidden");
            categoryListSection.classList.add("hidden");
            editingCategoryId = categoryId;
        } else {
            showNotification("Category not found", "error");
            console.error("Category not found:", categoryId);
        }
    }

    // Delete category
    async function deleteCategory(e) {
        const categoryId = Number.parseInt(e.target.getAttribute("data-id"));
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                const response = await fetchData("DELETE", `${baseUrl}/categories/${categoryId}`);
                if (response.success) {
                    categories = categories.filter(c => c.id !== categoryId);
                    await renderCategories();
                    showNotification("Category deleted successfully!", "success");
                } else {
                    showNotification(`Failed to delete category: ${response.error || "Unknown error"}`, "error");
                }
            } catch (e) {
                showNotification(`Error deleting category: ${e.message || "Unknown error"}`, "error");
                console.error("Error deleting category:", e);
            }
        }
    }

    // Show notification
    function showNotification(message, type) {
        notificationMessage.textContent = message;
        notification.classList.remove("hidden");
        notification.classList.add(type === "success" ? "bg-green-600" : "bg-red-600", "animate-fade-in");
        setTimeout(() => {
            notification.classList.add("hidden");
            notification.classList.remove("bg-green-600", "bg-red-600", "animate-fade-in");
        }, 5000);
    }

    // Initial render
    await renderCategories();
});