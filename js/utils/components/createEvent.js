import {getImageUrl} from "../getImageUrl.js";

export function createEvent(event) {
    const {
        eventName,
        id,
        eventDate,
        eventTime,
        eventEndDate,
        eventEndTime,
        eventDescription,
    } = event;

    const eventCard = document.createElement("div");
    eventCard.className = "bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105";

    const eventContent = document.createElement("div");
    eventContent.className = "flex flex-col h-full";

    const eventThumbnail = document.createElement("img");
    eventThumbnail.className = "w-full h-48 object-cover";
    eventThumbnail.alt = eventName;

    getImageUrl("events", id, eventThumbnail).then((url) => {
        eventThumbnail.src = url || "/images/default-event.jpg";
        eventThumbnail.crossOrigin = "anonymous";
        eventThumbnail.onload = () => {
            const colorThief = new ColorThief();
            const dominantColor = colorThief.getColor(eventThumbnail);
            eventCard.style.textShadow = `0 0 10px rgba(${dominantColor.join(",")},.5)`;
            eventCard.style.boxShadow = `0 10px 15px -3px rgba(${dominantColor.join(",")},.1), 0 4px 6px -2px rgba(${dominantColor.join(",")},.05)`;
        };
    });

    const eventDetails = document.createElement("div");
    eventDetails.className = "p-6 flex flex-col flex-grow";

    const eventTitle = document.createElement("h3");
    eventTitle.className = "text-2xl font-bold mb-2 text-gray-800";
    eventTitle.textContent = eventName;

    const eventDescriptionElement = document.createElement("p");
    eventDescriptionElement.className = "text-gray-600 mb-4 line-clamp-3 flex-grow";
    eventDescriptionElement.textContent = eventDescription;

    const eventDateElement = document.createElement("div");
    eventDateElement.className = "flex items-center text-sm text-gray-500 mb-1";

    const calendarIcon = document.createElement("span");
    calendarIcon.className = "mr-2";
    calendarIcon.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>';

    const dateTimeText = document.createElement("span");
    dateTimeText.textContent = `${eventDate} at ${eventTime}`;

    eventDateElement.appendChild(calendarIcon);
    eventDateElement.appendChild(dateTimeText);

    const eventEndDateElement = document.createElement("div");
    eventEndDateElement.className = "flex items-center text-sm text-gray-500 mb-4";

    const clockIcon = document.createElement("span");
    clockIcon.className = "mr-2";
    clockIcon.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>';

    const endDateTimeText = document.createElement("span");
    endDateTimeText.textContent = `Ends on ${eventEndDate} at ${eventEndTime}`;

    eventEndDateElement.appendChild(clockIcon);
    eventEndDateElement.appendChild(endDateTimeText);

    const viewDetailsButton = document.createElement("a");
    viewDetailsButton.href = `./pages/event-details.html?id=${id}`;
    viewDetailsButton.className = "mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition duration-300 text-center";
    viewDetailsButton.textContent = "View Details";

    eventDetails.appendChild(eventTitle);
    eventDetails.appendChild(eventDescriptionElement);
    eventDetails.appendChild(eventDateElement);
    eventDetails.appendChild(eventEndDateElement);
    eventDetails.appendChild(viewDetailsButton);

    eventContent.appendChild(eventThumbnail);
    eventContent.appendChild(eventDetails);
    eventCard.appendChild(eventContent);

    return eventCard;
}

