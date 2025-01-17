import {fetchData} from "./fetchData.js";
import {baseUrl} from "./constants.js";
import {createCandidateCard} from "./components/createCandidateCard.js";

export async function fetchCandidates() {
    try {
        const candidateList = document.querySelector('#candidate-list');
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get("category");
        const eventId = urlParams.get("eventId");
        let response = "";
        if(eventId){
            response = await fetchData("GET", `${baseUrl}/candidates?event_id=${eventId}`);
        }else{
            response = await fetchData("GET", `${baseUrl}/candidates`);
        }

        const {success, candidates} = response;

        candidates.forEach(candidate => {
            if (("archived" in candidate && candidate.archived === true)||
                ("category_ids" in candidate && candidate.category_ids.length === 0)) {
                return;
            }
            const {name, id, description, categoryId} = candidate;
            const candidateCard = createCandidateCard(candidate);
            candidateList.appendChild(candidateCard);
        });
    } catch (error) {
        console.error("Error fetching candidates:", error);
    }
}