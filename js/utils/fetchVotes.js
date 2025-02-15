import {fetchData} from "./fetchData.js";
import {baseUrl} from "./constants.js";

export async function fetchVotes(candidate_id) {
    try {
        const response = await fetchData("GET", `${baseUrl}/votes/${candidate_id}`);
        const {success} = response;

        if (success) {
            return response;
        }
    } catch (error) {
        console.error("Error fetching votes:", error);
    }
}