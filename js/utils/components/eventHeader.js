/**
 * Generates the Event Header HTML.
 * @param {Object} props - The properties for the header.
 * @param {string} props.title - The title of the event.
 * @param {string} props.date - The date of the event.
 * @param {string} props.location - The location of the event.
 * @returns {string} - HTML string for the event header.
 */
function EventHeader({ title = "Untitled Event", date = "Date not provided", location = "Location not available" }) {
    return `
        <header class="bg-white shadow-md py-8">
            <div class="container mx-auto px-4">
                <h1 class="text-4xl font-bold text-gray-800 mb-4">${title}</h1>
                <div class="flex flex-wrap items-center text-gray-600">
                    <div class="flex items-center mr-6 mb-2 sm:mb-0">
                        <svg class="h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>${date}</span>
                    </div>
                    <div class="flex items-center">
                        <svg class="h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2a10 10 0 00-7.07 17.07l7.07 7.07 7.07-7.07A10 10 0 0012 2z" />
                        </svg>
                        <span>${location}</span>
                    </div>
                </div>
            </div>
        </header>
    `;
}

export default EventHeader;
