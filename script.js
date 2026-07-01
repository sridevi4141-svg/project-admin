import { db } from "./firebase.js";

import { 
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Show / Hide Form
window.showForm = function () {

    let form = document.getElementById("productForm");

    if (form.style.display === "none" || form.style.display === "") {
        form.style.display = "block";
    } else {
        form.style.display = "none";
    }
};

// Add Product
window.addProduct = async function () {

    const name = document.getElementById("name").value;
    const image = document.getElementById("image").value;
    const purchasePrice = Number(document.getElementById("purchasePrice").value);
    const salesPrice = Number(document.getElementById("salesPrice").value);
    const quantity = Number(document.getElementById("quantity").value);

    if (!name || !purchasePrice || !salesPrice || !quantity) {
        alert("Please fill all fields");
        return;
    }

    try {

        await addDoc(collection(db, "products"), {

            name,
            image,
            purchasePrice,
            salesPrice,
            quantity

        });

        alert("Product Added Successfully");

        document.getElementById("name").value = "";
        document.getElementById("image").value = "";
        document.getElementById("purchasePrice").value = "";
        document.getElementById("salesPrice").value = "";
        document.getElementById("quantity").value = "";

    } catch (error) {

        console.error(error);
        alert("Error adding product");

    }

};

function loadProducts() {

    const table = document.getElementById("productTable");

    onSnapshot(collection(db, "products"), (snapshot) => {

        table.innerHTML = "";

        snapshot.forEach((doc) => {

            const item = doc.data();

            table.innerHTML += `
                <tr>
                    <td>
                        <img src="${item.image}" width="60">
                    </td>

                    <td>${item.name}</td>

                    <td>₹${item.purchasePrice}</td>

                    <td>₹${item.salesPrice}</td>

                    <td>${item.quantity}</td>

                    <td>
                        <td>
    <button onclick="editProduct('${doc.id}', ${item.purchasePrice}, ${item.salesPrice})">
        Edit
    </button>
</td>
                       
                    </td>
                </tr>
            `;
        });

    });

}
loadProducts();
window.editProduct = async function(id, oldPurchase, oldSales) {

    const purchasePrice = prompt("Enter New Purchase Price", oldPurchase);

    if (purchasePrice === null) return;

    const salesPrice = prompt("Enter New Sales Price", oldSales);

    if (salesPrice === null) return;

    try {

        const productRef = doc(db, "products", id);

        await updateDoc(productRef, {

            purchasePrice: Number(purchasePrice),
            salesPrice: Number(salesPrice)

        });

        alert("Price Updated Successfully");

    } catch (error) {

        console.log(error);
        alert("Update Failed");

    }

}