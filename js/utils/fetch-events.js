import {fetchData} from "./fetchData.js";
import {baseUrl} from "./constants.js";
import {formatDateTime} from "./dateTimeFormatter.js";

/**
 * Fetches all events from the API and returns a formatted array of events
 * @returns {Promise<Awaited<Event>[]>}
 */
export default async function fetchEvent() {
    try {
        const response = await fetchData("GET", `${baseUrl}/events`);
        const {success, events} = response;

        if (success) {

            // Prepare promises for fetching all event thumbnail URLs
            const eventPromises = events.map(async event => {
                const {id, name: eventName, description: eventDescription} = event;
                let start_date = "";
                let end_date = "";

                if ("startDate" in event) {
                    start_date = event.startDate;
                    end_date = event.endDate;
                } else {
                    start_date = event.start_date;
                    end_date = event.end_date;
                }


                // Format dates
                const {formattedDate: eventDate, formattedTime: eventTime} = formatDateTime(start_date);
                const {formattedDate: eventEndDate, formattedTime: eventEndTime} = formatDateTime(end_date);

                // Fetch thumbnail URL

                // Create and return formatted event object
                return {
                    eventName,
                    id,
                    eventDescription,
                    eventDate,
                    eventTime,
                    eventEndDate,
                    eventEndTime,
                };
            });

            // Wait for all promises to resolve and append event cards to the DOM
            const formattedEvents = await Promise.all(eventPromises);

            return formattedEvents;
        } else {
            console.error("Error fetching events:", response);
        }
    } catch (e) {
        console.error("Error fetching events:", e);
    }
}