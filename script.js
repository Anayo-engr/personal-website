// Toggle Client Contact Form Visibility
function toggleContactForm() {
    const formContainer = document.getElementById('contactFormContainer');
    const toggleIcon = document.getElementById('toggle-icon');
    
    if (formContainer.style.display === 'block') {
        formContainer.style.display = 'none';
        toggleIcon.textContent = '+';
    } else {
        formContainer.style.display = 'block';
        toggleIcon.textContent = '-';
    }
}   
