// SUPABASE & EMAILJS (Keeping your backend intact)
const SUPABASE_URL = "https://wivamsbwvojjzvvbaeet.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rs2u88McT9Exv4k-rffQaQ__PcIVG2M";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
emailjs.init("PrExvx8nTn9N3T6oH");

// --- BACKGROUND SLIDESHOW LOGIC ---
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}
setInterval(nextSlide, 6000); // Change image every 6 seconds

// --- UI TRANSITION ---
function handleEnvelopeOpen() {
    const env = document.querySelector('.envelope-container');
    env.classList.add('open');
    
    setTimeout(() => {
        document.getElementById('giftSection').style.opacity = "0";
        document.getElementById('giftSection').style.transform = "scale(0.9)";
        
        setTimeout(() => {
            document.getElementById('giftSection').classList.add('hidden');
            const auth = document.getElementById('authSection');
            auth.classList.remove('hidden');
            // Force reflow for fade in
            auth.offsetHeight; 
            auth.style.opacity = "1";
        }, 600);
    }, 800);
}

// --- AUTH LOGIC (Your existing backend flow) ---
async function requestOTP() {
    const email = document.getElementById('email').value.trim();
    if(!email) return alert("Please enter your guest email.");

    toggleLoading(true);

    try {
        const { data: user, error } = await supabaseClient
            .from("gift_otps")
            .select("customer_name")
            .eq("email", email)
            .single();

        if (error || !user) throw new Error("Email not recognized. Please check your invitation.");

        const otp = Math.floor(100000 + Math.random() * 900000);
        await supabaseClient.from("gift_otps").upsert({ email, otp, is_claimed: false, updated_at: new Date().toISOString() });

        /*await emailjs.send("service_yzuzi9b", "template_ylr0typ", {
            email: email,
            otp_code: otp,
            customer_name: user.customer_name
        });*/

        localStorage.setItem("guestName", user.customer_name);
        
        document.getElementById('emailInputGroup').classList.add('hidden');
        document.getElementById('otpInputGroup').classList.remove('hidden');

    } catch (err) {
        alert(err.message);
    } finally {
        toggleLoading(false);
    }
}

async function verifyAndRedirect() {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;

    const { data } = await supabaseClient
        .from("gift_otps")
        .select("*")
        .eq("email", email)
        .eq("otp", otp)
        .single();

    if (data) {
        localStorage.setItem("otp_validated", "true");
		localStorage.setItem("auth_session_id", data.id); // Storing the UUID for the next page
		window.location.href = "message.html"; // Change redirection to message.html
    } else {
        alert("Verification failed. Please check your code.");
    }
}

function toggleLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
    document.getElementById('sendBtn').disabled = show;
}

function resetUI() {
    document.getElementById('otpInputGroup').classList.add('hidden');
    document.getElementById('emailInputGroup').classList.remove('hidden');
}