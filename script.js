// --- CONFIGURATION ---
const SUPABASE_URL = 'https://wivamsbwvojjzvvbaeet.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rs2u88McT9Exv4k-rffQaQ__PcIVG2M';
const EMAILJS_PUBLIC_KEY = 'PrExvx8nTn9N3T6oH';
const EMAILJS_SERVICE_ID = 'service_yzuzi9b';
const EMAILJS_TEMPLATE_ID = 'template_ylr0typ';
const RECIPIENT_EMAIL = 'ranadeep_banik@yahoo.com'; 

// FIX: Renamed variable to _supabase to avoid conflict with the global library
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
(function() {
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY,
    });
})();

let canResend = true;

async function generateAndSendOTP() {
    // 1. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
	
	// 2. Calculate Expiry Time (Current Time + 15 Minutes)
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 15 * 60000); 
    
    // Format the time (e.g., "10:45 PM")
    const formattedTime = expiryDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // 2. Save to Supabase
    const { error: dbError } = await _supabase
        .from('wedding_otps')
        .upsert({ email: RECIPIENT_EMAIL, otp: otp }, { onConflict: 'email' });
    
    if (dbError) throw dbError;

    // 3. Prepare Template Parameters
    // IMPORTANT: Make sure these keys match the {{variables}} in your EmailJS Template
    const templateParams = {
        email: RECIPIENT_EMAIL,
        otp_code: otp,
		time: formattedTime // Matches the {{time}} in your template
    };

    console.log("Attempting to send email to:", RECIPIENT_EMAIL);

    // 4. Send via EmailJS
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
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
        }, 1500);
    } catch (err) {
        console.error(err);
        alert("Error sending email. Please check your configuration.");
    }
}

async function resendOTP() {
    if (!canResend) return;
    
    const resendBtn = document.getElementById('resend-btn');
    resendBtn.innerText = "Sending...";
    
    try {
        await generateAndSendOTP();
        startResendTimer();
        alert("A new code has been sent!");
    } catch (err) {
        alert("Failed to resend. Please try again later.");
    } finally {
        resendBtn.innerText = "Resend OTP";
    }
}

function startResendTimer() {
    canResend = false;
    const btn = document.getElementById('resend-btn');
    const timerText = document.getElementById('timer');
    let timeLeft = 30;

    btn.disabled = true;
    
    const countdown = setInterval(() => {
        timeLeft--;
        timerText.innerText = `Wait ${timeLeft}s to resend`;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            canResend = true;
            btn.disabled = false;
            timerText.innerText = "";
        }
    }, 1000);
}

async function verifyOTP() {
    const userInput = document.getElementById('otp-input').value;
    const { data, error } = await _supabase
        .from('wedding_otps')
        .select('otp')
        .eq('email', RECIPIENT_EMAIL)
        .single();

    if (data && data.otp === userInput) {
        document.getElementById('otp-section').classList.add('hidden');
        document.getElementById('gift-message').classList.remove('hidden');
    } else {
        document.getElementById('error-msg').innerText = "Incorrect code. Try again.";
    }
}