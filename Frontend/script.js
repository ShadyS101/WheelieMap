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

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        console.log("Initializing map...");

        // Load Leaflet only if available (for safety)
        if (typeof L === 'undefined') {
            console.error("Leaflet is not loaded. Make sure to include the Leaflet <script> and <link> tags in your HTML.");
            return;
        }

        // Initialize map
        const map = L.map('map').setView([0, 0], 2);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Hazard marker colors
        const colors = {
            'Slippery': 'blue',
            'Low Lighting': 'orange',
            'Isolated': 'red'
        };

        // Center map on user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const { latitude, longitude } = pos.coords;
                map.setView([latitude, longitude], 15);

                const userMarker = L.circleMarker([latitude, longitude], {
                    radius: 8,
                    color: 'green',
                    fillColor: 'green',
                    fillOpacity: 0.8
                }).addTo(map);
                userMarker.bindPopup("📍 You are here").openPopup();
            }, err => {
                console.warn("Could not get current location:", err.message);
                map.setView([37.7749, -122.4194], 13);
            });
        }

        // Fetch existing hazard reports
        fetch('http://localhost:5000/report', {
            method: 'GET'
        })
        .then(res => res.json())
        .then(data => {
            data.forEach(loc => {
                const color = colors[loc.type] || 'gray';
                L.circleMarker([loc.lat, loc.lng], {
                    radius: 8,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.8
                }).addTo(map)
                  .bindPopup(`<b>${loc.type}</b><br>${loc.description || 'No description'}`);
            });
        })
        .catch(err => console.error("Error fetching reports:", err));
        
        // Handle hazard selection buttons
        const buttons = document.querySelectorAll('#controls button');
        let selectedType = null;
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedType = btn.innerText;
            });
        });

        // Add hazard marker when map clicked
        map.on('click', e => {
            if (!selectedType) {
                alert('Please select a hazard type first!');
                return;
            }

            const description = prompt("Add a short description (optional):");
            const { lat, lng } = e.latlng;
            const color = colors[selectedType] || 'gray';

            L.circleMarker([lat, lng], {
                radius: 8,
                color: color,
                fillColor: color,
                fillOpacity: 0.8
            }).addTo(map)
              .bindPopup(`<b>${selectedType}</b><br>${description || 'No description'}`)
              .openPopup();

            // Send report to backend
            fetch('http://localhost:5000/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng, type: selectedType, description })
            })
            .then(res => res.json())
            .then(data => console.log(data.message))
            .catch(err => console.error("Error sending report:", err));
        });
    }

});