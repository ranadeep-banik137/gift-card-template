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

    try {
        await generateAndSendOTP();
        startResendTimer();

        setTimeout(() => {
            document.getElementById('envelope-container').classList.add('hidden');
            document.getElementById('otp-section').classList.remove('hidden');
        }, 1800);

    } catch (err) {
        alert("Could not send verification code. Please refresh the page.");
    }
}

async function verifyOTP() {
    const userInput = document.getElementById('otp-input').value;
    const { data } = await _supabase.from('wedding_otps').select('otp').eq('email', RECIPIENT_EMAIL).single();

    if (data && data.otp === userInput) {
		confetti({ particleCount: 180, spread: 80 });
		startRosePetals()
		document.getElementById('otp-section').classList.add('hidden');
		fadeInMusic();
		startRevealSequence();
	} else {
        document.getElementById('error-msg').innerText = "Incorrect code. Please try again.";
    }
}

function fadeInMusic() {
  const music = document.getElementById('bg-music');
  music.volume = 0;
  music.play();

  let v = 0;
  const fade = setInterval(() => {
    v += 0.02;
    music.volume = Math.min(v, 0.35);
    if (v >= 0.35) clearInterval(fade);
  }, 120);
}

function startRosePetals() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = 0;
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 9999;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const petals = Array.from({ length: 30 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: 6 + Math.random() * 6,
    speed: 0.6 + Math.random(),
    drift: Math.random() * 2 - 1,
    angle: Math.random() * Math.PI
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = 'rgba(214, 77, 109, 0.7)';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      p.y += p.speed;
      p.x += p.drift;
      p.angle += 0.01;

      if (p.y > canvas.height) p.y = -20;
    });
    requestAnimationFrame(draw);
  }

  draw();

  setTimeout(() => canvas.remove(), 9000);
}

function startRevealSequence() {
    const stage = document.getElementById('reveal-stage');
    const layers = document.querySelectorAll('.mask-layer');
    stage.classList.remove('hidden');

    layers.forEach((layer, index) => {
        // Rapid fire: images blast out every 1.5 seconds
        setTimeout(() => {
            layer.classList.add('active');
        }, index * 1500);
    });

    // Fade out the black stage and reveal the gift card
    const totalTime = (layers.length * 1500) + 3000;
    setTimeout(() => {
        stage.style.transition = 'opacity 2s ease';
        stage.style.opacity = '0';
        setTimeout(() => {
            stage.classList.add('hidden');
            document.getElementById('gift-message').classList.remove('hidden');
        }, 2000);
    }, totalTime);
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

function initiateRedeem() {
    // Show a quick loading state
    const btn = document.querySelector('.redeem-btn');
    btn.innerText = "Redirecting to Secure Portal...";
    
    // Smoothly redirect to the separate banking page
    setTimeout(() => {
        window.location.href = 'payout.html';
    }, 1200);
}