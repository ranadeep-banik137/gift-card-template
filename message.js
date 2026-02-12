const SUPABASE_URL = "https://wivamsbwvojjzvvbaeet.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rs2u88McT9Exv4k-rffQaQ__PcIVG2M";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentSlideIndex = 0;
let totalSlides = 0;
let autoCycle;

document.addEventListener('DOMContentLoaded', async () => {
    const authId = localStorage.getItem('auth_session_id');
    const guestName = localStorage.getItem('guestName');

    if (!authId || localStorage.getItem('otp_validated') !== 'true') {
        window.location.href = "index.html";
        return;
    }

    const nameSpan = document.getElementById('guestNameDisplay');
    if (nameSpan && guestName) {
        nameSpan.textContent = guestName.toUpperCase();
    }

    await loadJourney(authId);
});

async function loadJourney(id) {
    const { data, error } = await supabaseClient
        .from('img_notes')
        .select('*')
        .eq('id', id);

    if (error || !data.length) {
        window.location.href = "payout.html";
        return;
    }

    totalSlides = data.length;
    const viewport = document.getElementById('storyViewport');
    viewport.innerHTML = ''; 

    data.forEach((item, index) => {
		const slide = document.createElement('div');
		slide.className = `slide-item ${index === 0 ? 'active' : ''}`;
		slide.id = `slide-${index}`;
		
		slide.innerHTML = `
			<div class="slide-img">
				<img src="${item.img_url}" alt="Memory">
				<div class="img-actions">
					<a href="${item.img_url}" target="_blank" class="action-icon-btn">🔍</a>
					<a href="${item.img_url}" download class="action-icon-btn">💾</a>
				</div>
			</div>
			<div class="note-container">
				<div class="handwritten-note">
					<div class="slide-text">
						<h2>${item.img_note}</h2>
					</div>
				</div>
			</div>
		`;
		viewport.appendChild(slide);
	});

    document.getElementById('navButtons').classList.remove('hidden');
    startAutoSlide();
}

function updateSlides() {
    const slides = document.querySelectorAll('.slide-item');
    slides.forEach((s, i) => s.classList.toggle('active', i === currentSlideIndex));
    
    document.getElementById('progressBar').style.width = `${((currentSlideIndex + 1) / totalSlides) * 100}%`;
    
    const redeemBtn = document.getElementById('redeemBtn');
    redeemBtn.style.display = (currentSlideIndex === totalSlides - 1) ? "block" : "none";
}

function startAutoSlide() {
    clearInterval(autoCycle);
    autoCycle = setInterval(() => {
        if (currentSlideIndex < totalSlides - 1) {
            currentSlideIndex++;
            updateSlides();
        } else {
            clearInterval(autoCycle);
        }
    }, 6000);
}

function nextSlide() { currentSlideIndex = (currentSlideIndex + 1) % totalSlides; updateSlides(); startAutoSlide(); }
function prevSlide() { currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides; updateSlides(); startAutoSlide(); }
function navigateToPayout() { window.location.href = "payout.html"; }