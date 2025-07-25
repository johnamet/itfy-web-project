import {baseUrl} from "./constants.js";
import {fetchData} from "./fetchData.js";
import {formatDateTime} from "./dateTimeFormatter.js";
import {getImageUrl} from "./getImageUrl.js";

export async function fetchEventDetails(id, addRelatedEvents = true) {
    const url = `${baseUrl}/events/${id}`;
    const response = await fetchData("GET", url);
    let event = {}

    if (response.success) {
        const fetchedEvent = response["event"];

        console.log(fetchedEvent);

        const {id, description, start_date, end_date, 0: otherInfo, name} = fetchedEvent;

        const {formattedDate: startDate, formattedTime: startTime} = formatDateTime(start_date);
        const {formattedDate: endDate, formattedTime: endTime} = formatDateTime(end_date);

        const date = `${startDate} - ${startTime} to ${endDate} - ${endTime}`
        event = {
            id,
            name,
            description,
            date,
            timeline: "event_timeline" in otherInfo ? otherInfo["event_timeline"] : [],
            location: otherInfo["location"]
        }

        const categoriesResp = await fetchData("GET", `${baseUrl}/categories?eventId=${id}`);
        const image = await getImageUrl("events", id) || "./images/Asset-1.png";

        if (image) {
            event = {
                image,
                ...event
            }
        }
        if (categoriesResp.success) {
            event = {
                categories: categoriesResp["categories"],
                ...event
            }
        } else {
            event = {
                categories: [],
                ...event
            }
        }

        const relatedEvents = [];

        if ("related_events" in otherInfo && otherInfo["related_events"].length > 0) {
            const eventsResp = otherInfo.related_events.map(async (eventId) => {
                const event = await fetchData("GET", `${baseUrl}/events/${eventId}`);
                print(event);
                return event.event;
            });

            Promise.all(eventsResp).then((relEvent) => {
                relatedEvents.push(relEvent);
            })

            event = {
                relatedEvents,
                related_events: otherInfo.related_events,
                ...event
            }
        } else {
            event = {
                relatedEvents,
                related_events: otherInfo.related_events,
                ...event
            }
        }


        console.log(event);
    }
    return event
}

export async function registerForEvent(eventId) {
    // In a real application, you would send a request to your API to register the user
    // For this example, we'll simulate a delay and then resolve
    await new Promise(resolve => setTimeout(resolve, 1500))
}