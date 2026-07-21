import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

async function ownerLogin() {

    const snapshot = await getDocs(collection(db, "owners"));

    if (snapshot.empty) {

        // First Time
        window.location.href = "owner-register.html";

    } else {

        // Already Account Created
        window.location.href = "owner-login.html";

    }

}

window.ownerLogin = ownerLogin;
window.staffLogin = function () {
    window.location.href = "staff-login.html";
};