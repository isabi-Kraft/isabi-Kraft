// Change this to your real backend endpoint
const API_URL = "/api/auth/forgot-password";
const RESEND_COOLDOWN_SECONDS = 60;

const form = document.getElementById("reset-form");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");
const statusBox = document.getElementById("status");
const submitBtn = document.getElementById("submit-btn");

const DEFAULT_BTN_TEXT = submitBtn.textContent;
let cooldownTimer = null;

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function showFieldError(message) {
    emailError.textContent = message;
    emailInput.classList.add("invalid");
}

function clearFieldError() {
    emailError.textContent = "";
    emailInput.classList.remove("invalid");
}

function showStatus(message, type) {
    statusBox.textContent = message;
    statusBox.className = "status " + type; // "success" or "fail"
}

function clearStatus() {
    statusBox.textContent = "";
    statusBox.className = "status";
}

function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Sending..." : DEFAULT_BTN_TEXT;
}

function startCooldown(seconds) {
    let remaining = seconds;
    submitBtn.disabled = true;
    submitBtn.textContent = "Resend in " + remaining + "s";

    clearInterval(cooldownTimer);
    cooldownTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(cooldownTimer);
            submitBtn.disabled = false;
            submitBtn.textContent = DEFAULT_BTN_TEXT;
        } else {
            submitBtn.textContent = "Resend in " + remaining + "s";
        }
    }, 1000);
}

emailInput.addEventListener("input", () => {
    clearFieldError();
    clearStatus();
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldError();
    clearStatus();

    const email = emailInput.value.trim().toLowerCase();

    if (!email) {
        showFieldError("Please enter your email address.");
        emailInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        showFieldError("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    setLoading(true);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        let data = {};
        try {
            data = await response.json();
        } catch (_) {
            // response had no JSON body
        }

        if (response.ok) {
            showStatus(
                data.message || "If that email is linked to an admin account, a reset link has been sent. Check your inbox and spam folder.",
                "success"
            );
            setLoading(false);
            startCooldown(RESEND_COOLDOWN_SECONDS);
        } else if (response.status === 429) {
            showStatus("Too many attempts. Please wait a few minutes and try again.", "fail");
            setLoading(false);
        } else {
            showStatus(data.message || "Something went wrong. Please try again.", "fail");
            setLoading(false);
        }
    } catch (error) {
        showStatus("Network error. Check your internet connection and try again.", "fail");
        setLoading(false);
    }
});
sessionStorage.setItem("resetEmail", emailInput.value);
window.location.href = "Confirmation-state.html";