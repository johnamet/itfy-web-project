/**
 * Generates the Event Description HTML.
 * @param {Object} props - The properties for the description.
 * @param {string} props.description - The event description.
 * @returns {string} - HTML string for the event description.
 */
export function EventDescription({description}) {
    return `
        <section class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">About This Event</h2>
            <div class="prose max-w-none">
                ${description || "No description available for this event."}
            </div>
        </section>
    `;
}
