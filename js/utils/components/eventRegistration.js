// js/utils/components/eventRegistration.js

function RegistrationCTA({ eventId }) {
    return `
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Register for This Event</h2>
            <button
                onclick="handleRegistration('${eventId}')"
                class="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
            >
                Register Now
            </button>
        </div>
    `;
}

async function handleRegistration(eventId) {
    try {
        // Simulate registration API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('You are registered for the event!');
    } catch (error) {
        console.error('Error registering for event:', error);
        alert('Failed to register for the event. Please try again.');
    }
}

export default RegistrationCTA;
export {handleRegistration};