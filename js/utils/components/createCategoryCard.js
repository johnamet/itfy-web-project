import { getImageUrl } from "../getImageUrl.js";

export function createCategoryCard(category) {
    const { name, eventId, description, id } = category;
    console.log("eventId", eventId);

    const card = document.createElement("div");
    card.className = "bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105";

    const img = document.createElement("img");
    img.className = "w-full h-48 object-cover";
    img.alt = name;

    getImageUrl("categories", id, img).then((url) => {
        img.src = url || "/images/default-category.jpg";
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const colorThief = new ColorThief();
            const dominantColor = colorThief.getColor(img);
            card.style.borderTop = `4px solid rgb(${dominantColor.join(",")})`;
        };
    });

    const cardContent = document.createElement("div");
    cardContent.className = "p-4";

    const h3 = document.createElement("h3");
    h3.className = "text-xl font-semibold mb-2";
    h3.textContent = name;

    const descriptionElement = document.createElement("p");
    descriptionElement.className = "text-gray-600 mb-4 line-clamp-3";
    descriptionElement.textContent = description;

    const anchor = document.createElement("a");
    anchor.href = `./pages/candidates.html?category=${id}&event_id=${eventId}`;
    anchor.className = "inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300";
    anchor.textContent = "See Contestants";

    cardContent.appendChild(h3);
    cardContent.appendChild(descriptionElement);
    cardContent.appendChild(anchor);

    card.appendChild(img);
    card.appendChild(cardContent);

    return card;
}

