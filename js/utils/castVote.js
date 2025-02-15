import {fetchData} from "./fetchData.js";
import {baseUrl} from "./constants.js";

export async function castVote(candidate_id, event_id, category_id) {
    try {
        const response = await fetchData("POST", `${baseUrl}/votes`,
            {candidate_id, category_id, event_id});
        if (response.success) {
            console.log(`Vote cast successfully for candidate ID: ${candidate_id}`);
        } else {
            console.error(`Failed to cast vote: ${response.error}`);
        }
    } catch (error) {
        console.error("Error casting vote:", error);
    }
}