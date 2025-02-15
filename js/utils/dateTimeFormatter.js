export function formatDateTime(dateTimeString) {
    console.log(dateTimeString);
    const date = new Date(dateTimeString);

    const formattedDate = date.toLocaleDateString('en-US',
        {month: 'long', day: 'numeric', year: 'numeric'}); // Format: Month day, Year
    const formattedTime = date.toLocaleTimeString('en-GB',); // Format: HH:MM:SS
    return {formattedDate, formattedTime};
}