import {baseUrl} from "./utils/constants.js"
import {formatDateTime} from "./utils/dateTimeFormatter.js"
import {fetchData, uploadImage} from "./utils/fetchData.js"

document.addEventListener("DOMContentLoaded", async () => {
    const createEventBtn = document.getElementById("createEventBtn")
    const eventFormSection = document.getElementById("event-form")
    const eventListSection = document.querySelector(".container")
    const formTitle = document.getElementById("formTitle")
    const cancelBtn = document.getElementById("cancelBtn")
    const saveBtn = document.getElementById("saveBtn")
    const eventForm = document.querySelector("#event-form form")
    const addTimelineFieldBtn = document.getElementById("addTimelineFieldBtn")
    const timelineFieldsContainer = document.getElementById("timelineFieldsContainer")
    const addFieldBtn = document.getElementById("addFieldBtn")
    const dynamicFieldsContainer = document.getElementById("dynamicFieldsContainer")
    const addRelatedEventBtn = document.getElementById("addRelatedEventBtn")
    const relatedEventsDropdown = document.getElementById("relatedEventsDropdown")
    const relatedEventsContainer = document.getElementById("relatedEventsContainer")

    const eventsResp = await fetchData("GET", `${baseUrl}/events`)

    const events = eventsResp.events

    console.log(events);

    const activeEventsTable = document.getElementById("activeEventsTable")
    const upcomingEventsTable = document.getElementById("upcomingEventsTable")
    const archivedEventsTable = document.getElementById("archivedEventsTable")
    const activePagination = document.getElementById("active-pagination")
    const upcomingPagination = document.getElementById("upcoming-pagination")
    const archivedPagination = document.getElementById("archived-pagination")

    function renderEvents(events, tableBody) {
        tableBody.innerHTML = ""
        events.forEach((event) => {
            const row = document.createElement("tr")
            row.innerHTML = `
                  <td class="px-6 py-4 whitespace-nowrap">${event.name}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${formatDateTime(event.created_at).formattedDate}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${formatDateTime(event.startDate || event.start_date).formattedDate}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${formatDateTime(event.endDate || event.end_date).formattedDate}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)}">
                          ${event.status}
                      </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button class="text-indigo-600 hover:text-indigo-900 mr-2 edit-btn">Edit</button>
                      <button class="text-red-600 hover:text-red-900 delete-btn">Delete</button>
                  </td>
              `
            tableBody.appendChild(row)
        })
    }

    function getStatusColor(status) {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800"
            case "upcoming":
                return "bg-blue-100 text-blue-800"
            case "archived":
                return "bg-gray-100 text-gray-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    function renderPagination(paginationElement, totalPages, currentPage) {
        paginationElement.innerHTML = ""
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button")
            button.textContent = i
            button.classList.add("px-3", "py-1", "bg-gray-200", "text-gray-700", "rounded-md", "mr-2")
            if (i === currentPage) {
                button.classList.add("bg-primary", "text-white")
            }
            button.addEventListener("click", () => {
                // Handle page change
            })
            paginationElement.appendChild(button)
        }
    }

    if (events) {
        renderEvents(events.filter((e) => e.status === "active" || !e.status), activeEventsTable)
        renderEvents(events.filter((e) => e.status === "upcoming"), upcomingEventsTable)
        renderEvents(events.filter((e) => e.status === "archived"), archivedEventsTable)
    }


    renderPagination(activePagination, 1, 1)
    renderPagination(upcomingPagination, 1, 1)
    renderPagination(archivedPagination, 1, 1)

    createEventBtn.addEventListener("click", () => {
        formTitle.textContent = "Create New Event"
        eventForm.reset()
        eventFormSection.classList.remove("hidden")
        eventFormSection.scrollIntoView({behavior: "smooth"})
    })

    cancelBtn.addEventListener("click", () => {
        eventFormSection.classList.add("hidden")
        eventListSection.classList.remove("opacity-50", "pointer-events-none")
    })

    eventForm.addEventListener("submit", (e) => {
        e.preventDefault()
        // Handle form submission logic here
        eventFormSection.classList.add("hidden")
        eventListSection.classList.remove("opacity-50", "pointer-events-none")
        // You may want to add code here to update the event list with the new event
    })

    addTimelineFieldBtn.addEventListener("click", () => {
        const fieldContainer = document.createElement("div")
        fieldContainer.classList.add("grid", "grid-cols-3", "gap-4")
        fieldContainer.innerHTML = `
              <input type="text" placeholder="Timeline Title" class="col-span-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <input type="text" placeholder="Timeline Description" class="col-span-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <input type="time" placeholder="Timeline Time" class="col-span-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
          `
        timelineFieldsContainer.appendChild(fieldContainer)
    })

    addFieldBtn.addEventListener("click", () => {
        const fieldContainer = document.createElement("div")
        fieldContainer.classList.add("grid", "grid-cols-2", "gap-4")
        fieldContainer.innerHTML = `
              <input type="text" placeholder="Field Label" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <input type="text" placeholder="Field Value" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
          `
        dynamicFieldsContainer.appendChild(fieldContainer)
    })

    const availableEvents = events ? events.filter((event) => event.status === "active" || event.status === "upcoming") : []

    availableEvents.forEach((event) => {
        const option = document.createElement("option")
        option.value = event.id
        option.textContent = event.name
        relatedEventsDropdown.appendChild(option)
    })

    addRelatedEventBtn.addEventListener("click", () => {
        const selectedEvent = relatedEventsDropdown.options[relatedEventsDropdown.selectedIndex]
        if (selectedEvent) {
            const eventTag = document.createElement("div")
            eventTag.classList.add(
                "inline-block",
                "bg-gray-200",
                "rounded-full",
                "px-3",
                "py-1",
                "text-sm",
                "font-semibold",
                "text-gray-700",
                "mr-2",
                "mb-2",
            )
            eventTag.textContent = selectedEvent.textContent
            relatedEventsContainer.appendChild(eventTag)
        }
    })

    // Add event listeners for edit and delete buttons
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-btn")) {
            // Handle edit button click
            const row = e.target.closest("tr")
            const eventName = row.cells[0].textContent
            // Populate form with event data and show form
            formTitle.textContent = "Edit Event"
            eventForm.eventName.value = eventName
            const event = events.filter((e) => e.name === eventName)[0]

            eventForm.eventName.value = event.name
            eventForm.eventDescription.value = event.description
            eventForm.eventStartDate.value = (event.startDate || event.start_date).slice(0, 10).trim()
            eventForm.eventEndDate.value = (event.endDate || event.end_date).slice(0, 10).trim()
            eventForm.eventStartTime.value = (event.startDate || event.start_date).slice(11, 19).trim()
            eventForm.eventEndTime.value = (event.endDate || event.end_date).slice(11, 19).trim()

            // Populate timeline fields
            timelineFieldsContainer.innerHTML = ""
            event["0"].event_timeline.forEach((timeline) => {
                const fieldContainer = document.createElement("div")
                fieldContainer.classList.add("grid", "grid-cols-3", "gap-4")
                fieldContainer.innerHTML = `
            <input type="text" value="${timeline.title || ""}" class="col-span-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
            <input type="text" value="${timeline.details}" class="col-span-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
            <input type="time" value="${timeline.time.slice(0, 5).trim()}" class="col-span-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
          `
                timelineFieldsContainer.appendChild(fieldContainer)
            })

            // Populate dynamic fields
            dynamicFieldsContainer.innerHTML = ""
            Object.keys(event["0"]).forEach((key) => {
                if (!["event_timeline", "related_events"].includes(key)) {
                    const fieldContainer = document.createElement("div")
                    fieldContainer.classList.add("grid", "grid-cols-2", "gap-4")
                    fieldContainer.innerHTML = `
              <input type="text" value="${key}" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <input type="text" value="${event["0"][key]}" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
            `
                    dynamicFieldsContainer.appendChild(fieldContainer)
                }
            })

            // Populate related events
            relatedEventsContainer.innerHTML = ""
            ;(event.related_events || []).forEach((relatedEventId) => {
                const relatedEvent = events.find((e) => e.id === relatedEventId)
                if (relatedEvent) {
                    const eventTag = document.createElement("div")
                    eventTag.classList.add(
                        "inline-block",
                        "bg-gray-200",
                        "rounded-full",
                        "px-3",
                        "py-1",
                        "text-sm",
                        "font-semibold",
                        "text-gray-700",
                        "mr-2",
                        "mb-2",
                    )
                    eventTag.textContent = relatedEvent.name
                    relatedEventsContainer.appendChild(eventTag)
                }
            })

            toggleFormVisibility(true)
        } else if (e.target.classList.contains("delete-btn")) {
            // Handle delete button click
            if (confirm("Are you sure you want to delete this event?")) {
                e.target.closest("tr").remove()
            }
        }
    })

    function toggleFormVisibility(show) {
        if (show) {
            eventFormSection.classList.remove("hidden")
            eventFormSection.scrollIntoView({behavior: "smooth"})
        } else {
            eventFormSection.classList.add("hidden")
            eventListSection.classList.remove("opacity-50", "pointer-events-none")
        }
    }

    function collectFormData() {
        const formData = {
            name: eventForm.eventName.value,
            description: eventForm.eventDescription.value,
            start_date: new Date(`${eventForm.eventStartDate.value}T${eventForm.eventStartTime.value}`).toISOString(),
            end_date: new Date(`${eventForm.eventEndDate.value}T${eventForm.eventEndTime.value}`).toISOString(),
            event_timeline: [],
            related_events: [],
        }

        //collect status data
        const status = document.getElementById("eventStatus")
        formData.status = status.options[status.selectedIndex].value

        // Collect timeline fields
        const timelineFields = timelineFieldsContainer.querySelectorAll(".grid-cols-3")
        timelineFields.forEach((field) => {
            const title = field.children[0].value
            const details = field.children[1].value
            const time = field.children[2].value
            formData.event_timeline.push({title, details, time})
        })

        // Collect dynamic fields
        const dynamicFields = dynamicFieldsContainer.querySelectorAll(".grid-cols-2")
        dynamicFields.forEach((field) => {
            const key = field.children[0].value
            const value = field.children[1].value
            formData[key] = value
        })

        // Collect related events
        const relatedEventTags = relatedEventsContainer.querySelectorAll(".inline-block")
        relatedEventTags.forEach((tag) => {
            const relatedEvent = events.find((e) => e.name === tag.textContent)
            if (relatedEvent) {
                formData.related_events.push(relatedEvent.id)
            }
        })

        return formData
    }

    const notification = document.getElementById("notification")
    const notificationMessage = document.getElementById("notificationMessage")

    function showNotification(message, isSuccess) {
        notificationMessage.textContent = message
        notification.classList.add(isSuccess ? "success" : "error")
        notification.classList.add("show")
        setTimeout(() => {
            notification.classList.remove("show")
            setTimeout(() => {
                notification.classList.remove("success", "error")
            }, 300)
        }, 3000)
    }

    saveBtn.addEventListener("click", async (e) => {
        e.preventDefault()
        const data = collectFormData()

        try {
            if (formTitle.textContent === "Edit Event") {
                const id = events.find((e) => e.name === eventForm.eventName.value).id
                const saveResp = await fetchData("PUT", `${baseUrl}/events/${id}`, data)
                if (saveResp.success) {
                    //Collect the image uri for upload
                    const imageInput = document.getElementById("eventThumbnail")
                    if (imageInput && imageInput.files.length > 0) {
                        const file = imageInput.files[0]

                        const uploadResult = await uploadImage(`${baseUrl}/app/files`, "events", id, file);
                        if (!uploadResult.success) {
                            showNotification("Failed to upload event thumbnail. Please try again.", false)
                        }
                    }

                    showNotification("Event updated successfully!", true)
                    eventFormSection.classList.add("hidden")
                    eventListSection.classList.remove("opacity-50", "pointer-events-none")
                    // Refresh the event list or update the specific event in the list
                    const updatedEvents = await fetchData("GET", `${baseUrl}/events`)
                    renderEvents(updatedEvents.events.filter(e => e.status === "active"), activeEventsTable)
                    renderEvents(updatedEvents.events.filter(e => e.status === "upcoming"), upcomingEventsTable)
                    renderEvents(updatedEvents.events.filter(e => e.status === "archived"), archivedEventsTable)
                } else {
                    showNotification("Failed to update event. Please try again.", false)
                }
            } else {
                const saveResp = await fetchData("POST", `${baseUrl}/events`, data)

                if (saveResp.success) {
                    const eventId = saveResp.event.id;
                    //Collect the image uri for upload
                    const imageInput = document.getElementById("eventThumbnail")
                    if (imageInput && imageInput.files.length > 0) {
                        const file = imageInput.files[0]

                        const uploadResult = await uploadImage(`${baseUrl}/app/files`, "events", eventId, file);
                        if (!uploadResult.success) {
                            showNotification("Failed to upload event thumbnail. Please try again.", false)
                        }
                    }

                    showNotification("Event saved successfully!", true)
                    eventFormSection.classList.add("hidden")
                    eventListSection.classList.remove("opacity-50", "pointer-events-none")
                    // Refresh the event list or update the specific event in the list
                    const updatedEvents = await fetchData("GET", `${baseUrl}/events`)
                    renderEvents(
                        updatedEvents.events.filter((e) => e.status === "active"),
                        activeEventsTable,
                    )
                    renderEvents(
                        updatedEvents.events.filter((e) => e.status === "upcoming"),
                        upcomingEventsTable,
                    )
                    renderEvents(
                        updatedEvents.events.filter((e) => e.status === "archived"),
                        archivedEventsTable,
                    )
                } else {
                    showNotification("Failed to save event. Please try again.", false)
                }

            }
        } catch (error) {
            console.error("Error saving event:", error)
            showNotification("An error occurred while saving the event.", false)
        }
    })
})

