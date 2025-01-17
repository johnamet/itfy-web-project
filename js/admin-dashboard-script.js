document.addEventListener("DOMContentLoaded", () => {
    const selectAllCheckbox = document.getElementById("selectAll");
    const eventCheckboxes = document.querySelectorAll(".eventCheckbox");
    const eventTableBody = document.getElementById("eventTableBody");

    // Handle "Select All" functionality
    selectAllCheckbox.addEventListener("change", (e) => {
        eventCheckboxes.forEach((checkbox) => {
            checkbox.checked = e.target.checked;
        });
    });

    // Add a new event
    document.getElementById("addEventBtn").addEventListener("click", () => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><input type="checkbox" class="eventCheckbox"></td>
            <td>New Event</td>
            <td>${new Date().toISOString().split("T")[0]}</td>
            <td>Active</td>
            <td>
                <button class="action-button edit-btn">Edit</button>
                <button class="action-button delete-btn">Delete</button>
            </td>
        `;
        eventTableBody.appendChild(newRow);
    });

    // Delete selected events
    document.getElementById("deleteEventBtn").addEventListener("click", () => {
        const selectedEvents = document.querySelectorAll(".eventCheckbox:checked");
        selectedEvents.forEach((checkbox) => {
            checkbox.closest("tr").remove();
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const toggleSidebar = document.createElement('button');
    toggleSidebar.textContent = '☰';
    toggleSidebar.className = 'toggle-sidebar';
    document.querySelector('.header').prepend(toggleSidebar);

    toggleSidebar.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('show-sidebar');
    });

    // Highlight active sidebar item
    const sidebarItems = document.querySelectorAll('.sidebar li');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Simulate notifications
    const notificationIcon = document.querySelector('.notification-icon');
    notificationIcon.addEventListener('click', function() {
        alert('You have 3 new notifications');
    });

    // Quick action buttons
    const actionButtons = document.querySelectorAll('.action-button');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert(`Action: ${this.textContent}`);
        });
    });

    // Simulate real-time updates
    setInterval(() => {
        const randomProgress = Math.floor(Math.random() * 100);
        document.querySelector('.progress').style.width = `${randomProgress}%`;
        document.querySelector('.progress-text').textContent = `${randomProgress}% Complete`;
    }, 5000);
});

document.addEventListener("DOMContentLoaded", () => {
    const selectAllUsers = document.getElementById("selectAllUsers");
    const userCheckboxes = document.querySelectorAll(".userCheckbox");
    const userTableBody = document.getElementById("userTableBody");

    // Handle "Select All" functionality
    selectAllUsers.addEventListener("change", (e) => {
        userCheckboxes.forEach((checkbox) => {
            checkbox.checked = e.target.checked;
        });
    });

    // Add a new user
    document.getElementById("addUserBtn").addEventListener("click", () => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><input type="checkbox" class="userCheckbox"></td>
            <td>New User</td>
            <td>new.user@example.com</td>
            <td>Viewer</td>
            <td>Active</td>
            <td>
                <button class="action-button edit-btn">Edit</button>
                <button class="action-button delete-btn">Delete</button>
            </td>
        `;
        userTableBody.appendChild(newRow);
    });

    // Delete selected users
    document.getElementById("deleteUserBtn").addEventListener("click", () => {
        const selectedUsers = document.querySelectorAll(".userCheckbox:checked");
        selectedUsers.forEach((checkbox) => {
            checkbox.closest("tr").remove();
        });
    });

    // Example edit functionality (you can customize this further)
    userTableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-btn")) {
            const row = e.target.closest("tr");
            const userName = row.cells[1].textContent;
            const email = row.cells[2].textContent;

            // Edit logic here (e.g., open a modal or inline editing)
            alert(`Editing user: ${userName} (${email})`);
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    // Voting Trends Chart
    const votingTrendsCtx = document.getElementById("votingTrendsChart").getContext("2d");
    new Chart(votingTrendsCtx, {
        type: "line",
        data: {
            labels: ["January", "February", "March", "April", "May", "June"],
            datasets: [
                {
                    label: "Votes",
                    data: [500, 700, 1200, 1500, 2000, 2500],
                    borderColor: "#e21111",
                    backgroundColor: "rgba(31, 43, 211, 0.2)",
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
            },
        },
    });

    // Top Candidates Chart
    const topCandidatesCtx = document.getElementById("topCandidatesChart").getContext("2d");
    new Chart(topCandidatesCtx, {
        type: "bar",
        data: {
            labels: ["John Doe", "Jane Smith", "Alice Brown", "Bob Johnson"],
            datasets: [
                {
                    label: "Votes",
                    data: [1200, 900, 750, 650],
                    backgroundColor: [
                        "#184baa",
                        "#8715c9",
                        "#e21111",
                        "#3dc7f3",
                    ],
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const accountSettingsForm = document.getElementById("accountSettingsForm");
    const platformSettingsForm = document.getElementById("platformSettingsForm");
    const deleteAccountButton = document.getElementById("deleteAccountButton");

    // Handle Account Settings Form Submission
    accountSettingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(accountSettingsForm);
        console.log("Account Settings Updated:", Object.fromEntries(formData));
        alert("Account settings have been saved.");
    });

    // Handle Platform Settings Form Submission
    platformSettingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(platformSettingsForm);
        console.log("Platform Settings Updated:", Object.fromEntries(formData));
        alert("Platform settings have been saved.");
    });

    // Handle Delete Account Action
    deleteAccountButton.addEventListener("click", () => {
        const confirmation = confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmation) {
            console.log("Account deleted.");
            alert("Your account has been deleted.");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const supportForm = document.getElementById("supportForm");
    const faqHeaders = document.querySelectorAll(".faq-list h3");

    // Handle support form submission
    supportForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(supportForm);
        console.log("Support Message Sent:", Object.fromEntries(formData));
        alert("Your message has been sent. Our team will contact you soon.");
        supportForm.reset();
    });

    // Toggle FAQ answers
    faqHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const answer = header.nextElementSibling;
            if (answer.style.display === "block") {
                answer.style.display = "none";
            } else {
                answer.style.display = "block";
            }
        });
    });
});
