import {fetchData} from "./fetchData.js";
import {emptyNotice} from "./emptyNotice.js";
import {formatDateTime} from "./dateTimeFormatter.js";
import {baseUrl} from "./constants.js";
import {createEvent} from "./components/createEvent.js";

export async function fetchEvents() {

    const eventList = document.querySelector('#event-list');

    for (let i = 0; i < 3; i++) {
        const shimmerDiv = document.createElement('div');
        shimmerDiv.classList.add('swiper-slide', 'shimmer');
        eventList.appendChild(shimmerDiv);
    }
    try {
        const response = await fetchData("GET", `${baseUrl}/events`);
        const {success, events} = response;

        if (success) {

            // Prepare promises for fetching all event thumbnail URLs
            const eventPromises = events.map(async event => {
                const {id, name: eventName, description: eventDescription} = event;
                let start_date = "";
                let end_date = "";

                if("startDate" in event){
                    start_date = event.startDate;
                    end_date = event.endDate;
                }else{
                    start_date= event.start_date;
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

            eventList.innerHTML = "";

            formattedEvents.forEach(event => {
                if("archived" in event && event.archived === true){
                    return;
                }
                const eventSlide = document.createElement('div');
                eventSlide.classList.add('swiper-slide');

                eventSlide.appendChild(createEvent(event));
                eventList.appendChild(eventSlide);
            });

            if (formattedEvents.length === 0){
                const notice = emptyNotice("events", "No events available");
                eventList.appendChild(notice);
            }
        }
    } catch (error) {
        console.error("Error fetching events:", error);
    }
}