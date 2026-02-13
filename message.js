let currentSlideIndex = 0;
let totalSlides = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const authId = localStorage.getItem('auth_session_id');
    const isValidated = localStorage.getItem('otp_validated');
    const sessionExpiry = localStorage.getItem('session_expiry');

    const currentTime = new Date();
    const expiryTime = sessionExpiry ? new Date(sessionExpiry) : null;

    // Redirect if not validated, no ID, or if time has run out
    if (!authId || isValidated !== 'true' || !expiryTime || currentTime > expiryTime) {
        console.warn("Session invalid or expired. Redirecting to login.");
        localStorage.clear(); // Clear potentially expired data
        window.location.href = "index.html";
        return;
    }
	
	const guestName = localStorage.getItem('guestName');
    if (guestName) document.getElementById('guestNameDisplay').textContent = guestName;
	startBackgroundSlideshow()
	startSessionTimer();
    await loadJourney(authId);
});

async function loadJourney(id) {
    const { data, error } = await supabaseClient.from('img_notes').select('*').eq('id', id);
    if (error || !data.length) return;

    totalSlides = data.length;
    const viewport = document.getElementById('storyViewport');
    viewport.innerHTML = '';

    data.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = `slide-item ${index === 0 ? 'active' : ''}`;
        slide.id = `slide-${index}`;
        
        slide.innerHTML = `
			<div class="photo-container">
				<div class="photo-frame" onclick="openModal('${item.img_url}')" style="cursor: zoom-in;">
					<img src="${item.img_url}" alt="Memory">
				</div>
			</div>
			<div class="note-container">
				<div class="notebook-page">
					<h2>${item.img_note}</h2>
				</div>
			</div>
		`;
        viewport.appendChild(slide);
    });

    updateUI();
}

function updateUI() {
    const slides = document.querySelectorAll('.slide-item');
    slides.forEach((s, i) => {
        s.classList.toggle('active', i === currentSlideIndex);
    });

    // Targeting the buttons
    const redeemBtn = document.getElementById('redeemBtn');
    const nextBtn = document.querySelector('button[onclick="nextSlide()"]');

    if (currentSlideIndex === totalSlides - 1) {
        // Final slide: Show Redeem, Hide Next
        redeemBtn.style.display = "block";
        if (nextBtn) nextBtn.style.display = "none";
    } else {
        // Other slides: Hide Redeem, Show Next
        redeemBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "block";
    }
}

function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
        currentSlideIndex++;
        updateUI();
    }
}

function prevSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        updateUI();
    }
}

function navigateToPayout() {
    window.location.href = "payout.html";
}

function startSessionTimer() {
    // Check for existing timer
    if (document.querySelector('.session-timer')) return;

    const timerDiv = document.createElement('div');
    timerDiv.className = 'session-timer';
    timerDiv.innerHTML = `
        <span class="timer-label">Access Expires In:</span>
        <span class="timer-value" id="timeLeft">--:--</span>
    `;
    
    // Attach to body directly
    document.body.appendChild(timerDiv);

    const expiryStr = localStorage.getItem('session_expiry');
    if (!expiryStr) return;

    const expiryTime = new Date(expiryStr).getTime();

    const updateTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = expiryTime - now;

        if (distance <= 0) {
            clearInterval(updateTimer);
            localStorage.clear();
            window.location.href = "index.html";
            return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const displayElement = document.getElementById("timeLeft");
        if (displayElement) {
            displayElement.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Warning color
            if (distance < 300000) { // 5 minutes
                displayElement.style.color = "#ff4d4d";
            }
        }
    }, 1000);
}

function openModal(imgSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('fullImage');
    const downloadBtn = document.getElementById('downloadBtn');
    
    modal.classList.add('active');
    modalImg.src = imgSrc;
    downloadBtn.href = imgSrc; // Set the download link to the image URL
}

function closeModal() {
    document.getElementById('imageModal').classList.remove('active');
}

function startBackgroundSlideshow() {
    const slides = document.querySelectorAll('.bg-slide');
    if (slides.length === 0) return;

    let currentIndex = 0;

    setInterval(() => {
        // Remove active class from current
        slides[currentIndex].classList.remove('active');
        
        // Move to next slide
        currentIndex = (currentIndex + 1) % slides.length;
        
        // Add active class to next
        slides[currentIndex].classList.add('active');
    }, 6000); // Transitions every 6 seconds
}