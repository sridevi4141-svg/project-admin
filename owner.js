import { db } from "./firebase-config.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

async function createOwner() {

    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (name === "" || username === "" || password === "" || confirmPassword === "") {
        alert("Please fill all fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {

        await addDoc(collection(db, "owners"), {
            name: name,
            username: username,
            password: password,
            createdAt: new Date()
        });

        alert("Owner Account Created Successfully");

        window.location.href = "owner-login.html";

    } catch (error) {

        alert(error.message);

    }

}

window.createOwner = createOwner;