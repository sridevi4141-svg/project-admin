import { db } from "./firebase-config.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

async function loginOwner() {

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (username === "" || password === "") {
        alert("Please enter Username and Password");
        return;
    }

    const q = query(
        collection(db, "owners"),
        where("username", "==", username),
        where("password", "==", password)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {

        alert("Login Success");

        window.location.href = "owner-dashboard.html";

    } else {

        alert("Invalid Username or Password");

    }

}

window.loginOwner = loginOwner;