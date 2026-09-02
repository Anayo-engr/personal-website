/*
 * =========================================================
 * LIVE RENDER BACKEND
 * =========================================================
 */

const API_BASE_URL = "https://nworie-personal-website-api.onrender.com";


document.addEventListener("DOMContentLoaded", () => {

    const logoutButton =
        document.getElementById("logoutButton");

    const dashboardMessage =
        document.getElementById("dashboardMessage");

    const inquiriesContainer =
        document.getElementById("inquiriesContainer");

    const token =
        localStorage.getItem(
            "admin_access_token"
        );


    /*
     * =========================================================
     * PROTECT DASHBOARD
     * =========================================================
     */

    if (!token) {

        window.location.href =
            "admin.html";

        return;
    }


    /*
     * =========================================================
     * LOGOUT
     * =========================================================
     */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "admin_access_token"
                );

                localStorage.removeItem(
                    "admin_token_type"
                );

                window.location.href =
                    "admin.html";
            }
        );
    }


    /*
     * =========================================================
     * AUTHORIZATION HEADERS
     * =========================================================
     */

    function getAuthHeaders() {

        return {
            "Authorization":
                `Bearer ${token}`,

            "Content-Type":
                "application/json"
        };
    }


    /*
     * =========================================================
     * DASHBOARD SUMMARY
     * =========================================================
     */

    function createDashboardSummary(
        inquiries
    ) {

        const existingSummary =
            document.getElementById(
                "dashboardSummary"
            );


        if (existingSummary) {
            existingSummary.remove();
        }


        const total =
            inquiries.length;


        const newCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "new"
            ).length;


        const contactedCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "contacted"
            ).length;


        const inProgressCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "in_progress"
            ).length;


        const completedCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "completed"
            ).length;


        const archivedCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "archived"
            ).length;


        const summary =
            document.createElement("div");

        summary.id =
            "dashboardSummary";


        summary.innerHTML = `

            <div class="summary-card">
                <strong>${total}</strong>
                <span>Total</span>
            </div>

            <div class="summary-card">
                <strong>${newCount}</strong>
                <span>New</span>
            </div>

            <div class="summary-card">
                <strong>${contactedCount}</strong>
                <span>Contacted</span>
            </div>

            <div class="summary-card">
                <strong>${inProgressCount}</strong>
                <span>In Progress</span>
            </div>

            <div class="summary-card">
                <strong>${completedCount}</strong>
                <span>Completed</span>
            </div>

            <div class="summary-card">
                <strong>${archivedCount}</strong>
                <span>Archived</span>
            </div>

        `;


        const dashboardCard =
            document.querySelector(
                ".dashboard-card"
            );


        if (dashboardCard) {

            dashboardCard.insertBefore(
                summary,
                inquiriesContainer
            );
        }
    }


    /*
     * =========================================================
     * LOAD INQUIRIES
     * =========================================================
     */

    async function loadInquiries() {

        dashboardMessage.textContent =
            "Loading inquiries...";


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/admin/inquiries`,
                    {
                        method: "GET",

                        headers:
                            getAuthHeaders()
                    }
                );


            let result = {};

            try {

                result =
                    await response.json();

            } catch (jsonError) {

                result = {};
            }


            console.log(
                "ADMIN INQUIRIES RESPONSE:",
                result
            );


            /*
             * Authentication failure
             */

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "admin_access_token"
                );

                localStorage.removeItem(
                    "admin_token_type"
                );

                window.location.href =
                    "admin.html";

                return;
            }


            if (!response.ok) {

                throw new Error(
                    result.detail ||
                    "Unable to load inquiries."
                );
            }


            /*
             * Make sure response is an array
             */

            if (!Array.isArray(result)) {

                throw new Error(
                    "Invalid inquiry data received from server."
                );
            }


            dashboardMessage.textContent =
                `${result.length} inquiries loaded.`;


            createDashboardSummary(result);


            /*
             * No inquiries
             */

            if (result.length === 0) {

                inquiriesContainer.innerHTML = `
                    <p>No client inquiries found.</p>
                `;

                return;
            }


            inquiriesContainer.innerHTML =
                "";


            /*
             * =================================================
             * DISPLAY INQUIRIES
             * =================================================
             */

            result.forEach(
                (inquiry) => {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "inquiry-card";


                    const fullName =
                        `${inquiry.surname || ""} ${
                            inquiry.othernames || ""
                        }`.trim();


                    const formattedDate =
                        inquiry.created_at
                            ? new Date(
                                inquiry.created_at
                            ).toLocaleString()
                            : "N/A";


                    card.innerHTML = `

                        <div class="inquiry-header">

                            <div>

                                <h3>
                                    ${
                                        fullName ||
                                        "Unnamed Client"
                                    }
                                </h3>

                                <small>
                                    Submitted:
                                    ${formattedDate}
                                </small>

                            </div>

                        </div>


                        <div class="inquiry-details">

                            <p>
                                <strong>Email:</strong>
                                ${inquiry.email || "N/A"}
                            </p>

                            <p>
                                <strong>Phone:</strong>
                                ${inquiry.phone || "N/A"}
                            </p>

                            <p>
                                <strong>Project Type:</strong>
                                ${inquiry.project_type || "N/A"}
                            </p>

                            <p>
                                <strong>Budget:</strong>
                                ${inquiry.budget || "N/A"}
                            </p>

                            <p>
                                <strong>Location:</strong>
                                ${inquiry.location || "N/A"}
                            </p>

                            <p>
                                <strong>Timeline:</strong>
                                ${inquiry.timeline || "N/A"}
                            </p>

                            <p>
                                <strong>Comments:</strong>
                                ${inquiry.comments || "N/A"}
                            </p>

                        </div>


                        <div class="inquiry-actions">

                            <label>

                                <strong>Status:</strong>

                                <select
                                    class="status-select"
                                    data-id="${inquiry.id}"
                                >

                                    <option
                                        value="new"
                                        ${
                                            inquiry.status === "new"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        New
                                    </option>

                                    <option
                                        value="contacted"
                                        ${
                                            inquiry.status === "contacted"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Contacted
                                    </option>

                                    <option
                                        value="in_progress"
                                        ${
                                            inquiry.status === "in_progress"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        In Progress
                                    </option>

                                    <option
                                        value="completed"
                                        ${
                                            inquiry.status === "completed"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Completed
                                    </option>

                                    <option
                                        value="archived"
                                        ${
                                            inquiry.status === "archived"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Archived
                                    </option>

                                </select>

                            </label>


                            <button
                                type="button"
                                class="delete-inquiry-button"
                                data-id="${inquiry.id}"
                            >
                                Delete
                            </button>

                        </div>

                    `;


                    inquiriesContainer.appendChild(
                        card
                    );
                }
            );


            /*
             * =================================================
             * STATUS CHANGE
             * =================================================
             */

            document
                .querySelectorAll(
                    ".status-select"
                )
                .forEach(
                    (select) => {

                        select.addEventListener(
                            "change",
                            async () => {

                                const inquiryId =
                                    select.dataset.id;

                                const newStatus =
                                    select.value;


                                try {

                                    select.disabled =
                                        true;


                                    const response =
                                        await fetch(
                                            `${API_BASE_URL}/admin/inquiries/${inquiryId}/status?new_status=${encodeURIComponent(newStatus)}`,
                                            {
                                                method:
                                                    "PATCH",

                                                headers:
                                                    getAuthHeaders()
                                            }
                                        );


                                    let result = {};

                                    try {

                                        result =
                                            await response.json();

                                    } catch (
                                        jsonError
                                    ) {

                                        result = {};
                                    }


                                    if (
                                        !response.ok
                                    ) {

                                        throw new Error(
                                            result.detail ||
                                            "Unable to update status."
                                        );
                                    }


                                    console.log(
                                        "STATUS UPDATED:",
                                        result
                                    );


                                    await loadInquiries();


                                } catch (error) {

                                    console.error(
                                        "Status update error:",
                                        error
                                    );


                                    alert(
                                        error.message ||
                                        "Unable to update status."
                                    );


                                    await loadInquiries();
                                }

                            }
                        );
                    }
                );


            /*
             * =================================================
             * DELETE INQUIRY
             * =================================================
             */

            document
                .querySelectorAll(
                    ".delete-inquiry-button"
                )
                .forEach(
                    (button) => {

                        button.addEventListener(
                            "click",
                            async () => {

                                const inquiryId =
                                    button.dataset.id;


                                const confirmed =
                                    confirm(
                                        "Are you sure you want to delete this client inquiry?"
                                    );


                                if (!confirmed) {
                                    return;
                                }


                                try {

                                    button.disabled =
                                        true;

                                    button.textContent =
                                        "Deleting...";


                                    const response =
                                        await fetch(
                                            `${API_BASE_URL}/admin/inquiries/${inquiryId}`,
                                            {
                                                method:
                                                    "DELETE",

                                                headers:
                                                    getAuthHeaders()
                                            }
                                        );


                                    let result = {};

                                    try {

                                        result =
                                            await response.json();

                                    } catch (
                                        jsonError
                                    ) {

                                        result = {};
                                    }


                                    if (
                                        !response.ok
                                    ) {

                                        throw new Error(
                                            result.detail ||
                                            "Unable to delete inquiry."
                                        );
                                    }


                                    console.log(
                                        "INQUIRY DELETED:",
                                        result
                                    );


                                    await loadInquiries();


                                } catch (error) {

                                    console.error(
                                        "Delete error:",
                                        error
                                    );


                                    alert(
                                        error.message ||
                                        "Unable to delete inquiry."
                                    );


                                    button.disabled =
                                        false;

                                    button.textContent =
                                        "Delete";
                                }

                            }
                        );
                    }
                );


        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );


            dashboardMessage.textContent =
                error.message ||
                "Unable to connect to server.";
        }
    }


    /*
     * =========================================================
     * START DASHBOARD
     * =========================================================
     */

    loadInquiries();

});/*
 * =========================================================
 * LIVE RENDER BACKEND
 * =========================================================
 */



document.addEventListener("DOMContentLoaded", () => {

    const logoutButton =
        document.getElementById("logoutButton");

    const dashboardMessage =
        document.getElementById("dashboardMessage");

    const inquiriesContainer =
        document.getElementById("inquiriesContainer");

    const token =
        localStorage.getItem(
            "admin_access_token"
        );


    /*
     * =========================================================
     * PROTECT DASHBOARD
     * =========================================================
     */

    if (!token) {

        window.location.href =
            "admin.html";

        return;
    }


    /*
     * =========================================================
     * LOGOUT
     * =========================================================
     */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "admin_access_token"
                );

                localStorage.removeItem(
                    "admin_token_type"
                );

                window.location.href =
                    "admin.html";
            }
        );
    }


    /*
     * =========================================================
     * AUTHORIZATION HEADERS
     * =========================================================
     */

    function getAuthHeaders() {

        return {
            "Authorization":
                `Bearer ${token}`,

            "Content-Type":
                "application/json"
        };
    }


    /*
     * =========================================================
     * DASHBOARD SUMMARY
     * =========================================================
     */

    function createDashboardSummary(
        inquiries
    ) {

        const existingSummary =
            document.getElementById(
                "dashboardSummary"
            );


        if (existingSummary) {
            existingSummary.remove();
        }


        const total =
            inquiries.length;


        const newCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "new"
            ).length;


        const contactedCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "contacted"
            ).length;


        const inProgressCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "in_progress"
            ).length;


        const completedCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "completed"
            ).length;


        const archivedCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "archived"
            ).length;


        const summary =
            document.createElement("div");

        summary.id =
            "dashboardSummary";


        summary.innerHTML = `

            <div class="summary-card">
                <strong>${total}</strong>
                <span>Total</span>
            </div>

            <div class="summary-card">
                <strong>${newCount}</strong>
                <span>New</span>
            </div>

            <div class="summary-card">
                <strong>${contactedCount}</strong>
                <span>Contacted</span>
            </div>

            <div class="summary-card">
                <strong>${inProgressCount}</strong>
                <span>In Progress</span>
            </div>

            <div class="summary-card">
                <strong>${completedCount}</strong>
                <span>Completed</span>
            </div>

            <div class="summary-card">
                <strong>${archivedCount}</strong>
                <span>Archived</span>
            </div>

        `;


        const dashboardCard =
            document.querySelector(
                ".dashboard-card"
            );


        if (dashboardCard) {

            dashboardCard.insertBefore(
                summary,
                inquiriesContainer
            );
        }
    }


    /*
     * =========================================================
     * LOAD INQUIRIES
     * =========================================================
     */

    async function loadInquiries() {

        dashboardMessage.textContent =
            "Loading inquiries...";


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/admin/inquiries`,
                    {
                        method: "GET",

                        headers:
                            getAuthHeaders()
                    }
                );


            let result = {};

            try {

                result =
                    await response.json();

            } catch (jsonError) {

                result = {};
            }


            console.log(
                "ADMIN INQUIRIES RESPONSE:",
                result
            );


            /*
             * Authentication failure
             */

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "admin_access_token"
                );

                localStorage.removeItem(
                    "admin_token_type"
                );

                window.location.href =
                    "admin.html";

                return;
            }


            if (!response.ok) {

                throw new Error(
                    result.detail ||
                    "Unable to load inquiries."
                );
            }


            /*
             * Make sure response is an array
             */

            if (!Array.isArray(result)) {

                throw new Error(
                    "Invalid inquiry data received from server."
                );
            }


            dashboardMessage.textContent =
                `${result.length} inquiries loaded.`;


            createDashboardSummary(result);


            /*
             * No inquiries
             */

            if (result.length === 0) {

                inquiriesContainer.innerHTML = `
                    <p>No client inquiries found.</p>
                `;

                return;
            }


            inquiriesContainer.innerHTML =
                "";


            /*
             * =================================================
             * DISPLAY INQUIRIES
             * =================================================
             */

            result.forEach(
                (inquiry) => {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "inquiry-card";


                    const fullName =
                        `${inquiry.surname || ""} ${
                            inquiry.othernames || ""
                        }`.trim();


                    const formattedDate =
                        inquiry.created_at
                            ? new Date(
                                inquiry.created_at
                            ).toLocaleString()
                            : "N/A";


                    card.innerHTML = `

                        <div class="inquiry-header">

                            <div>

                                <h3>
                                    ${
                                        fullName ||
                                        "Unnamed Client"
                                    }
                                </h3>

                                <small>
                                    Submitted:
                                    ${formattedDate}
                                </small>

                            </div>

                        </div>


                        <div class="inquiry-details">

                            <p>
                                <strong>Email:</strong>
                                ${inquiry.email || "N/A"}
                            </p>

                            <p>
                                <strong>Phone:</strong>
                                ${inquiry.phone || "N/A"}
                            </p>

                            <p>
                                <strong>Project Type:</strong>
                                ${inquiry.project_type || "N/A"}
                            </p>

                            <p>
                                <strong>Budget:</strong>
                                ${inquiry.budget || "N/A"}
                            </p>

                            <p>
                                <strong>Location:</strong>
                                ${inquiry.location || "N/A"}
                            </p>

                            <p>
                                <strong>Timeline:</strong>
                                ${inquiry.timeline || "N/A"}
                            </p>

                            <p>
                                <strong>Comments:</strong>
                                ${inquiry.comments || "N/A"}
                            </p>

                        </div>


                        <div class="inquiry-actions">

                            <label>

                                <strong>Status:</strong>

                                <select
                                    class="status-select"
                                    data-id="${inquiry.id}"
                                >

                                    <option
                                        value="new"
                                        ${
                                            inquiry.status === "new"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        New
                                    </option>

                                    <option
                                        value="contacted"
                                        ${
                                            inquiry.status === "contacted"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Contacted
                                    </option>

                                    <option
                                        value="in_progress"
                                        ${
                                            inquiry.status === "in_progress"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        In Progress
                                    </option>

                                    <option
                                        value="completed"
                                        ${
                                            inquiry.status === "completed"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Completed
                                    </option>

                                    <option
                                        value="archived"
                                        ${
                                            inquiry.status === "archived"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Archived
                                    </option>

                                </select>

                            </label>


                            <button
                                type="button"
                                class="delete-inquiry-button"
                                data-id="${inquiry.id}"
                            >
                                Delete
                            </button>

                        </div>

                    `;


                    inquiriesContainer.appendChild(
                        card
                    );
                }
            );


            /*
             * =================================================
             * STATUS CHANGE
             * =================================================
             */

            document
                .querySelectorAll(
                    ".status-select"
                )
                .forEach(
                    (select) => {

                        select.addEventListener(
                            "change",
                            async () => {

                                const inquiryId =
                                    select.dataset.id;

                                const newStatus =
                                    select.value;


                                try {

                                    select.disabled =
                                        true;


                                    const response =
                                        await fetch(
                                            `${API_BASE_URL}/admin/inquiries/${inquiryId}/status?new_status=${encodeURIComponent(newStatus)}`,
                                            {
                                                method:
                                                    "PATCH",

                                                headers:
                                                    getAuthHeaders()
                                            }
                                        );


                                    let result = {};

                                    try {

                                        result =
                                            await response.json();

                                    } catch (
                                        jsonError
                                    ) {

                                        result = {};
                                    }


                                    if (
                                        !response.ok
                                    ) {

                                        throw new Error(
                                            result.detail ||
                                            "Unable to update status."
                                        );
                                    }


                                    console.log(
                                        "STATUS UPDATED:",
                                        result
                                    );


                                    await loadInquiries();


                                } catch (error) {

                                    console.error(
                                        "Status update error:",
                                        error
                                    );


                                    alert(
                                        error.message ||
                                        "Unable to update status."
                                    );


                                    await loadInquiries();
                                }

                            }
                        );
                    }
                );


            /*
             * =================================================
             * DELETE INQUIRY
             * =================================================
             */

            document
                .querySelectorAll(
                    ".delete-inquiry-button"
                )
                .forEach(
                    (button) => {

                        button.addEventListener(
                            "click",
                            async () => {

                                const inquiryId =
                                    button.dataset.id;


                                const confirmed =
                                    confirm(
                                        "Are you sure you want to delete this client inquiry?"
                                    );


                                if (!confirmed) {
                                    return;
                                }


                                try {

                                    button.disabled =
                                        true;

                                    button.textContent =
                                        "Deleting...";


                                    const response =
                                        await fetch(
                                            `${API_BASE_URL}/admin/inquiries/${inquiryId}`,
                                            {
                                                method:
                                                    "DELETE",

                                                headers:
                                                    getAuthHeaders()
                                            }
                                        );


                                    let result = {};

                                    try {

                                        result =
                                            await response.json();

                                    } catch (
                                        jsonError
                                    ) {

                                        result = {};
                                    }


                                    if (
                                        !response.ok
                                    ) {

                                        throw new Error(
                                            result.detail ||
                                            "Unable to delete inquiry."
                                        );
                                    }


                                    console.log(
                                        "INQUIRY DELETED:",
                                        result
                                    );


                                    await loadInquiries();


                                } catch (error) {

                                    console.error(
                                        "Delete error:",
                                        error
                                    );


                                    alert(
                                        error.message ||
                                        "Unable to delete inquiry."
                                    );


                                    button.disabled =
                                        false;

                                    button.textContent =
                                        "Delete";
                                }

                            }
                        );
                    }
                );


        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );


            dashboardMessage.textContent =
                error.message ||
                "Unable to connect to server.";
        }
    }


    /*
     * =========================================================
     * START DASHBOARD
     * =========================================================
     */

    loadInquiries();

});/*
 * =========================================================
 * LIVE RENDER BACKEND
 * =========================================================
 */



document.addEventListener("DOMContentLoaded", () => {

    const logoutButton =
        document.getElementById("logoutButton");

    const dashboardMessage =
        document.getElementById("dashboardMessage");

    const inquiriesContainer =
        document.getElementById("inquiriesContainer");

    const token =
        localStorage.getItem(
            "admin_access_token"
        );


    /*
     * =========================================================
     * PROTECT DASHBOARD
     * =========================================================
     */

    if (!token) {

        window.location.href =
            "admin.html";

        return;
    }


    /*
     * =========================================================
     * LOGOUT
     * =========================================================
     */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "admin_access_token"
                );

                localStorage.removeItem(
                    "admin_token_type"
                );

                window.location.href =
                    "admin.html";
            }
        );
    }


    /*
     * =========================================================
     * AUTHORIZATION HEADERS
     * =========================================================
     */

    function getAuthHeaders() {

        return {
            "Authorization":
                `Bearer ${token}`,

            "Content-Type":
                "application/json"
        };
    }


    /*
     * =========================================================
     * DASHBOARD SUMMARY
     * =========================================================
     */

    function createDashboardSummary(
        inquiries
    ) {

        const existingSummary =
            document.getElementById(
                "dashboardSummary"
            );


        if (existingSummary) {
            existingSummary.remove();
        }


        const total =
            inquiries.length;


        const newCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "new"
            ).length;


        const contactedCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "contacted"
            ).length;


        const inProgressCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "in_progress"
            ).length;


        const completedCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "completed"
            ).length;


        const archivedCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "archived"
            ).length;


        const summary =
            document.createElement("div");

        summary.id =
            "dashboardSummary";


        summary.innerHTML = `

            <div class="summary-card">
                <strong>${total}</strong>
                <span>Total</span>
            </div>

            <div class="summary-card">
                <strong>${newCount}</strong>
                <span>New</span>
            </div>

            <div class="summary-card">
                <strong>${contactedCount}</strong>
                <span>Contacted</span>
            </div>

            <div class="summary-card">
                <strong>${inProgressCount}</strong>
                <span>In Progress</span>
            </div>

            <div class="summary-card">
                <strong>${completedCount}</strong>
                <span>Completed</span>
            </div>

            <div class="summary-card">
                <strong>${archivedCount}</strong>
                <span>Archived</span>
            </div>

        `;


        const dashboardCard =
            document.querySelector(
                ".dashboard-card"
            );


        if (dashboardCard) {

            dashboardCard.insertBefore(
                summary,
                inquiriesContainer
            );
        }
    }


    /*
     * =========================================================
     * LOAD INQUIRIES
     * =========================================================
     */

    async function loadInquiries() {

        dashboardMessage.textContent =
            "Loading inquiries...";


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/admin/inquiries`,
                    {
                        method: "GET",

                        headers:
                            getAuthHeaders()
                    }
                );


            let result = {};

            try {

                result =
                    await response.json();

            } catch (jsonError) {

                result = {};
            }


            console.log(
                "ADMIN INQUIRIES RESPONSE:",
                result
            );


            /*
             * Authentication failure
             */

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "admin_access_token"
                );

                localStorage.removeItem(
                    "admin_token_type"
                );

                window.location.href =
                    "admin.html";

                return;
            }


            if (!response.ok) {

                throw new Error(
                    result.detail ||
                    "Unable to load inquiries."
                );
            }


            /*
             * Make sure response is an array
             */

            if (!Array.isArray(result)) {

                throw new Error(
                    "Invalid inquiry data received from server."
                );
            }


            dashboardMessage.textContent =
                `${result.length} inquiries loaded.`;


            createDashboardSummary(result);


            /*
             * No inquiries
             */

            if (result.length === 0) {

                inquiriesContainer.innerHTML = `
                    <p>No client inquiries found.</p>
                `;

                return;
            }


            inquiriesContainer.innerHTML =
                "";


            /*
             * =================================================
             * DISPLAY INQUIRIES
             * =================================================
             */

            result.forEach(
                (inquiry) => {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "inquiry-card";


                    const fullName =
                        `${inquiry.surname || ""} ${
                            inquiry.othernames || ""
                        }`.trim();


                    const formattedDate =
                        inquiry.created_at
                            ? new Date(
                                inquiry.created_at
                            ).toLocaleString()
                            : "N/A";


                    card.innerHTML = `

                        <div class="inquiry-header">

                            <div>

                                <h3>
                                    ${
                                        fullName ||
                                        "Unnamed Client"
                                    }
                                </h3>

                                <small>
                                    Submitted:
                                    ${formattedDate}
                                </small>

                            </div>

                        </div>


                        <div class="inquiry-details">

                            <p>
                                <strong>Email:</strong>
                                ${inquiry.email || "N/A"}
                            </p>

                            <p>
                                <strong>Phone:</strong>
                                ${inquiry.phone || "N/A"}
                            </p>

                            <p>
                                <strong>Project Type:</strong>
                                ${inquiry.project_type || "N/A"}
                            </p>

                            <p>
                                <strong>Budget:</strong>
                                ${inquiry.budget || "N/A"}
                            </p>

                            <p>
                                <strong>Location:</strong>
                                ${inquiry.location || "N/A"}
                            </p>

                            <p>
                                <strong>Timeline:</strong>
                                ${inquiry.timeline || "N/A"}
                            </p>

                            <p>
                                <strong>Comments:</strong>
                                ${inquiry.comments || "N/A"}
                            </p>

                        </div>


                        <div class="inquiry-actions">

                            <label>

                                <strong>Status:</strong>

                                <select
                                    class="status-select"
                                    data-id="${inquiry.id}"
                                >

                                    <option
                                        value="new"
                                        ${
                                            inquiry.status === "new"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        New
                                    </option>

                                    <option
                                        value="contacted"
                                        ${
                                            inquiry.status === "contacted"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Contacted
                                    </option>

                                    <option
                                        value="in_progress"
                                        ${
                                            inquiry.status === "in_progress"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        In Progress
                                    </option>

                                    <option
                                        value="completed"
                                        ${
                                            inquiry.status === "completed"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Completed
                                    </option>

                                    <option
                                        value="archived"
                                        ${
                                            inquiry.status === "archived"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Archived
                                    </option>

                                </select>

                            </label>


                            <button
                                type="button"
                                class="delete-inquiry-button"
                                data-id="${inquiry.id}"
                            >
                                Delete
                            </button>

                        </div>

                    `;


                    inquiriesContainer.appendChild(
                        card
                    );
                }
            );


            /*
             * =================================================
             * STATUS CHANGE
             * =================================================
             */

            document
                .querySelectorAll(
                    ".status-select"
                )
                .forEach(
                    (select) => {

                        select.addEventListener(
                            "change",
                            async () => {

                                const inquiryId =
                                    select.dataset.id;

                                const newStatus =
                                    select.value;


                                try {

                                    select.disabled =
                                        true;


                                    const response =
                                        await fetch(
                                            `${API_BASE_URL}/admin/inquiries/${inquiryId}/status?new_status=${encodeURIComponent(newStatus)}`,
                                            {
                                                method:
                                                    "PATCH",

                                                headers:
                                                    getAuthHeaders()
                                            }
                                        );


                                    let result = {};

                                    try {

                                        result =
                                            await response.json();

                                    } catch (
                                        jsonError
                                    ) {

                                        result = {};
                                    }


                                    if (
                                        !response.ok
                                    ) {

                                        throw new Error(
                                            result.detail ||
                                            "Unable to update status."
                                        );
                                    }


                                    console.log(
                                        "STATUS UPDATED:",
                                        result
                                    );


                                    await loadInquiries();


                                } catch (error) {

                                    console.error(
                                        "Status update error:",
                                        error
                                    );


                                    alert(
                                        error.message ||
                                        "Unable to update status."
                                    );


                                    await loadInquiries();
                                }

                            }
                        );
                    }
                );


            /*
             * =================================================
             * DELETE INQUIRY
             * =================================================
             */

            document
                .querySelectorAll(
                    ".delete-inquiry-button"
                )
                .forEach(
                    (button) => {

                        button.addEventListener(
                            "click",
                            async () => {

                                const inquiryId =
                                    button.dataset.id;


                                const confirmed =
                                    confirm(
                                        "Are you sure you want to delete this client inquiry?"
                                    );


                                if (!confirmed) {
                                    return;
                                }


                                try {

                                    button.disabled =
                                        true;

                                    button.textContent =
                                        "Deleting...";


                                    const response =
                                        await fetch(
                                            `${API_BASE_URL}/admin/inquiries/${inquiryId}`,
                                            {
                                                method:
                                                    "DELETE",

                                                headers:
                                                    getAuthHeaders()
                                            }
                                        );


                                    let result = {};

                                    try {

                                        result =
                                            await response.json();

                                    } catch (
                                        jsonError
                                    ) {

                                        result = {};
                                    }


                                    if (
                                        !response.ok
                                    ) {

                                        throw new Error(
                                            result.detail ||
                                            "Unable to delete inquiry."
                                        );
                                    }


                                    console.log(
                                        "INQUIRY DELETED:",
                                        result
                                    );


                                    await loadInquiries();


                                } catch (error) {

                                    console.error(
                                        "Delete error:",
                                        error
                                    );


                                    alert(
                                        error.message ||
                                        "Unable to delete inquiry."
                                    );


                                    button.disabled =
                                        false;

                                    button.textContent =
                                        "Delete";
                                }

                            }
                        );
                    }
                );


        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );


            dashboardMessage.textContent =
                error.message ||
                "Unable to connect to server.";
        }
    }


    /*
     * =========================================================
     * START DASHBOARD
     * =========================================================
     */

    loadInquiries();

});