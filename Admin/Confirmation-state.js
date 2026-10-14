const RESEND_COOLDOWN = 60; // seconds

const emailText = document.getElementById("user-email");
const openMail = document.getElementById("open-mail");
const resendBtn = document.getElementById("resend");
const timerText = document.getElementById("timer");
const statusText = document.getElementById("status");

let countdownId = null;

// 1. Get the email: URL (?email=...) first, then sessionStorage, else keep the default text
function getEmail() {
    const params = new URLSearchParams(window.location.search);
    return params.get("email") || sessionStorage.getItem("resetEmail") || emailText.textContent.trim();
}

const email = getEmail();
emailText.textContent = email;

// 2. Point "Open Email App" to the user's email provider
function getMailLink(address) {
    const domain = address.split("@")[1]?.toLowerCase() || "";

    const providers = {
        "gmail.com": "https://mail.google.com/",
        "googlemail.com": "https://mail.google.com/",
        "yahoo.com": "https://mail.yahoo.com/",
        "ymail.com": "https://mail.yahoo.com/",
        "outlook.com": "https://outlook.live.com/mail/",
        "hotmail.com": "https://outlook.live.com/mail/",
        "live.com": "https://outlook.live.com/mail/",
        "icloud.com": "https://www.icloud.com/mail",
        "proton.me": "https://mail.proton.me/",
        "protonmail.com": "https://mail.proton.me/"
    };

    // Unknown provider: open the default mail app on the device
    return providers[domain] || "mailto:";
}

openMail.href = getMailLink(email);

// 3. Status message helper
function showStatus(text, type) {
    statusText.textContent = text;
    statusText.classList.remove("success", "error");
    if (type) {
        statusText.classList.add(type);
    }
}

// 4. Resend cooldown timer
function startCooldown(seconds) {
    let remaining = seconds;
    resendBtn.disabled = true;
    timerText.textContent = "(" + remaining + "s)";

    clearInterval(countdownId);
    countdownId = setInterval(function () {
        remaining--;

        if (remaining <= 0) {
            clearInterval(countdownId);
            resendBtn.disabled = false;
            timerText.textContent = "";
            return;
        }

        timerText.textContent = "(" + remaining + "s)";
    }, 1000);
}

// 5. Replace this with your real API call
async function sendResetEmail(address) {
    // Example:
    // const res = await fetch("/api/forgot-password", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email: address })
    // });
    // if (!res.ok) throw new Error("Request failed");

    return new Promise(function (resolve) {
        setTimeout(resolve, 800);
    });
}

resendBtn.addEventListener("click", async function () {
    resendBtn.disabled = true;
    showStatus("Sending...", null);

    try {
        await sendResetEmail(email);
        showStatus("A new reset link has been sent to " + email + ".", "success");
        startCooldown(RESEND_COOLDOWN);
    } catch (error) {
        showStatus("Could not resend the email. Please try again.", "error");
        resendBtn.disabled = false;
    }
});

// Start the cooldown as soon as the page loads, since an email was just sent
startCooldown(RESEND_COOLDOWN);