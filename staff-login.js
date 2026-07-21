import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

window.loginStaff = async function () {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const querySnapshot = await getDocs(collection(db, "staff"));

    let found = false;

    querySnapshot.forEach((docSnap) => {

        const data = docSnap.data();

        if (
            data.username === username &&
            data.password === password
        ) {

            found = true;

            localStorage.setItem(
                "staffLogin",
                JSON.stringify(data)
            );

            window.location.href = "staff-dashboard.html";
        }

    });

    if (!found) {
        alert("Invalid Username or Password");
    }
}