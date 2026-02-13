// Global Supabase Instance
let supabaseClient = null;
let configKeys = null;

async function bootSystem() {
    try {
        // 1. Fetch Secure Strings from Netlify
        const response = await fetch('/.netlify/functions/get-config');
        configKeys = await response.json();

        if (!configKeys.supabaseUrl || !configKeys.supabaseKey) {
            throw new Error("Handshake Failed");
        }

        // 2. Initialize Supabase Client
        supabaseClient = supabase.createClient(configKeys.supabaseUrl, configKeys.supabaseKey);

        // 3. Initialize EmailJS if on Login Page
        if (typeof emailjs !== "undefined" && configKeys.emailjsKey) {
            emailjs.init(configKeys.emailjsKey);
        }

        console.log("👑 Imperial Systems Online.");
		
		const path = window.location.pathname;

        // --- TRIGGER PAGE LOGIC ---
        if (path.includes('message.html')) {
            if (typeof startMessageSequence === "function") startMessageSequence();
        } 
        else if (path.includes('payout.html')) {
            if (typeof startPayoutSequence === "function") startPayoutSequence();
        }

    } catch (err) {
        console.error("Security Breach or Network Error:", err);
        // Optional: Redirect to an error page or show a 'Maintenance' message
    }
}

// Auto-run on load
window.addEventListener('DOMContentLoaded', bootSystem);