import {fetchEvents} from "./utils/fetchEvents.js";
import {fetchCategories} from "./utils/fetchCategories.js";
import {fetchCandidates} from "./utils/fetchCandidates.js";


document.addEventListener('DOMContentLoaded', async () => {
    const loginBtn = document.getElementById('loginBtn');
    const heroSection = document.querySelector('.hero');
    const navLinks = document.querySelectorAll('nav a');
    const eventCards = document.querySelectorAll('.event-card');
    const candidateCards = document.querySelectorAll('.candidate-card');

    // Login button functionality
    loginBtn.addEventListener('click', () => {
        window.location.href = "./pages/login.html";
    });

    // Simple fade-in animation for hero section
    heroSection.style.opacity = '1';
    setTimeout(() => {
        heroSection.style.transition = 'opacity 1s ease-in-out';
        heroSection.style.opacity = '0';
        setTimeout(() => {
            heroSection.style.opacity = '1';
        }, 50);
    }, 300);

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
            }
        });
    });
    // Debounce function to limit the rate at which a function can fire
    // Combined scroll event listener with debounce
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            const scrollPosition = window.pageYOffset;
            document.body.style.backgroundPositionY = `${scrollPosition * 0.5}px`;

            document.querySelectorAll('section').forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    const correspondingLink = document.querySelector(`nav a[href="#${section.id}"]`);
                    if (correspondingLink) {
                        navLinks.forEach(link => link.classList.remove('active'));
                        correspondingLink.classList.add('active');
                    }
                }
            });
        }, 100);
    });

    // Add hover effect to event cards
    eventCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
    });

    // Add hover effect to candidate cards
    candidateCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
    });

    // Initialize Swiper
    const swiper = new Swiper('.swiper-container', {
        loop: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
    });


    const [events, categories, candidates] = await Promise.all([
        fetchEvents(),
        fetchCategories(),
        fetchCandidates()
    ]);
    swiper.update();
});