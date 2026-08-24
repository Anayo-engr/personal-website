"use strict";

/*
 * Client Contact Form Toggle
 */

function toggleContactForm() {
    const container = document.getElementById("contactFormContainer");
    const button = document.querySelector(".contact-toggle-btn");
    const icon = document.getElementById("toggle-icon");

    if (!container || !button || !icon) {
        return;
    }

    const isHidden = container.hidden;

    container.hidden = !isHidden;

    button.setAttribute(
        "aria-expanded",
        String(isHidden)
    );

    icon.textContent = isHidden ? "−" : "+";
}


/*
 * Initialize Contact Form
 */

document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("contactFormContainer");
    const button = document.querySelector(".contact-toggle-btn");
    const icon = document.getElementById("toggle-icon");

    if (!container || !button || !icon) {
        return;
    }

    container.hidden = true;

    button.setAttribute(
        "aria-expanded",
        "false"
    );

    icon.textContent = "+";
});
