import {fetchData} from "./fetchData.js";
import {baseUrl} from "./constants.js";
import {getImageUrl} from "./getImageUrl.js";

export async function fetchCandidateData(candidateId) {
    const resp = await fetchData('GET', `${baseUrl}/candidates/${candidateId}`);
    const image = await getImageUrl('candidates', candidateId);

    if (resp.success) {
        resp.candidate.image = image;
        return resp.candidate;
    } else {
        return {};
    }
}