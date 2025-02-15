import fetchEvent from "./utils/fetch-events.js";
import {fetchData} from "./utils/fetchData.js";
import {baseUrl} from "./utils/constants.js";

document.addEventListener("DOMContentLoaded", async () => {
    const createCategoryBtn = document.getElementById("createCategoryBtn")
    const categoryFormSection = document.getElementById("category-form")
    const categoryListSection = document.getElementById("category-list")
    const formTitle = document.getElementById("formTitle")
    const cancelBtn = document.getElementById("cancelBtn")
    const categoryForm = document.querySelector("#category-form form")
    const categoryTable = document.querySelector("#category-list tbody")
    const categoryPagination = document.getElementById("category-pagination")
    const associatedEventSelect = document.getElementById("associatedEvent")

    // Simulated category data
    let categories = []

    try{
        const catResp = await fetchData("GET", `${baseUrl}/categories`);

        if (catResp.success){
            categories = catResp.categories;
        }
    }catch (e) {
        console.error("Error fetching categories:", e);
    }

    // Simulated event data
    const events = await fetchEvent();

    console.log("Events", events)

    // Populate associated event dropdown
    events.forEach((event) => {
        const option = document.createElement("option")
        option.value = event.id
        option.textContent = event.eventName
        associatedEventSelect.appendChild(option)
    })

    createCategoryBtn.addEventListener("click", () => {
        formTitle.textContent = "Create New Category"
        categoryForm.reset()
        categoryFormSection.style.display = "block"
        categoryListSection.style.display = "none"
    })

    cancelBtn.addEventListener("click", () => {
        categoryFormSection.style.display = "none"
        categoryListSection.style.display = "block"
    })

    categoryForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const formData = new FormData(categoryForm)
        const newCategory = {
            name: formData.get("categoryName"),
            eventId: formData.get("associatedEvent"),
            description: formData.get("categoryDescription"),
        }

        console.log(newCategory);

        const pushCat = await fetchData("POST", `${baseUrl}/categories`, newCategory);
        if (pushCat.success){
            const createdCat = pushCat.category;
            categories.push(createdCat);
        }else{
            console.log("Error creating category:", pushCat.error);
        }
        renderCategories()
        categoryFormSection.style.display = "none"
        categoryListSection.style.display = "block"
    })

    async function renderCategories() {
        categoryTable.innerHTML = ""
        for (const category of categories) {
            const row = document.createElement("tr")
            row.innerHTML = `
                <td>${category.name}</td>
                <td>${await events.find((event) => event.id === category.eventId).eventName}</td>
                <td>${category.description}</td>
                <td>
                    <button class="edit-btn" data-id="${category.id}">Edit</button>
                    <button class="delete-btn" data-id="${category.id}">Delete</button>
                </td>
            `
            categoryTable.appendChild(row)
        }

        // Add event listeners for edit and delete buttons
        document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", editCategory)
        })
        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", deleteCategory)
        })
    }

    function editCategory(e) {
        const categoryId = Number.parseInt(e.target.getAttribute("data-id"))
        const category = categories.find((c) => c.id === categoryId)
        if (category) {
            formTitle.textContent = "Edit Category"
            categoryForm.categoryName.value = category.name
            categoryForm.associatedEvent.value = events.find((e) => e.name === category.event).id
            categoryForm.categoryDescription.value = category.description
            categoryFormSection.style.display = "block"
            categoryListSection.style.display = "none"

            // Update form submission handler for editing
            categoryForm.onsubmit = (e) => {
                e.preventDefault()
                const formData = new FormData(categoryForm)
                category.name = formData.get("categoryName")
                category.event = formData.get("associatedEvent")
                category.description = formData.get("categoryDescription")
                renderCategories()
                categoryFormSection.style.display = "none"
                categoryListSection.style.display = "block"
                // Reset form submission handler
                categoryForm.onsubmit = null
            }
        }
    }

    function deleteCategory(e) {
        const categoryId = e.target.getAttribute("data-id")
        categories = categories.filter((c) => c.id !== categoryId)
        renderCategories()
    }

    // Initial render
    renderCategories()
})

