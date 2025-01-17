import { getImageUrl } from "../getImageUrl.js";
import { fetchData } from "../fetchData.js";
import { castVote } from "../castVote.js";
import { fetchVotes } from "../fetchVotes.js";
import { baseUrl, socket } from "../constants.js";

export function createCandidateCard(candidate) {
    const { name, id, description, event_id, category_ids } = candidate;

    const card = document.createElement("div");
    card.className = "bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105";

    const img = document.createElement("img");
    img.className = "w-full h-48 object-cover";
    img.alt = name;

    getImageUrl("candidates", id, img).then((url) => {
        img.src = url || "/images/default-candidate.jpg";
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

    cardContent.appendChild(h3);
    cardContent.appendChild(descriptionElement);

    // Fetch category names
    const categoryPromises = category_ids.map(async (category_id) => {
        const fetchedCat = await fetchData("GET", `${baseUrl}/categories/${category_id}`);
        return fetchedCat.category.name;
    });

    Promise.all(categoryPromises).then((categoryNames) => {
        const categoriesElement = document.createElement("div");
        categoriesElement.className = "mb-4";

        categoryNames.forEach((categoryName) => {
            const category = document.createElement("span");
            category.className = "inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2";
            category.textContent = categoryName;
            categoriesElement.appendChild(category);
        });

        cardContent.appendChild(categoriesElement);

        const voteButton = document.createElement("button");
        voteButton.className = "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 mr-2";
        voteButton.textContent = "Vote";

        voteButton.addEventListener("click", async () => {
            try {
                window.location.href = `../../../pages/vote-candidate.html?candidate=${id}&event=${event_id}&categories=${category_ids.join(",")}`;
            } catch (error) {
                console.error("Error casting vote:", error);
                alert("Failed to cast vote. Please try again.");
            }
        });

        const votes = document.createElement("span");
        votes.className = "text-gray-600";
        votes.textContent = "Votes: 0";

        fetchVotes(id).then((success) => {
            if (success) {
                const totalVotes = success.votes.reduce((sum, voteObj) => sum + voteObj.votes, 0);
                votes.textContent = `Votes: ${totalVotes}`;

                socket.on(`voteUpdate:${id}`, (data) => {
                    const updatedTotalVotes = data.reduce((sum, voteObj) => sum + voteObj.votes, 0);
                    votes.textContent = `Votes: ${updatedTotalVotes}`;
                });
            }
        });

        const voteContainer = document.createElement("div");
        voteContainer.className = "flex items-center justify-between mt-4";
        voteContainer.appendChild(voteButton);
        voteContainer.appendChild(votes);

        cardContent.appendChild(voteContainer);
    });

    card.appendChild(img);
    card.appendChild(cardContent);

    return card;
}

