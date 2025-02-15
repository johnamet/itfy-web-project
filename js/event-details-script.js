import EventTimeline from "./utils/components/eventTimeline.js";
import {EventDescription} from "./utils/components/eventDescription.js";
import EventHeader from "./utils/components/eventHeader.js";
import RelatedEvents from "./utils/components/relatedEvents.js";
import RegistrationCTA, {handleRegistration} from "./utils/components/eventRegistration.js";
import CategoryList from "./utils/components/categoryList.js";
import {fetchEventDetails} from "./utils/fetchEventDetails.js";
import EmptyNotice from "./utils/components/emptyNotice.js";
import {getImageUrl} from "./utils/getImageUrl.js";
import {fetchData} from "./utils/fetchData.js";
import {baseUrl} from "./utils/constants.js";

document.addEventListener("DOMContentLoaded", async () => {
    const app = document.getElementById("app");
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    // Fetch event details


    const event = await fetchEventDetails(id);

    if (!event) {
        app.innerHTML = "<h1>Event Not Found</h1>";
        return;
    }

    // Populate Event Header
    const eventHeader = document.getElementById("event-header");
    eventHeader.innerHTML = EventHeader({title: event.name, date: event.date, location: event.location});

    // Populate Cover Image
    const eventCover = document.getElementById("event-cover");

    getImageUrl("events", id, eventCover).then((url) => {
        eventCover.src = url || "../images/Pic 1.jpg";
        eventCover.alt = event.title;
    })


    // Populate Event Description
    const eventDescription = document.getElementById("event-description");
    eventDescription.innerHTML = EventDescription({description: event.description});

    // Populate Event Timeline
    const eventTimeline = document.getElementById("event-timeline");
    eventTimeline.innerHTML = EventTimeline({timeline: event.timeline});

    // Populate Category List
    const categoryList = document.getElementById("category-list");

    categoryList.innerHTML = event.categories.length > 0 ? CategoryList({categories: event.categories}) :
        EmptyNotice({message: "No Categories found"});

    // Populate Related Events
    const relatedEvents = document.getElementById("related-events");

    if (event.related_events.length > 0) {
        const relatedEventsPromises = event.related_events.map(async (id) => {
            const relEvent = await fetchData("GET", `${baseUrl}/events/${id}`);
            if (relEvent.success) {
                const image = await getImageUrl("events", relEvent.event.id);
                relEvent.image = image;
                return relEvent.event;
            }
            return null;
        });
    

        const relatedEventsResults = await Promise.all(relatedEventsPromises);
        event.relatedEvents = relatedEventsResults.filter(event => event !== null);
        console.log(event.relatedEvents);
    }

    relatedEvents.innerHTML = event.relatedEvents.length > 0 ? RelatedEvents({relatedEvents: event.relatedEvents}) :
        EmptyNotice({
            message: "No related Events.",
            subMessage: "This is all we have for now. Thank you."
        });

    // Register Button
    const registerCTA = document.getElementById("register-cta");
    registerCTA.innerHTML = RegistrationCTA({title: event.title});
    registerCTA.addEventListener("click", () => {
        handleRegistration(event.id);
        alert(`You have registered for ${event.title}!`);
    });
});
