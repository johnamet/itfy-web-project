import {fetchData} from "./utils/fetchData.js";
import {baseUrl} from "./utils/constants.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const progressBar = document.getElementById('progressBar');
    const progressElement = progressBar.querySelector('.progress');
    const statusMessage = document.getElementById('statusMessage');
    const codingJoke = document.querySelector('.coding-joke');

    // Animate the coding joke
    setInterval(() => {
        codingJoke.style.transform = 'translateY(-5px)';
        setTimeout(() => {
            codingJoke.style.transform = 'translateY(0)';
        }, 500);
    }, 3000);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Reset status and show progress bar
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
        progressBar.style.display = 'block';
        progressElement.style.width = '0%';
        loginButton.disabled = true;
        loginButton.textContent = 'Signing in...';

      try {
    // Simulate progress
    await simulateProgress();

    const response = await fetchData("POST", `${baseUrl}/auth/login`, { email, password });

    if (response.success) {
        // Simulated successful login
        statusMessage.textContent = 'Login successful! Redirecting...';
        statusMessage.classList.add('success');
        setTimeout(() => {
            window.location.href = './dashboard.html';
        }, 1500);
    } else {
        throw new Error(response.message || 'Login failed');
    }
} catch (error) {
    statusMessage.textContent = error.error || 'An unexpected error occurred.';
    statusMessage.classList.add('error');
} finally {
    progressBar.style.display = 'none';
    loginButton.disabled = false;
    loginButton.textContent = 'Sign in';
}
});

async function simulateProgress() {
    const totalSteps = 100;
    for (let i = 0; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 20));
        progressElement.style.width = `${i}%`;
    }
}

    // Add floating labels
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.labels[0].classList.add('active');
        });
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.labels[0].classList.remove('active');
            }
        });
    });
});

