document.addEventListener('DOMContentLoaded', function () {

    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
        alert("Please Login to Access this Page");
        window.location.href = "../index.html";
    }

    // Simulated data - replace with actual data fetching in a real application
    const dashboardData = {
        totalUsers: 1250,
        totalVotes: 3750,
        activeEvents: 5,
        totalCandidates: 25,
        recentActivity: [
            {action: 'New user registered', time: '5 minutes ago'},
            {action: 'Vote cast in Event A', time: '10 minutes ago'},
            {action: 'New candidate added', time: '1 hour ago'},
            {action: 'Event B completed', time: '2 hours ago'},
        ],
        upcomingEvents: [
            {name: 'Tech Innovation Contest', date: '2023-08-15'},
            {name: 'Youth Leadership Summit', date: '2023-09-01'},
            {name: 'Coding Challenge 2023', date: '2023-09-20'},
        ]
    };

    // Update quick stats
    document.getElementById('totalUsers').textContent = dashboardData.totalUsers;
    document.getElementById('totalVotes').textContent = dashboardData.totalVotes;
    document.getElementById('activeEvents').textContent = dashboardData.activeEvents;
    document.getElementById('totalCandidates').textContent = dashboardData.totalCandidates;

    // Populate recent activity
    const activityList = document.getElementById('activityList');
    dashboardData.recentActivity.forEach(activity => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${activity.action}</strong> - ${activity.time}`;
        activityList.appendChild(li);
    });

    // Populate upcoming events
    const upcomingEventsList = document.getElementById('upcomingEventsList');
    dashboardData.upcomingEvents.forEach(event => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${event.name}</strong> - ${event.date}`;
        upcomingEventsList.appendChild(li);
    });

    // Create charts
    createVotesChart();
    createUsersChart();
    createEventsChart();
});

function createVotesChart() {
    const ctx = document.getElementById('votesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Event A', 'Event B', 'Event C', 'Event D', 'Event E'],
            datasets: [{
                label: 'Votes',
                data: [1200, 1900, 300, 500, 2000],
                backgroundColor: 'rgba(0, 86, 164, 0.7)',
                borderColor: 'rgba(0, 86, 164, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createUsersChart() {
    const ctx = document.getElementById('usersChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Users',
                data: [65, 59, 80, 81, 56, 55],
                fill: false,
                borderColor: 'rgb(210, 35, 42)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createEventsChart() {
    const ctx = document.getElementById('eventsChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Ongoing', 'Upcoming'],
            datasets: [{
                label: 'Events',
                data: [12, 19, 3],
                backgroundColor: [
                    'rgba(0, 86, 164, 0.7)',
                    'rgba(210, 35, 42, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: [
                    'rgba(0, 86, 164, 1)',
                    'rgba(210, 35, 42, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}