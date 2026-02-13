        // Function that init.js will call
		async function startPayoutSequence() {
			const authId = localStorage.getItem('auth_session_id');
			const guestName = localStorage.getItem('guestName');
			
			if (!authId) { window.location.href = "index.html"; return; }
			
			document.getElementById('guestName').innerText = guestName || "Royal Guest";
			
			await fetchVoucherData(authId);
			startSessionTimer();
			initSlideshow();
		}

		document.addEventListener('DOMContentLoaded', () => {
			if (window.supabaseClient) startPayoutSequence();
		});

        async function fetchVoucherData(authId) {
            try {
                const { data, error } = await supabaseClient
                    .from('voucher')
                    .select('*')
                    .eq('assigned_to', authId)
                    .single();
				console.log('Voucher Data', data)
                if (data) {
					const platformTitle = data.gift_platform ? `${data.gift_platform.toUpperCase()} TOKEN` : "ROYAL TOKEN";
                    document.getElementById('platformName').innerText = platformTitle;
                    document.getElementById('targetPlatform').innerText = data.gift_platform;
                    const codeElement = document.getElementById('voucherCode');
					codeElement.innerText = data.voucher_key;
					codeElement.setAttribute('data-full-key', data.voucher_key); // Store full key here

					if (data.voucher_pin) {
						const pinElement = document.getElementById('voucherPin');
						document.getElementById('voucherPinGroup').style.display = 'block';
						pinElement.innerText = data.voucher_pin;
						pinElement.setAttribute('data-full-key', data.voucher_pin); // Store full pin here
					}
                }
            } catch (e) { console.error(e); }
        }

        function startSessionTimer() {
            const expiryStr = localStorage.getItem('session_expiry');
            if (!expiryStr) return;
            const expiryTime = new Date(expiryStr).getTime();

            const updateTimer = setInterval(() => {
                const now = new Date().getTime();
                const distance = expiryTime - now;

                if (distance <= 0) {
                    clearInterval(updateTimer);
                    localStorage.clear();
                    window.location.href = "index.html";
                    return;
                }

                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                const displayElement = document.getElementById("timeLeft");
                if (displayElement) {
                    displayElement.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    if (distance < 300000) { // 5 minutes warning color from message.js
                        displayElement.style.color = "#ff4d4d";
                    }
                }
            }, 1000);
        }

        function copyText(id, btn) {
			const el = document.getElementById(id);
			// Get full key from attribute, fallback to innerText if attribute missing
			const textToCopy = el.getAttribute('data-full-key') || el.innerText;
			
			navigator.clipboard.writeText(textToCopy);
			
			const originalInner = btn.innerHTML;
			btn.innerHTML = '<span style="font-size:10px; color:#d4af37">COPIED</span>';
			setTimeout(() => btn.innerHTML = originalInner, 2000);
		}

        function toggleSteps() { document.getElementById('stepsModal').classList.toggle('hidden'); }

        function initSlideshow() {
            const slides = document.querySelectorAll('.payout-slide');
            let idx = 0;
            setInterval(() => {
                slides[idx].classList.remove('active');
                idx = (idx + 1) % slides.length;
                slides[idx].classList.add('active');
            }, 6000);
        }
		
		function redeemOnPhonePe(codeId) {
			const code = document.getElementById(codeId).innerText;
			
			// 1. Copy to clipboard
			navigator.clipboard.writeText(code).then(() => {
				alert("Code copied! Opening PhonePe...");
				
				// 2. Attempt to open PhonePe app
				// Note: This works best on mobile devices
				window.location.href = "phonepe://";
				
				// Fallback: If app doesn't open in 2 seconds, go to website
				setTimeout(() => {
					window.open("https://www.phonepe.com/", "_blank");
				}, 2000);
			});
		}