const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function () {
    // Toggle input type between password and text
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle Font Awesome eye icon
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});