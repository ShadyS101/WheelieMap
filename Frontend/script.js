document.addEventListener("DOMContentLoaded", function() {

    // --- Mobile Navigation ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
            navLinks.classList.toggle('active');
        });
    }

    // --- Lead Magnet Modal (Homepage only) - UPDATED ---
const leadMagnetModal = document.getElementById('lead-magnet-modal');
if (leadMagnetModal) {
    const closeModalButtons = leadMagnetModal.querySelectorAll('.close-modal');
    
    // Check if the user has EVER closed the modal before
    const modalAlreadyShown = localStorage.getItem('u4uModalClosed');

    const showModal = () => {
        // Only show if it has NEVER been closed
        if (!modalAlreadyShown) {
            leadMagnetModal.classList.add('show');
        }
    };

    const closeModal = () => {
        // When closing, set the permanent flag in localStorage
        localStorage.setItem('u4uModalClosed', 'true');
        leadMagnetModal.classList.remove('show');
    };

    // Show modal after a delay
    setTimeout(showModal, 5000); // 5-second delay

    // Add event listeners to BOTH close buttons
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Also allow closing by clicking the background
    leadMagnetModal.addEventListener('click', (e) => {
        if (e.target === leadMagnetModal) {
            closeModal();
        }
    });
}

// And finally, we need a small CSS addition for the new buttons.
// Please add this small block to the END of your style.css file.

    // --- FAQ Accordion - CORRECTED ---
const faqCards = document.querySelectorAll('.faq-card');
if (faqCards) {
    faqCards.forEach(card => {
        const question = card.querySelector('.faq-question');
        const answer = card.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = card.classList.contains('active');

            // First, close all other cards
            faqCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('active');
                    otherCard.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            // Then, toggle the clicked card
            if (!isActive) {
                card.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                card.classList.remove('active');
                answer.style.maxHeight = null;
            }
        });
    });
}

    // --- Fade-in Animations on Scroll ---
    const fadeUpElements = document.querySelectorAll('.fade-in-up');
    if (fadeUpElements) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `fadeInUp 0.8s ease-out forwards`;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        fadeUpElements.forEach(el => observer.observe(el));
    }

});