/**
 * Generates the Event Timeline HTML.
 * @param {Object} props - The properties for the timeline.
 * @param {Array} props.timeline - An array of timeline events.
 * @returns {string} - HTML string for the event timeline.
 */
function EventTimeline({timeline}) {
    if (!timeline || timeline.length === 0) {
        return `
      <section class="timeline-section">
        <h2 class="timeline-title">Event Timeline</h2>
        <p class="text-gray-500">No timeline information available.</p>
      </section>
    `;
    }

    return `
    <section class="timeline-section">
      <h2 class="timeline-title">Event Timeline</h2>
      <ol class="timeline-list">
        ${timeline
        .map(
            (item) => `
          <li class="timeline-item">
            <span class="timeline-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM6 7a1 1 0 000 2h8a1 1 0 100-2H6z" />
              </svg>
            </span>
            <h3 class="timeline-time">${item.time || "Time not specified"}</h3>
            <p class="timeline-description">${item.details || "No details available"}</p>
          </li>
        `
        )
        .join("")}
      </ol>
    </section>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
    const timelineData = [
        {time: "9:00 AM", description: "Opening Keynote"},
        {time: "11:00 AM", description: "Breakout Sessions"},
        {time: "1:00 PM", description: "Lunch"},
        {time: "3:00 PM", description: "Workshops"},
    ];

    // Render Event Timeline
    const eventTimelineContainer = document.getElementById("event-timeline");
    eventTimelineContainer.innerHTML = EventTimeline({timeline: timelineData});
});
export default EventTimeline;