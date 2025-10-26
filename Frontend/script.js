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

    // --- Lead Magnet Modal (optional marketing feature) ---
    const leadMagnetModal = document.getElementById('lead-magnet-modal');
    if (leadMagnetModal) {
        const closeModalButtons = leadMagnetModal.querySelectorAll('.close-modal');
        const modalAlreadyShown = localStorage.getItem('u4uModalClosed');

        const showModal = () => {
            if (!modalAlreadyShown) {
                leadMagnetModal.classList.add('show');
            }
        };

        const closeModal = () => {
            localStorage.setItem('u4uModalClosed', 'true');
            leadMagnetModal.classList.remove('show');
        };

        setTimeout(showModal, 5000);

        closeModalButtons.forEach(button => {
            button.addEventListener('click', closeModal);
        });

        leadMagnetModal.addEventListener('click', (e) => {
            if (e.target === leadMagnetModal) {
                closeModal();
            }
        });
    }

    // --- FAQ Accordion ---
    const faqCards = document.querySelectorAll('.faq-card');
    if (faqCards) {
        faqCards.forEach(card => {
            const question = card.querySelector('.faq-question');
            const answer = card.querySelector('.faq-answer');

            question.addEventListener('click', () => {
                const isActive = card.classList.contains('active');

                // close others
                faqCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('active');
                        otherCard.querySelector('.faq-answer').style.maxHeight = null;
                    }
                });

                // toggle this one
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

    // --- Fade-in animations ---
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

    // --- SAFETY MAP SECTION ---
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        return; // page doesn't have a map section
    }

    console.log("Initializing map...");

    if (typeof L === 'undefined') {
        console.error("Leaflet is not loaded. Include Leaflet <script> and <link>.");
        return;
    }

    // IMPORTANT: use the same origin Flask is serving on
    const API_BASE = "http://127.0.0.1:5000";

    // hazard colors
    const colors = {
        "Slippery": "blue",
        "Low Lighting": "orange",
        "Isolated": "red"
    };

    // track which hazard type user chose
    let selectedType = null;
    const buttons = document.querySelectorAll('#controls button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            // use data-type for clean, stable value
            selectedType = btn.dataset.type || btn.innerText.trim();
            console.log("Selected hazard:", selectedType);
        });
    });

    // init map at 0,0 then recenter
    const map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // center on user
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

    // helper to place a marker with popup
    function drawMarker(lat, lng, type, description, timestamp) {
        const color = colors[type] || 'gray';
        const prettyDesc = description || 'No description';
        const prettyTime = timestamp ? `<br><small>${timestamp}</small>` : '';

        L.circleMarker([lat, lng], {
            radius: 8,
            color: color,
            fillColor: color,
            fillOpacity: 0.8
        })
        .addTo(map)
        .bindPopup(`<b>${type}</b><br>${prettyDesc}${prettyTime}`);
    }

    // 1) LOAD EXISTING REPORTS FROM BACKEND
    fetch(`${API_BASE}/reports`, {
        method: 'GET'
    })
    .then(res => res.json())
    .then(data => {
        console.log("Loaded reports from server:", data);

        if (!Array.isArray(data)) {
            console.error("Server returned error instead of list:", data);
            return;
        }

        data.forEach(loc => {
            drawMarker(loc.lat, loc.lng, loc.type, loc.description, loc.timestamp);
        });
    })
    .catch(err => {
        console.error("Error fetching reports:", err);
    });

    // 2) HANDLE CLICK ON MAP TO CREATE NEW REPORT
    map.on('click', e => {
        console.log("Map clicked at:", e.latlng);

        if (!selectedType) {
            alert('Please select a hazard type first!');
            return;
        }

        const description = prompt("Add a short description (optional):") || "";
        const { lat, lng } = e.latlng;

        console.log("Submitting report:", {
            lat,
            lng,
            type: selectedType,
            description
        });

        // optimistic display
        drawMarker(lat, lng, selectedType, description, new Date().toISOString());

        // send to backend to save in DB
        fetch(`${API_BASE}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lat: lat,
                lng: lng,
                type: selectedType,
                description: description
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Server says:", data);
        })
        .catch(err => {
            console.error("Error sending report:", err);
            alert("Could not save to server.");
        });
    });
});
