"use strict";

/*
 * ==========================================
 * CLIENT CONTACT FORM
 * ==========================================
 */

function toggleContactForm() {
    const container = document.getElementById("contactFormContainer");
    const button = document.querySelector(".contact-toggle-btn");
    const icon = document.getElementById("toggle-icon");

    if (!container) {
        console.error("Contact form container not found.");
        return;
    }

    const isCurrentlyHidden = container.hidden;

    if (isCurrentlyHidden) {
        /*
         * OPEN THE FORM
         */
        container.hidden = false;
        container.style.display = "";

        if (button) {
            button.setAttribute("aria-expanded", "true");
        }

        if (icon) {
            icon.textContent = "−";
        }

    } else {
        /*
         * CLOSE THE FORM
         */
        container.hidden = true;
        container.style.display = "none";

        if (button) {
            button.setAttribute("aria-expanded", "false");
        }

        if (icon) {
            icon.textContent = "+";
        }
    }
}


/*
 * ==========================================
 * CONTACT FORM INITIALIZATION
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", () => {

    const container =
        document.getElementById("contactFormContainer");

    const button =
        document.querySelector(".contact-toggle-btn");

    const icon =
        document.getElementById("toggle-icon");


    /*
     * ==========================================
     * INITIAL FORM STATE
     * ==========================================
     *
     * Keep the contact form CLOSED when
     * the website first loads.
     */

    if (container) {
        container.hidden = true;
        container.style.display = "none";
    }

    if (button) {
        button.setAttribute("aria-expanded", "false");
    }

    if (icon) {
        icon.textContent = "+";
    }


    /*
     * ==========================================
     * CONTACT FORM SUBMISSION
     * ==========================================
     */

    const contactForm =
        document.querySelector("#client-contact form");

    if (!contactForm) {
        return;
    }


    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        /*
         * Get the submit button
         */

        const submitButton =
            contactForm.querySelector('button[type="submit"]');


        /*
         * Prevent multiple submissions
         */

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";
        }


        /*
         * Collect form information
         */

        const formData =
            new FormData(contactForm);


        /*
         * ==========================================
         * DATA SENT TO FASTAPI
         * ==========================================
         */

        const inquiryData = {

            surname:
                formData.get("surname"),

            othernames:
                formData.get("othernames"),

            email:
                formData.get("email"),

            phone:
                formData.get("phone"),

            project_type:
                formData.get("project_type"),

            location:
                formData.get("location"),

            budget:
                formData.get("budget"),

            timeline:
                formData.get("timeline"),

            comments:
                formData.get("comments")
        };


        /*
         * ==========================================
         * SEND INQUIRY TO BACKEND
         * ==========================================
         */

        try {

            const response = await fetch(
                "http://127.0.0.1:8001/inquiries",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body:
                        JSON.stringify(inquiryData)
                }
            );


            /*
             * Try to read the API response
             */

            let result = {};

            try {

                result = await response.json();

            } catch (jsonError) {

                result = {};
            }


            /*
             * Debug information
             */

            console.log(
                "API RESPONSE:",
                result
            );


            /*
             * ==========================================
             * HANDLE API ERROR
             * ==========================================
             */

            if (!response.ok) {

                let errorMessage =
                    "Unable to send your message.";


                if (
                    typeof result.detail === "string"
                ) {

                    errorMessage =
                        result.detail;

                } else if (
                    Array.isArray(result.detail)
                ) {

                    errorMessage =
                        result.detail
                            .map(error => error.msg)
                            .join(", ");

                } else if (
                    result.message
                ) {

                    errorMessage =
                        result.message;
                }


                throw new Error(errorMessage);
            }


            /*
             * ==========================================
             * SUCCESS
             * ==========================================
             */

            alert(
                "Thank you! Your project inquiry has been sent successfully."
            );


            /*
             * Clear the form
             */

            contactForm.reset();


        } catch (error) {

            /*
             * ==========================================
             * ERROR
             * ==========================================
             */

            console.error(
                "Contact form error:",
                error
            );


            alert(
                error.message ||
                "Sorry, your message could not be sent. Please try again."
            );


        } finally {

            /*
             * ==========================================
             * RESTORE SUBMIT BUTTON
             * ==========================================
             */

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Send Message";
            }
        }

    });

});



/* =========================================================
   CONTACT FORM TOGGLE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const toggleButton = document.getElementById("contactToggleBtn");
    const contactFormContainer = document.getElementById("contactFormContainer");
    const toggleIcon = document.getElementById("toggle-icon");

    if (!toggleButton || !contactFormContainer) {
        console.error("Contact form toggle elements not found.");
        return;
    }

    // Start closed
    contactFormContainer.setAttribute("hidden", "");

    toggleButton.setAttribute("aria-expanded", "false");

    if (toggleIcon) {
        toggleIcon.textContent = "+";
    }

    // Toggle form
    toggleButton.addEventListener("click", () => {

        const isClosed = contactFormContainer.hasAttribute("hidden");

        if (isClosed) {
            // OPEN
            contactFormContainer.removeAttribute("hidden");
            toggleButton.setAttribute("aria-expanded", "true");

            if (toggleIcon) {
                toggleIcon.textContent = "−";
            }

        } else {
            // CLOSE
            contactFormContainer.setAttribute("hidden", "");
            toggleButton.setAttribute("aria-expanded", "false");

            if (toggleIcon) {
                toggleIcon.textContent = "+";
            }
        }

    });

});