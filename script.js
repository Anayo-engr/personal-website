"use strict";

/*
 * ==========================================
 * CLIENT CONTACT FORM
 * ==========================================
 */

/*
 * LIVE RENDER BACKEND
 *
 * Replace this URL with the actual Render
 * backend URL when confirmed.
 */
const API_BASE_URL = "https://nworie-personal-website-api.onrender.com";


/*
 * ==========================================
 * CONTACT FORM INITIALIZATION
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", () => {

    const container =
        document.getElementById("contactFormContainer");

    const toggleButton =
        document.getElementById("contactToggleBtn");

    const toggleIcon =
        document.getElementById("toggle-icon");

    const contactForm =
        document.getElementById("client-contact-form");


    /*
     * ==========================================
     * INITIAL FORM STATE
     * ==========================================
     */

    if (container) {
        container.hidden = true;
    }

    if (toggleButton) {
        toggleButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (toggleIcon) {
        toggleIcon.textContent = "+";
    }


    /*
     * ==========================================
     * OPEN / CLOSE CONTACT FORM
     * ==========================================
     */

    if (toggleButton && container) {

        toggleButton.addEventListener(
            "click",
            () => {

                const isClosed =
                    container.hidden;

                if (isClosed) {

                    /*
                     * OPEN
                     */

                    container.hidden = false;

                    toggleButton.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                    if (toggleIcon) {
                        toggleIcon.textContent = "−";
                    }

                } else {

                    /*
                     * CLOSE
                     */

                    container.hidden = true;

                    toggleButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    if (toggleIcon) {
                        toggleIcon.textContent = "+";
                    }
                }
            }
        );
    }


    /*
     * ==========================================
     * CONTACT FORM SUBMISSION
     * ==========================================
     */

    if (!contactForm) {
        console.error(
            "Client contact form not found."
        );

        return;
    }


    contactForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /*
             * Get submit button
             */

            const submitButton =
                contactForm.querySelector(
                    'button[type="submit"]'
                );


            /*
             * Prevent multiple submissions
             */

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent =
                    "Sending...";
            }


            /*
             * Collect form data
             */

            const formData =
                new FormData(contactForm);


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
             * SEND TO RENDER BACKEND
             * ==========================================
             */

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/inquiries`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    inquiryData
                                )
                        }
                    );


                /*
                 * Read response
                 */

                let result = {};

                try {

                    result =
                        await response.json();

                } catch (jsonError) {

                    result = {};
                }


                console.log(
                    "API RESPONSE:",
                    result
                );


                /*
                 * ==========================================
                 * HANDLE ERROR
                 * ==========================================
                 */

                if (!response.ok) {

                    let errorMessage =
                        "Unable to send your message.";


                    if (
                        typeof result.detail ===
                        "string"
                    ) {

                        errorMessage =
                            result.detail;

                    } else if (
                        Array.isArray(
                            result.detail
                        )
                    ) {

                        errorMessage =
                            result.detail
                                .map(
                                    error =>
                                        error.msg
                                )
                                .join(", ");

                    } else if (
                        result.message
                    ) {

                        errorMessage =
                            result.message;
                    }


                    throw new Error(
                        errorMessage
                    );
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
                 * Clear form
                 */

                contactForm.reset();


                /*
                 * Close form after successful submission
                 */

                if (container) {

                    container.hidden = true;
                }

                if (toggleButton) {

                    toggleButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }

                if (toggleIcon) {

                    toggleIcon.textContent = "+";
                }


            } catch (error) {

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
                 * Restore submit button
                 */

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Send Message";
                }
            }
        }
    );

});