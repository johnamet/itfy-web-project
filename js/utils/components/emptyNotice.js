// js/utils/components/emptyNotice.js

function EmptyNotice({ message = "No candidates found", subMessage = "Check back later for updates" }) {
    return `
        <div class="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg animate-fade-in-up">
            <div class="w-64 h-64 mb-8">
                <svg class="w-full h-full text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-800 mb-2 text-center">${message}</h2>
            <p class="text-xl text-gray-600 mb-8 text-center">${subMessage}</p>
            <div class="space-y-4">
                <a href="../index.html#events" class="block px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition duration-300 text-center">
                    Check Upcoming Events
                </a>
                <a href="../index.html#categories" class="block px-6 py-3 bg-white text-blue-600 font-semibold rounded-full border-2 border-blue-600 hover:bg-blue-50 transition duration-300 text-center">
                    Explore Categories
                </a>
            </div>
        </div>
    `;
}

export default EmptyNotice;