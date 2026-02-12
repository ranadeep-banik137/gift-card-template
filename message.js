const SUPABASE_URL = "https://wivamsbwvojjzvvbaeet.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rs2u88McT9Exv4k-rffQaQ__PcIVG2M";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentSlideIndex = 0;
let totalSlides = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const guestName = localStorage.getItem('guestName');
    if (guestName) document.getElementById('guestNameDisplay').textContent = guestName;
    
    const authId = localStorage.getItem('auth_session_id');
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
                <div class="photo-frame">
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