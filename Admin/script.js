// ====== CONFIG ======
const API_URL = "/api/admin/login";            // TODO: replace with your real endpoint
const DASHBOARD_URL = "Admin-dashboard.html";  // TODO: replace with your dashboard page
const REMEMBER_KEY = "isabi_admin_email";
const TOKEN_KEY = "isabi_admin_token";

// ====== ELEMENTS ======
const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberBox = document.getElementById("remember");
const loginBtn = document.getElementById("login-btn");
const togglePasswordBtn = document.getElementById("toggle-password");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const formError = document.getElementById("form-error");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ====== HELPERS ======
function setFieldError(input, errorEl, message) {
    errorEl.textContent = message;
    input.classList.toggle("input-error", Boolean(message));
}

function clearErrors() {
    setFieldError(emailInput, emailError, "");
    setFieldError(passwordInput, passwordError, "");
    formError.textContent = "";
    formError.style.display = "none";
}

function showFormError(message) {
    formError.textContent = message;
    formError.style.display = "block";
}

function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    loginBtn.textContent = isLoading ? "Logging in..." : "Log in";
}

function validate() {
    let valid = true;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
        setFieldError(emailInput, emailError, "Email is required.");
        valid = false;
    } else if (!EMAIL_REGEX.test(email)) {
        setFieldError(emailInput, emailError, "Enter a valid email address.");
        valid = false;
    } else {
        setFieldError(emailInput, emailError, "");
    }

    if (!password) {
        setFieldError(passwordInput, passwordError, "Password is required.");
        valid = false;
    } else if (password.length < 6) {
        setFieldError(passwordInput, passwordError, "Password must be at least 6 characters.");
        valid = false;
    } else {
        setFieldError(passwordInput, passwordError, "");
    }

    return valid;
}

// ====== SHOW / HIDE PASSWORD ======
togglePasswordBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePasswordBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    togglePasswordBtn.innerHTML = isHidden
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
});

// ====== REMEMBER ME (prefill email) ======
const savedEmail = localStorage.getItem(REMEMBER_KEY);
if (savedEmail) {
    emailInput.value = savedEmail;
    rememberBox.checked = true;
}

// ====== CLEAR FIELD ERROR WHILE TYPING ======
emailInput.addEventListener("input", () => setFieldError(emailInput, emailError, ""));
passwordInput.addEventListener("input", () => setFieldError(passwordInput, passwordError, ""));

// ====== SUBMIT ======
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validate()) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    setLoading(true);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        let data = {};
        try {
            data = await response.json();
        } catch {
            // response had no JSON body
        }

        if (!response.ok) {
            const message =
                response.status === 401
                    ? "Incorrect email or password."
                    : data.message || "Login failed. Please try again.";
            showFormError(message);
            return;
        }

        // Remember email
        if (rememberBox.checked) {
            localStorage.setItem(REMEMBER_KEY, email);
        } else {
            localStorage.removeItem(REMEMBER_KEY);
        }

        // Store token (adjust key name to match your API response)
        if (data.token) {
            const storage = rememberBox.checked ? localStorage : sessionStorage;
            storage.setItem(TOKEN_KEY, data.token);
        }

        window.location.href = DASHBOARD_URL;
    } catch (error) {
        showFormError("Network error. Check your connection and try again.");
    } finally {
        setLoading(false);
    }
});