const form = document.getElementById("password-form");
const newPassword = document.getElementById("new");
const confirmPassword = document.getElementById("confirm");
const message = document.getElementById("message");

function setState(input, state) {
    input.classList.remove("valid", "invalid");
    if (state) {
        input.classList.add(state);
    }
}

function showMessage(text, type) {
    message.textContent = text;
    message.classList.remove("error", "success");
    if (type) {
        message.classList.add(type);
    }
}

function checkMatch() {
    // Show nothing until the user starts typing in the confirm field
    if (confirmPassword.value === "") {
        showMessage("", null);
        setState(confirmPassword, null);
        return false;
    }

    if (newPassword.value !== confirmPassword.value) {
        showMessage("Passwords do not match.", "error");
        setState(confirmPassword, "invalid");
        return false;
    }

    showMessage("Passwords match.", "success");
    setState(confirmPassword, "valid");
    return true;
}

// Live check as the user types in either field
newPassword.addEventListener("input", checkMatch);
confirmPassword.addEventListener("input", checkMatch);

form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (newPassword.value === "") {
        showMessage("Please enter a new password.", "error");
        setState(newPassword, "invalid");
        newPassword.focus();
        return;
    }

    setState(newPassword, null);

    if (confirmPassword.value === "") {
        showMessage("Please confirm your new password.", "error");
        setState(confirmPassword, "invalid");
        confirmPassword.focus();
        return;
    }

    if (!checkMatch()) {
        confirmPassword.focus();
        return;
    }

    // Passwords match: send to your backend here
    console.log("Passwords match, ready to submit.");
    // form.submit();
});