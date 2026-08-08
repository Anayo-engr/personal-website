
function toggleContactForm() {
    const container = document.getElementById('contactFormContainer');
    const icon = document.getElementById('toggle-icon');
    
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'block';
        icon.textContent = '-';
    } else {
        container.style.display = 'none';
        icon.textContent = '+';
    }
}
