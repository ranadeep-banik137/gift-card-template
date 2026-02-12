const SUPABASE_URL = "https://wivamsbwvojjzvvbaeet.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rs2u88McT9Exv4k-rffQaQ__PcIVG2M";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

emailjs.init("PrExvx8nTn9N3T6oH");

function handleEnvelopeOpen() {
    const env = document.querySelector('.envelope-container');
    env.classList.add('open');
    
    setTimeout(() => {
        document.getElementById('giftSection').style.opacity = "0";
        setTimeout(() => {
            document.getElementById('giftSection').classList.add('hidden');
            const auth = document.getElementById('authSection');
            auth.classList.remove('hidden');
            setTimeout(() => auth.style.opacity = "1", 50);
        }, 600);
    }, 800);
}

async function requestOTP() {
    const email = document.getElementById('email').value.trim();
    if(!email) return alert("Please enter your email");

    toggleLoading(true);

    try {
        // 1. Fetch User (Keeps your backend logic)
        const { data: user, error } = await supabaseClient
            .from("wedding_otps")
            .select("customer_name")
            .eq("email", email)
            .single();

        if (error || !user) throw new Error("Guest email not verified.");

        // 2. Generate and Update OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        await supabaseClient.from("wedding_otps").upsert({ email, otp, is_claimed: false });

        // 3. Email via EmailJS
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
        .from("wedding_otps")
        .select("*")
        .eq("email", email)
        .eq("otp", otp)
        .single();

    if (data) {
        window.location.href = "payout.html";
    } else {
        alert("Incorrect Code.");
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