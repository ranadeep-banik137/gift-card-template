/* ---------------- SUPABASE INIT ---------------- */

const SUPABASE_URL = "https://wivamsbwvojjzvvbaeet.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rs2u88McT9Exv4k-rffQaQ__PcIVG2M";

/* IMPORTANT:
   supabase (lowercase) already exists from CDN
   so we create OUR client with a different name
*/
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* ---------------- EMAILJS INIT ---------------- */

emailjs.init("PrExvx8nTn9N3T6oH");

/* ---------------- UI FUNCTIONS ---------------- */

function openGift() {
  document.querySelector(".gift-container").classList.add("open");
  createRoses();

  setTimeout(() => {
    document.getElementById("authCard").classList.remove("hidden");
  }, 1200);
}

function closeAuth() {
  document.getElementById("authCard").classList.add("hidden");
}

function goBack() {
  document.getElementById("stepOTP").classList.add("hidden");
  document.getElementById("stepEmail").classList.remove("hidden");
}

/* ---------------- ROSE PETALS ---------------- */

function createRoses() {
  const container = document.getElementById("roseContainer");

  for (let i = 0; i < 25; i++) {
    const petal = document.createElement("div");
    petal.className = "rose";
    petal.style.left = Math.random() * 100 + "vw";
    petal.style.animationDuration = 3 + Math.random() * 3 + "s";
    container.appendChild(petal);

    setTimeout(() => petal.remove(), 6000);
  }
}

/* ---------------- OTP FLOW ---------------- */

async function sendOTP() {

  console.log("Send OTP clicked"); // DEBUG – YOU SHOULD SEE THIS

  const emailInput = document.getElementById("email");
  const sendBtn = document.getElementById("sendOtpBtn");
  const sendingState = document.getElementById("sendingState");

  if (!emailInput || !sendBtn || !sendingState) {
    alert("Critical UI element missing");
    return;
  }

  const email = emailInput.value.trim();
  if (!email) {
    alert("Please enter your email");
    return;
  }

  // 🔥 FORCE UI CHANGE (NO CLASSES)
  sendBtn.disabled = true;
  sendBtn.innerText = "Sending…";
  sendingState.style.display = "flex";

  // Personalize name
  document.getElementById("guestName").innerText =
    email.split("@")[0];

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const { error } = await supabaseClient
      .from("wedding_otps")
      .upsert(
        { email, otp, is_claimed: false },
        { onConflict: "email" }
      );

    if (error) throw error;

    //TODO

    // Move to OTP step
    setTimeout(() => {
      document.getElementById("stepEmail").style.display = "none";
      document.getElementById("stepOTP").style.display = "block";
    }, 700);

  } catch (err) {
    console.error(err);
    alert("Failed to send OTP");

    // RESET UI
    sendBtn.disabled = false;
    sendBtn.innerText = "Send OTP";
    sendingState.style.display = "none";
  }
}

async function verifyOTP() {
  const email = document.getElementById("email").value;
  const otp = document.getElementById("otp").value;

  const { data, error } = await supabaseClient
    .from("wedding_otps")
    .select("*")
    .eq("email", email)
    .eq("otp", otp)
    .single();

  if (error || !data) {
    alert("Invalid OTP");
    return;
  }

  launchConfetti();

  setTimeout(() => {
    window.location.href = "payout.html";
  }, 2500);
}

/* ---------------- CONFETTI ---------------- */

function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 150 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 5 + Math.random() * 5,
    speed: 2 + Math.random() * 3
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      p.y += p.speed;
      ctx.fillStyle = "gold";
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    requestAnimationFrame(animate);
  }

  animate();
}
