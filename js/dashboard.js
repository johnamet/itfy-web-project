import {fetchData, uploadImage} from './utils/fetchData.js';
import { baseUrl } from './utils/constants.js';
import { formatDateTime } from './utils/dateTimeFormatter.js';
import { getImageUrl } from "./utils/getImageUrl.js";

// Constants
const STATUS_ACTIVE = 'active';
const STATUS_UPCOMING = 'upcoming';
const EXCLUDED_ACTIONS = ['verify_token', 'verify_role'];

// Utility Functions
const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.round((now - new Date(timestamp)) / 60000);
    const diffInHours = Math.round(diffInMinutes / 60);
    const diffInDays = Math.round(diffInHours / 24);

    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    const diffInMonths = Math.round(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
};

const groupByMonth = (array) => array.reduce((acc, { timestamp }) => {
    const month = new Date(timestamp).toISOString().slice(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + 1;
    return acc;
}, {});

// DOM Manipulation Functions
const updateStat = (id, value) => {
    const element = document.getElementById(id);
    let current = 0;
    const step = value / 60; // ~1s animation at 60fps
    const animate = () => {
        current += step;
        element.textContent = Math.min(Math.floor(current), value).toLocaleString();
        if (current < value) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
};

const populateList = (listId, items, renderItem, delayBase = 0.1) => {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    if (items.length === 0) {
        list.innerHTML = `
            <div class="text-center text-gray-600 py-4">
                <p class="font-medium">No Data Available</p>
                <p class="text-sm">Check back later for updates.</p>
            </div>
        `;
    } else {
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-3 rounded-lg bg-platinum hover:bg-gray-200 text-luxury animate-slide-in transition-colors duration-200 text-sm';
            li.style.animationDelay = `${index * delayBase}s`;
            li.innerHTML = renderItem(item);
            list.appendChild(li);
        });
    }
};

// Chart Creation Functions
const createChart = (id, type, data, options) => {
    const ctx = document.getElementById(id).getContext('2d');
    return new Chart(ctx, {
        type,
        data,
        options: {
            animation: { duration: 1000, easing: 'easeOutQuart' },
            maintainAspectRatio: false,
            layout: { padding: 30 },
            ...options,
        }
    });
};

const createVotesChart = (votingSummary) => createChart('votingStatsChart', 'pie', {
    labels: Object.keys(votingSummary),
    datasets: [{
        label: 'Votes',
        data: Object.values(votingSummary),
        backgroundColor: ['#1E3A8A', '#10B981', '#D4AF37', '#EF4444', '#8B5CF6'],
        borderColor: '#F9FAFB',
        borderWidth: 2
    }],
}, {
    plugins: {
        legend: {
            position: 'right',
            labels: { font: { family: 'Inter', size: 12 }, padding: 20, boxWidth: 12 }
        },
        tooltip: {
            backgroundColor: '#1F2937',
            titleFont: { family: 'Inter', size: 14 },
            bodyFont: { family: 'Inter', size: 12 }
        }
    }
});

const createUsersChart = (visits) => createChart('userGrowthChart', 'line', {
    labels: Object.keys(visits),
    datasets: [{
        label: 'Site Visits',
        data: Object.values(visits),
        fill: true,
        backgroundColor: 'rgba(30, 58, 138, 0.2)',
        borderColor: '#1E3A8A',
        tension: 0.4
    }],
}, {
    scales: {
        y: {
            beginAtZero: true,
            grid: { color: '#E5E7EB' },
            title: { display: true, text: 'Visits', font: { family: 'Inter', size: 14 } },
            ticks: { font: { family: 'Inter', size: 12 } }
        },
        x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 12 } }
        }
    },
    plugins: {
        legend: { display: true, position: 'top', labels: { font: { family: 'Inter', size: 14 } } },
        tooltip: {
            backgroundColor: '#1F2937',
            titleFont: { family: 'Inter', size: 14 },
            bodyFont: { family: 'Inter', size: 12 }
        }
    }
});

const createEventsChart = (events) => {
    const stats = events.reduce((acc, { status }) => {
        acc[status.toLowerCase()] = (acc[status.toLowerCase()] || 0) + 1;
        return acc;
    }, {});
    return createChart('eventParticipationChart', 'bar', {
        labels: Object.keys(stats),
        datasets: [{
            label: 'Events',
            data: Object.values(stats),
            backgroundColor: '#10B981',
            borderColor: '#1E3A8A',
            borderWidth: 1
        }],
    }, {
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#E5E7EB' },
                title: { display: true, text: 'Count', font: { family: 'Inter', size: 14 } },
                ticks: { font: { family: 'Inter', size: 12 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 12 } }
            }
        },
        plugins: {
            legend: { display: true, position: 'top', labels: { font: { family: 'Inter', size: 14 } } },
            tooltip: {
                backgroundColor: '#1F2937',
                titleFont: { family: 'Inter', size: 14 },
                bodyFont: { family: 'Inter', size: 12 }
            }
        }
    });
};

const createTopPerformersChart = (candidates) => {
    const topCandidates = candidates.slice(0, 4).sort((a, b) => (b.votes || 0) - (a.votes || 0));
    return createChart('topPerformersChart', 'bar', {
        labels: topCandidates.map(c => c.name || 'Unknown'),
        datasets: [{
            label: 'Votes',
            data: topCandidates.map(c => c.votes || 0),
            backgroundColor: '#D4AF37',
            borderColor: '#1E3A8A',
            borderWidth: 1
        }],
    }, {
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: '#E5E7EB' },
                title: { display: true, text: 'Votes', font: { family: 'Inter', size: 14 } },
                ticks: { font: { family: 'Inter', size: 12 } }
            },
            y: {
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 12 } }
            }
        },
        plugins: {
            legend: { display: true, position: 'top', labels: { font: { family: 'Inter', size: 14 } } },
            tooltip: {
                backgroundColor: '#1F2937',
                titleFont: { family: 'Inter', size: 14 },
                bodyFont: { family: 'Inter', size: 12 }
            }
        }
    });
};

// Show Notification
const showNotification = (message, type) => {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    notificationMessage.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add(type === 'success' ? 'bg-green-600' : 'bg-red-600', 'animate-fade-in');
    setTimeout(() => {
        notification.classList.add('hidden');
        notification.classList.remove('bg-green-600', 'bg-red-600', 'animate-fade-in');
    }, 5000);
};

// Main Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
        showNotification('Please login to access this page.', 'error');
        setTimeout(() => window.location.href = '../../index.html', 2000);
        return;
    }

    const profileImg = document.querySelector('.user-info img');
    const userNameHtml = document.querySelector('.user-info p');
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeModal = document.getElementById('closeProfileModal');
    const profileForm = document.getElementById('profileForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const profilePhotoInput = document.getElementById('profilePhoto');
    const passwordInput = document.getElementById('password');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeNotification = document.getElementById('closeNotification');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const voteFilter = document.getElementById('voteFilter');

    let votesChartInstance = null;
    let usersChartInstance = null;
    let eventsChartInstance = null;
    let topPerformersChartInstance = null;
    let currentUser = null;

    // Close Notification
    closeNotification.addEventListener('click', () => {
        const notification = document.getElementById('notification');
        notification.classList.add('hidden');
        notification.classList.remove('bg-green-600', 'bg-red-600', 'animate-fade-in');
    });

    try {
        loading.classList.remove('hidden');
        const [users, events, activities, candidates, siteVisits] = await Promise.all([
            fetchData('GET', `${baseUrl}/users`),
            fetchData('GET', `${baseUrl}/events`),
            fetchData('GET', `${baseUrl}/activities`),
            fetchData('GET', `${baseUrl}/candidates`),
            fetchData('GET', `${baseUrl}/activities/sites`),
        ]);

        const votingSummary = {};
        let filteredVotingSummary = {};
        await Promise.all(events.events.map(async (ev) => {
            const { summary } = await fetchData('GET', `${baseUrl}/votes/summary?event_id=${ev.id}`);
            votingSummary[ev.name] = summary.reduce((sum, obj) => sum + obj.total_votes, 0);
        }));
        filteredVotingSummary = { ...votingSummary }; // Initial copy for filtering

        currentUser = JSON.parse(sessionStorage.getItem('user'));
        userNameHtml.textContent = currentUser.name;
        profileImg.src = await getImageUrl('users', currentUser.id) || '../../images/profile-placeholder.png';

        const dashboardData = {
            totalUsers: users.success ? users.users.length : 0,
            totalVotes: Object.values(votingSummary).reduce((sum, val) => sum + val, 0),
            activeEvents: events.success ? events.events.filter(ev => ev.status.toLowerCase() === STATUS_ACTIVE).length : 0,
            totalCandidates: candidates.success && !candidates.error ? candidates.pagination.totalCandidates : 0,
            recentActivity: activities.activities.filter(act => !EXCLUDED_ACTIONS.includes(act.action)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
            upcomingEvents: events.success ? events.events
                .filter(ev => ev.status.toLowerCase() === STATUS_UPCOMING)
                .map(ev => ({ ...ev, date: formatDateTime(ev.start_date).formattedDate })) : [],
            candidates: candidates.success && !candidates.error ? candidates.candidates : [],
        };

        // Update UI
        updateStat('totalUsers', dashboardData.totalUsers);
        updateStat('totalVotes', dashboardData.totalVotes);
        updateStat('activeEvents', dashboardData.activeEvents);
        updateStat('totalCandidates', dashboardData.totalCandidates);

        populateList('recentActivity', dashboardData.recentActivity, (activity) => `
            <div class="flex flex-col">
                <span class="font-semibold">${activity.action || 'Unknown Action'}</span>
                <span class="text-gray-600">${activity.entity || 'N/A'} (${activity.entity_id || 'N/A'})</span>
            </div>
            <span class="text-gray-500">${formatRelativeTime(activity.created_at)}</span>
        `);

        populateList('upcomingEvents', dashboardData.upcomingEvents, (event) => `
            <span class="font-semibold">${event.name}</span>
            <span class="text-gray-500">${event.date}</span>
        `);

        // Destroy existing charts if they exist
        if (votesChartInstance) votesChartInstance.destroy();
        if (usersChartInstance) usersChartInstance.destroy();
        if (eventsChartInstance) eventsChartInstance.destroy();
        if (topPerformersChartInstance) topPerformersChartInstance.destroy();

        votesChartInstance = createVotesChart(filteredVotingSummary);
        usersChartInstance = createUsersChart(groupByMonth(siteVisits.siteVisits));
        eventsChartInstance = createEventsChart(events.events);
        topPerformersChartInstance = createTopPerformersChart(dashboardData.candidates);

        // Vote Filter
        voteFilter.addEventListener('change', async (e) => {
            const filter = e.target.value;
            filteredVotingSummary = { ...votingSummary };
            if (filter !== 'all') {
                const now = new Date();
                const cutoffDate = filter === 'week'
                    ? new Date(now.setDate(now.getDate() - 7))
                    : new Date(now.setMonth(now.getMonth() - 1));
                await Promise.all(events.events.map(async (ev) => {
                    const { summary } = await fetchData('GET', `${baseUrl}/votes/summary?event_id=${ev.id}&since=${cutoffDate.toISOString()}`);
                    filteredVotingSummary[ev.name] = summary.reduce((sum, obj) => sum + obj.total_votes, 0);
                }));
            }
            if (votesChartInstance) votesChartInstance.destroy();
            votesChartInstance = createVotesChart(filteredVotingSummary);
        });

        // Profile Modal Logic
        profileBtn.addEventListener('click', async () => {
            profileModal.classList.remove('hidden');
            usernameInput.value = currentUser.name;
            emailInput.value = currentUser.email || 'N/A';
            const userDetails = await fetchData('GET', `${baseUrl}/users/profile/${currentUser.id}`);
            if (userDetails.success) {
                usernameInput.value = userDetails.user.name;
                emailInput.value = userDetails.user.email;
            }
        });

        closeModal.addEventListener('click', () => {
            profileModal.classList.add('hidden');
            profileForm.reset();
        });

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            const username = formData.get('username').trim();
            const email = formData.get('email').trim();
            const password = formData.get('password').trim();
            const photo = formData.get('profilePhoto');

            try {
                // Update Profile
                const updateData = {};
                if (username && username !== currentUser.name) updateData.name = username;
                if (email && email !== currentUser.email) updateData.email = email;
                if (password) {
                    if (password.length < 8) {
                        showNotification('Password must be at least 8 characters.', 'error');
                        return;
                    }
                    updateData.password = password;
                }
                if (Object.keys(updateData).length > 0) {
                    const response = await fetchData('PUT', `${baseUrl}/users/${currentUser.id}`, updateData);
                    if (!response.success) {
                        throw new Error(response.error || 'Failed to update profile');
                    }
                    currentUser = { ...currentUser, ...updateData };
                    sessionStorage.setItem('user', JSON.stringify(currentUser));
                    userNameHtml.textContent = currentUser.name;
                    showNotification('Profile updated successfully!', 'success');
                }

                // Upload Photo
                if (photo && photo.size > 0) {
                    const uploadResponse = await uploadImage(`${baseUrl}/app/files`, 'users', currentUser.id, photo);
                    if (uploadResponse.success) {
                        const newPhotoUrl = await getImageUrl('users', currentUser.id);
                        profileImg.src = newPhotoUrl;
                        showNotification('Profile photo updated successfully!', 'success');
                    } else {
                        throw new Error(uploadResponse.error || 'Failed to upload photo');
                    }
                }

                profileModal.classList.add('hidden');
                profileForm.reset();
            } catch (err) {
                showNotification('Error updating profile.', 'error');
                console.error('Error updating profile:', err);
            }
        });

        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = '../../index.html';
        });

        loading.classList.add('hidden');
    } catch (error) {
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        error.textContent = 'Failed to load dashboard data.';
        console.error('Dashboard initialization failed:', error);
    }
});