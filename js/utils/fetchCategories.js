import {fetchData} from "./fetchData.js";
import {createCategoryCard} from "./components/createCategoryCard.js";
import {emptyNotice} from "./emptyNotice.js";
import {baseUrl} from "./constants.js";

export async function fetchCategories() {
    try {
        const response = await fetchData("GET", `${baseUrl}/categories`);
        const {success, categories} = response;

        if (success) {
            const categoryList = document.querySelector('#category-list');

            // Prepare promises for fetching all category thumbnail URLs
            const categoryPromises = categories.map(async category => {
                console.log("hi me", category);
                const {id, name, description, eventId} = category;

                // Create and return formatted category object
                return {
                    name,
                    id,
                    description,
                    eventId,
                };
            });

            // Wait for all promises to resolve and append category cards to the DOM
            const formattedCategories = await Promise.all(categoryPromises);

            formattedCategories.forEach(category => {
                if ("archived" in category && category.archived === true) {
                    return;
                }
                const categoryCard = createCategoryCard(category);
                categoryList.appendChild(categoryCard);
            });

            if (formattedCategories.length === 0) {
                const notice = emptyNotice("categories", "No categories available");
                categoryList.appendChild(notice);
            }
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}