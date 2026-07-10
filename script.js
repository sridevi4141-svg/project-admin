import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    runTransaction,
    query,
    orderBy
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
    const barcode = document.getElementById("barcode").value

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
function loadSales() {

    const table = document.getElementById("salesTable");

    const q = query(
        collection(db, "sales"),
        orderBy("invoiceNo", "desc")
    );

    onSnapshot(q, (snapshot) => {

        table.innerHTML = "";

        snapshot.forEach((doc) => {

            const sale = doc.data();

            table.innerHTML += `
            <tr>

                <td>${sale.invoiceNo}</td>

                <td>${sale.date}</td>

                <td>₹${sale.total}</td>

            </tr>
            `;

        });

    });

}
function loadStock() {

    const table = document.getElementById("stockTable");

    onSnapshot(collection(db, "products"), (snapshot) => {

        table.innerHTML = "";

        snapshot.forEach((doc) => {

            const item = doc.data();

            let status = "";

            if(item.quantity == 0){

                status = "Out Of Stock";

            }else if(item.quantity <= 5){

                status = "Low Stock";

            }else{

                status = "Available";

            }

            table.innerHTML += `

            <tr>

                <td>${item.name}</td>

                <td>${item.quantity}</td>

                <td>${status}</td>

            </tr>

            `;

        });

    });

}
window.showStockReport = function(){

    document.getElementById("stockSection").style.display = "block";

    document.getElementById("salesSection").style.display = "none";

}

window.showSalesReport = function () {

    document.getElementById("salesSection").style.display = "block";

    document.getElementById("stockSection").style.display = "none";

};
window.showProfitReport = function () {

    document.getElementById("salesSection").style.display = "none";
    document.getElementById("stockSection").style.display = "none";
    document.getElementById("profitSection").style.display = "block";

};



window.showProfitReport = async function () {

    const report = document.getElementById("profitReport");

    report.innerHTML = "<h3>Loading...</h3>";

    let totalSales = 0;
    let totalPurchase = 0;

    try {

        const salesSnap = await getDocs(collection(db, "sales"));

        salesSnap.forEach((saleDoc) => {

            const sale = saleDoc.data();

            sale.items.forEach((item) => {

                totalSales += Number(item.salesPrice) * Number(item.qty);

                totalPurchase += Number(item.purchasePrice) * Number(item.qty);

            });

        });

        const amount = totalSales - totalPurchase;

        let status = "";
        let color = "";

        if (amount > 0) {

            status = "✅ PROFIT";
            color = "green";

        } else if (amount < 0) {

            status = "❌ LOSS";
            color = "red";

        } else {

            status = "➖ NO PROFIT / NO LOSS";
            color = "blue";

        }

        report.innerHTML = `

        <h2>Profit & Loss Report</h2>

        <table border="1" cellpadding="10" cellspacing="0">

            <tr>
                <th>Total Purchase</th>
                <td>₹${totalPurchase}</td>
            </tr>

            <tr>
                <th>Total Sales</th>
                <td>₹${totalSales}</td>
            </tr>

            <tr>
                <th>Status</th>
                <td style="color:${color};font-weight:bold;">
                    ${status}
                </td>
            </tr>

            <tr>
                <th>Amount</th>
                <td style="color:${color};font-weight:bold;">
                    ₹${Math.abs(amount)}
                </td>
            </tr>

        </table>

        `;

    } catch (error) {

        console.log(error);

        report.innerHTML = "<h3>Error Loading Report</h3>";

    }

};
loadSales();

loadStock();
loadProfitReport();