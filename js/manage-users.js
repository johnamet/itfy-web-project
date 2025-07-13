import {fetchData, uploadImage} from "./utils/fetchData.js";
import { baseUrl } from "./utils/constants.js";
import {getImageUrl} from "./utils/getImageUrl.js";

document.addEventListener("DOMContentLoaded", async () => {
    const createUserBtn = document.getElementById("createUserBtn");
    const userFormSection = document.getElementById("user-form");
    const usersListSection = document.getElementById("users-list");
    const formTitle = document.getElementById("formTitle");
    const cancelBtn = document.getElementById("cancelBtn");
    const userForm = document.getElementById("userFormElement");
    const usersTable = document.getElementById("usersTable");
    const userRoleSelect = document.getElementById("userRole");
    const userPhotoInput = document.getElementById("userPhoto");
    const photoPreview = document.getElementById("photoPreview");
    const resetPasswordBtn = document.getElementById("resetPasswordBtn");
    const resetPasswordSection = document.getElementById("resetPasswordSection");
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
    const closeNotification = document.getElementById("closeNotification");
    const usersPagination = document.getElementById("users-pagination");

    let users = [];
    let roles = [];
    let editingUserId = null;
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

    // Fetch users
    async function fetchUsers(page = 1) {
        try {
            const response = await fetchData("GET", `${baseUrl}/users?page=${page}&size=${pageSize}`);
            if (response.success) {
                users = response.users;
                currentPage = page;
                await renderUsers();
                renderPagination(response.totalPages, page);
            } else {
                showNotification(`Failed to fetch users: ${response.error || "Unknown error"}`, "error");
            }
        } catch (e) {
            showNotification(`Error fetching users: ${e.message || "Unknown error"}`, "error");
            console.error("Error fetching users:", e);
        }
    }

    // Fetch roles
    async function fetchRoles() {
        try {
            const response = await fetchData("GET", `${baseUrl}/roles`);
            if (response.success) {
                roles = response.roles;
                userRoleSelect.innerHTML = '<option value="">Select a Role</option>';
                roles.forEach(role => {
                    const option = document.createElement("option");
                    option.value = role.id;
                    option.textContent = role.name;
                    userRoleSelect.appendChild(option);
                });
            } else {
                showNotification(`Failed to fetch roles: ${response.error || "Unknown error"}`, "error");
            }
        } catch (e) {
            showNotification(`Error fetching roles: ${e.message || "Unknown error"}`, "error");
            console.error("Error fetching roles:", e);
        }
    }

    // Render users
    async function renderUsers() {
        usersTable.innerHTML = "";
        if (users.length === 0) {
            usersTable.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-600 text-sm font-medium">
                        No users available
                    </td>
                </tr>
            `;
        } else {
            for (const user of users) {
                const index = users.indexOf(user);
                const photo = await getImageUrl("users", user.id);
                const role = roles.find(r => r.id === user.roleId)?.name || "Unknown";
                const row = document.createElement("tr");
                row.className = "bg-white/90 hover:bg-platinum transition duration-200 animate-slide-in";
                row.style.animationDelay = `${index * 0.1}s`;
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <img crossorigin="anonymous" src="${photo || '../images/placeholder-user.jpg'}" alt="${user.name}" class="w-10 h-10 rounded-full object-cover">
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-luxury font-medium">${user.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-600">${user.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-600">${role}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-primary hover:text-secondary mr-4 edit-btn" data-id="${user.id}">Edit</button>
                        <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${user.id}">Delete</button>
                    </td>
                `;
                usersTable.appendChild(row);
            }
        }

        // Add event listeners for edit and delete buttons
        document.querySelectorAll(".edit-btn").forEach(btn => btn.addEventListener("click", editUser));
        document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", deleteUser));
    }

    // Render pagination
    function renderPagination(totalPages, currentPage) {
        usersPagination.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.className = `px-3 py-1 rounded-full font-medium ${
                i === currentPage ? "bg-gradient-premium text-white" : "bg-platinum text-luxury hover:bg-secondary hover:text-white"
            } mr-2 transition-all duration-200`;
            button.addEventListener("click", () => fetchUsers(i));
            usersPagination.appendChild(button);
        }
    }

    // Event listeners
    createUserBtn.addEventListener("click", () => {
        formTitle.textContent = "Add New User";
        userForm.reset();
        photoPreview.classList.add("hidden");
        photoPreview.src = "";
        resetPasswordSection.classList.add("hidden");
        userFormSection.classList.remove("hidden");
        usersListSection.classList.add("hidden");
        editingUserId = null;
    });

    cancelBtn.addEventListener("click", () => {
        userFormSection.classList.add("hidden");
        usersListSection.classList.remove("hidden");
        userForm.reset();
        photoPreview.classList.add("hidden");
        photoPreview.src = "";
        editingUserId = null;
    });

    userPhotoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            photoPreview.src = URL.createObjectURL(file);
            photoPreview.classList.remove("hidden");
        } else {
            photoPreview.classList.add("hidden");
            photoPreview.src = "";
        }
    });

    resetPasswordBtn.addEventListener("click", async () => {
        if (editingUserId) {
            try {
                const response = await fetchData("POST", `${baseUrl}/users/${editingUserId}/reset-password`);
                if (response.success) {
                    showNotification("Password reset successfully! New password sent to user.", "success");
                } else if (response.error === "Insufficient permissions") {
                    showNotification("Insufficient permissions. Contact a senior administrator to reset passwords.", "error");
                } else {
                    showNotification(`Failed to reset password: ${response.error || "Unknown error"}`, "error");
                }
            } catch (e) {
                showNotification(`Error resetting password: ${e.message || "Unknown error"}`, "error");
                console.error("Error resetting password:", e);
            }
        }
    });

    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(userForm);
        const userData = {
            name: formData.get("userName").trim(),
            email: formData.get("userEmail").trim(),
            roleId: formData.get("userRole"),
        };

        if (!userData.name || !userData.email || !userData.roleId) {
            showNotification("All fields are required", "error");
            return;
        }

        try {
            let response;
            if (editingUserId) {
                response = await fetchData("PUT", `${baseUrl}/users/${editingUserId}`, userData);
                if (response.success) {
                    const photo = formData.get("userPhoto");
                    if (photo && photo.size > 0) {
                        const uploadPhoto = await uploadImage(`${baseUrl}/app/files`, 'users', editingUserId, photo);
                        if (!uploadPhoto.success) {
                            showNotification(`Failed to upload photo: ${uploadPhoto.error || "Unknown error"}`, "error");
                            return;
                        }
                    }
                    const index = users.findIndex(u => u.id === editingUserId);
                    users[index] = { ...users[index], ...userData, id: editingUserId };
                    showNotification("User updated successfully!", "success");
                } else if (response.error === "Insufficient permissions") {
                    showNotification("Insufficient permissions. Contact a senior administrator to update users.", "error");
                    return;
                } else {
                    showNotification(`Failed to update user: ${response.error || "Unknown error"}`, "error");
                    return;
                }
            } else {
                response = await fetchData("POST", `${baseUrl}/users`, userData, true);
                if (response.success) {
                    const photo = formData.get("userPhoto");
                    if (photo && photo.size > 0) {
                        const uploadPhoto = await uploadImage(`${baseUrl}/app/files`, 'users', response.user.id, photo);
                        if (!uploadPhoto.success) {
                            showNotification(`Failed to upload photo: ${uploadPhoto.error || "Unknown error"}`, "error");
                            return;
                        }
                    }
                    users.push(response.user);
                    showNotification("User created successfully!", "success");
                } else if (response.error === "Insufficient permissions") {
                    showNotification("Insufficient permissions. Contact a senior administrator to create users.", "error");
                    return;
                } else {
                    showNotification(`Failed to create user: ${response.error || "Unknown error"}`, "error");
                    return;
                }
            }
            await fetchUsers(currentPage);
            userFormSection.classList.add("hidden");
            usersListSection.classList.remove("hidden");
            userForm.reset();
            photoPreview.classList.add("hidden");
            photoPreview.src = "";
            editingUserId = null;
        } catch (e) {
            showNotification(`An error occurred while saving: ${e.message || "Unknown error"}`, "error");
            console.error("Error saving user:", e);
        }
    });

    // Edit user
    async function editUser(e) {
        const userId = e.target.getAttribute("data-id");
        const user = users.find(u => u.id === userId);
        if (user) {
            formTitle.textContent = "Edit User";
            userForm.userName.value = user.name || "";
            userForm.userEmail.value = user.email || "";
            userForm.userRole.value = user.roleId || "";
            const photo = await getImageUrl("users", userId);
            if (photo) {
                photoPreview.src = photo;
                photoPreview.classList.remove("hidden");
            } else {
                photoPreview.classList.add("hidden");
                photoPreview.src = "";
            }
            resetPasswordSection.classList.remove("hidden");
            userFormSection.classList.remove("hidden");
            usersListSection.classList.add("hidden");
            editingUserId = userId;
        } else {
            showNotification("User not found", "error");
            console.error("User not found:", userId);
        }
    }

    // Delete user
    async function deleteUser(e) {
        const userId = e.target.getAttribute("data-id");
        if (userId === JSON.parse(sessionStorage.getItem("user")).id) {
            showNotification("You cannot delete yourself", "error");
            return;
        }
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                const response = await fetchData("DELETE", `${baseUrl}/users/${userId}`);
                if (response.success) {
                    users = users.filter(u => u.id !== userId);
                    await fetchUsers(currentPage);
                    showNotification("User deleted successfully!", "success");
                } else if (response.error === "Insufficient permissions") {
                    showNotification("Insufficient permissions. Contact a senior administrator to delete users.", "error");
                } else {
                    showNotification(`Failed to delete user: ${response.error || "Unknown error"}`, "error");
                }
            } catch (e) {
                showNotification(`Error deleting user: ${e.message || "Unknown error"}`, "error");
                console.error("Error deleting user:", e);
            }
        }
    }

    // Initial load
    await fetchRoles();
    await fetchUsers();
});