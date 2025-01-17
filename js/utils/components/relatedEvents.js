// js/utils/components/relatedEvents.js

import {formatDateTime} from "../dateTimeFormatter.js";

function RelatedEvents({ relatedEvents }) {
    return `
        <section class="mt-12">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">Related Events</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${relatedEvents.map(event => `
                    <a href="/events/${event.id}" class="block">
                        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                            <img src="${event.image}" alt="${event.name}" class="w-full h-48 object-cover" />
                            <div class="p-4">
                                <h3 class="text-lg font-semibold text-gray-800 mb-2">${event.name}</h3>
                                <p class="text-sm text-gray-600">${formatDateTime(event.start_date)}</p>
                            </div>
                        </div>
                    </a>
                `).join('')}
            </div>
        </section>
    `;
}

export default RelatedEvents;