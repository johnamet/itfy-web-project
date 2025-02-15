import {fetchData} from "./fetchData.js";
import {emptyNotice} from "./emptyNotice.js";
import {formatDateTime} from "./dateTimeFormatter.js";
import {baseUrl} from "./constants.js";
import {createEvent} from "./components/createEvent.js";
import fetchEvent from "./fetch-events.js";

export async function fetchEvents() {

    const eventList = document.querySelector('#event-list');

    for (let i = 0; i < 3; i++) {
        const shimmerDiv = document.createElement('div');
        shimmerDiv.classList.add('swiper-slide', 'shimmer');
        eventList.appendChild(shimmerDiv);
    }
    try {
            const formattedEvents = await fetchEvent();

            eventList.innerHTML = "";

            formattedEvents.forEach(event => {
                if ("archived" in event && event.archived === true) {
                    return;
                }
                const eventSlide = document.createElement('div');
                eventSlide.classList.add('swiper-slide');

                eventSlide.appendChild(createEvent(event));
                eventList.appendChild(eventSlide);
            });

            if (formattedEvents.length === 0) {
                const notice = emptyNotice("events", "No events available");
                eventList.appendChild(notice);
            }

    } catch (error) {
        console.error("Error fetching events:", error);
    }
}