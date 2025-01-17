import {fetchData} from "./fetchData.js";
import {baseUrl, defaultImageUrl} from "./constants.js";

export async function getImageUrl(category, id, imgElement) {
    const url = `${baseUrl}/app/files/${category}/${id}`;
    try {
        const data = await fetchData("GET", url);
        if (data.success && data.files.length > 0) {
            const fileName = data.files[0].name;
            return `${baseUrl}/app/files/${category}/${id}/${fileName}/open`;
        } else {
            return defaultImageUrl;
        }
    } catch (error) {
        // console.error("Error fetching image URL:", error);
        return defaultImageUrl;
    } finally {
        imgElement.classList.remove('shimmer');
    }
}