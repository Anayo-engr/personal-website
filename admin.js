"use strict";

/*
 * =========================================================
 * LIVE RENDER BACKEND
 * =========================================================
 */

const API_BASE_URL =
    "https://nworie-personal-website-api.onrender.com";


/*
 * =========================================================
 * ADMIN LOGIN
 * =========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    const loginForm =
        document.getElementById("adminLoginForm");

    const loginButton =
        document.getElementById("loginButton");

    const loginMessage =
        document.getElementById("loginMessage");


    /*
     * Stop if login form does not exist
     */

    if (!loginForm) {
        return;
    }


    /*
     * =====================================================
     * LOGIN SUBMISSION
     * =====================================================
     */

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;


            /*
             * Clear previous message
             */

            if (loginMessage) {
                loginMessage.textContent = "";
            }


            /*
             * Disable button while logging in
             */

            if (loginButton) {

                loginButton.disabled = true;

                loginButton.textContent =
                    "Logging in...";
            }


            try {

                /*
                 * Send login request
                 */

                const response =
                    await fetch(
                        `${API_BASE_URL}/admin/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username: username,
                                password: password
                            })
                        }
                    );


                /*
                 * Read API response safely
                 */

                let result = {};

                try {

                    result =
                        await response.json();

                } catch (jsonError) {

                    result = {};

                }


                console.log(
                    "ADMIN LOGIN RESPONSE:",
                    result
                );


                /*
                 * =================================================
                 * HANDLE LOGIN ERROR
                 * =================================================
                 */

                if (!response.ok) {

                    throw new Error(
                        result.detail ||
                        result.message ||
                        "Invalid username or password."
                    );
                }


                /*
                 * =================================================
                 * VERIFY TOKEN
                 * =================================================
                 */

                if (!result.access_token) {

                    throw new Error(
                        "Login succeeded, but no access token was returned."
                    );
                }


                /*
                 * =================================================
                 * SAVE AUTHENTICATION TOKEN
                 * =================================================
                 */

                localStorage.setItem(
                    "admin_access_token",
                    result.access_token
                );

                localStorage.setItem(
                    "admin_token_type",
                    result.token_type || "bearer"
                );


                /*
                 * =================================================
                 * SUCCESS MESSAGE
                 * =================================================
                 */

                if (loginMessage) {

                    loginMessage.textContent =
                        "Login successful.";
                }


                /*
                 * =================================================
                 * OPEN ADMIN DASHBOARD
                 * =================================================
                 */

                window.location.href =
                    "admin-dashboard.html";

            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                if (loginMessage) {

                    loginMessage.textContent =
                        error.message ||
                        "Unable to login. Please try again.";
                }

            } finally {

                /*
                 * Restore login button
                 */

                if (loginButton) {

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";
                }
            }

        }
    );

});