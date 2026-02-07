// --- CONFIGURATION ---
const SUPABASE_URL = 'https://wivamsbwvojjzvvbaeet.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rs2u88McT9Exv4k-rffQaQ__PcIVG2M';
const EMAILJS_PUBLIC_KEY = 'PrExvx8nTn9N3T6oH';
const EMAILJS_SERVICE_ID = 'service_yzuzi9b';
const EMAILJS_TEMPLATE_ID = 'template_ylr0typ';
const RECIPIENT_EMAIL = 'ranadeep_banik@yahoo.com'; 

// Initialize clients
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
(function() { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); })();

let canResend = true;

async function generateAndSendOTP() {
    // 1. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Calculate time
    const expiryDate = new Date(new Date().getTime() + 15 * 60000); 
    const formattedTime = expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 3. Update Supabase
    const { error } = await _supabase.from('wedding_otps').upsert({ 
        email: RECIPIENT_EMAIL, 
        otp: otp 
    }, { onConflict: 'email' });
    
    if (error) throw error;

    // 4. Send EmailJS
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        email: RECIPIENT_EMAIL,
        otp_code: otp,
        time: formattedTime 
    });
}

async function handleEnvelopeClick() {
    const env = document.getElementById('envelope');
    if (env.classList.contains('open')) return;
    
    env.classList.add('open');
    document.getElementById('card-content').classList.add('hidden');
    document.getElementById('loader').classList.remove('hidden');

    try {
        await generateAndSendOTP();
        startResendTimer();
        setTimeout(() => {
            document.getElementById('envelope-container').classList.add('hidden');
            document.getElementById('otp-section').classList.remove('hidden');
        }, 2200);
    } catch (err) {
        alert("Could not send verification code. Please refresh the page.");
    }
}

async function verifyOTP() {
    const userInput = document.getElementById('otp-input').value;
    const { data } = await _supabase.from('wedding_otps').select('otp').eq('email', RECIPIENT_EMAIL).single();

    if (data && data.otp === userInput) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#d4af37', '#ffffff']
        });
        document.getElementById('otp-section').classList.add('hidden');
        document.getElementById('gift-message').classList.remove('hidden');
    } else {
        document.getElementById('error-msg').innerText = "Incorrect code. Please try again.";
    }
}

function resendOTP() {
    if (!canResend) return;
    const btn = document.getElementById('resend-btn');
    btn.innerText = "Sending...";
    generateAndSendOTP().then(() => {
        startResendTimer();
        alert("A new code has been sent!");
    }).catch(() => alert("Resend failed.")).finally(() => btn.innerText = "Resend Code");
}

function startResendTimer() {
    canResend = false;
    const btn = document.getElementById('resend-btn');
    const timerText = document.getElementById('timer');
    let timeLeft = 30;
    btn.disabled = true;
    const countdown = setInterval(() => {
        timeLeft--;
        timerText.innerText = `(${timeLeft}s)`;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            canResend = true;
            btn.disabled = false;
            timerText.innerText = "";
        }
    }, 1000);
}