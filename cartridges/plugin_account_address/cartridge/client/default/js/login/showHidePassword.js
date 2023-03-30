const passwordInput = document.querySelector('.js-password-input');
const eyeIcon = document.querySelector('.js-eye-icon');

eyeIcon.addEventListener('click', () => {
    passwordInput.type === 'password'
        ? passwordInput.type = 'text'
        : passwordInput.type = 'password';
});
