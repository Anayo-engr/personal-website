"use strict";

const API_BASE_URL = "http://127.0.0.1:8001";

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("adminLoginForm");
    const loginButton = document.getElementById("loginButton");
    const loginMessage = document.getElementById("loginMessage");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        loginMessage.textContent = "";

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        try {

            const response = await fetch(
                `${API_BASE_URL}/admin/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );

            const result = await response.json();

            console.log("ADMIN LOGIN RESPONSE:", result);

            if (!response.ok) {
                throw new Error(
                    result.detail ||
                    "Invalid username or password."
                );
            }

            /*
             * Store the authentication token
             * for the Admin Dashboard.
             */
            localStorage.setItem(
                "admin_access_token",
                result.access_token
            );

            localStorage.setItem(
                "admin_token_type",
                result.token_type || "bearer"
            );

            loginMessage.textContent = "Login successful.";

            /*
             * Move to the Admin Dashboard.
             */
            window.location.href = "admin-dashboard.html";

        } catch (error) {

            console.error("Admin login error:", error);

            loginMessage.textContent =
                error.message ||
                "Unable to login.";

        } finally {

            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }

    });
    
