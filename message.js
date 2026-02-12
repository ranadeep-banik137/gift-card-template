const SUPABASE_URL = "https://wivamsbwvojjzvvbaeet.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rs2u88McT9Exv4k-rffQaQ__PcIVG2M"; // Using your key
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Restriction Check
    const authId = localStorage.getItem('auth_session_id');
    const isValidated = localStorage.getItem('otp_validated');

    if (!authId || isValidated !== 'true') {
        window.location.href = "index.html";
        return;
    }

    await fetchMessages(authId);
});

async function fetchMessages(userId) {
    const container = document.getElementById('messageContainer');

    try {
        const { data, error } = await supabaseClient
            .from('img_notes')
            .select('*')
            .eq('id', userId);

        if (error) throw error;

        container.innerHTML = ''; // Clear loader

        if (data && data.length > 0) {
            data.forEach((item, index) => {
                const section = document.createElement('div');
                section.className = 'message-item';
                
                section.innerHTML = `
                    <div class="img-frame">
                        <img src="${item.img_url}" alt="Memories">
                    </div>
                    <div class="text-content">
                        <p class="note-text">"${item.img_note}"</p>
                    </div>
                `;
                container.appendChild(section);
                
                // Trigger reveal animation
                setTimeout(() => section.classList.add('reveal'), 100 * index);
            });
        } else {
            container.innerHTML = `<p style="text-align:center">Welcome! We are so glad to have you with us.</p>`;
        }
    } catch (err) {
        console.error("Fetch error:", err);
        container.innerHTML = `<p style="text-align:center">Error loading message. Please proceed to your gift.</p>`;
    }
}

function navigateToPayout() {
    window.location.href = "payout.html";
}