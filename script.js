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
    orderBy,
    getDocs,
    where,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


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
    const purchasePrice = Number(document.getElementById("purchasePrice").value);
    const salesPrice = Number(document.getElementById("salesPrice").value);
    const quantity = Number(document.getElementById("quantity").value);
    const barcode = document.getElementById("barcode").value;

    const imageFile = document.getElementById("image").files[0];

    if (!name || !purchasePrice || !salesPrice || !quantity || !imageFile) {
        alert("Please Fill All Fields");
        return;
    }

    try {

        const formData = new FormData();

        formData.append("file", imageFile);

        formData.append("upload_preset", "billingimagesupload");

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/dhudmqipj/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        const imageUrl = data.secure_url;

        await addDoc(collection(db, "products"), {

            name,
            image: imageUrl,
            purchasePrice,
            salesPrice,
            quantity,
            barcode

        });

        alert("Product Added Successfully");

        document.getElementById("name").value = "";
        document.getElementById("purchasePrice").value = "";
        document.getElementById("salesPrice").value = "";
        document.getElementById("quantity").value = "";
        document.getElementById("barcode").value = "";
        document.getElementById("image").value = "";

    } catch (error) {

        console.log(error);

        alert("Upload Failed");

    }

}
function loadProducts() {

    const table = document.getElementById("productTable");

    onSnapshot(collection(db, "products"), (snapshot) => {

        table.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const item = docSnap.data();

            table.innerHTML += `
                <tr>
                    <td><img src="${item.image}" width="60"></td>

                    <td>${item.name}</td>

                    <td>₹${item.purchasePrice}</td>

                    <td>₹${item.salesPrice}</td>

                    <td>${item.quantity}</td>

                    <td>${item.barcode || ""}</td>

                    <td>
                        <button onclick="editPrice('${docSnap.id}', ${item.salesPrice})">
                            Edit Price
                        </button>

                        <button onclick="addStock('${docSnap.id}', '${item.name}', ${item.quantity})">
    Add Stock
</button>
                        <button onclick="deleteProduct('${docSnap.id}');">
                            Delete
                        </button>
                    </td>
                </tr>
            `;

        });

    });

}

loadProducts();

window.deleteProduct = async function(id) {

    if (!confirm("Delete this product?")) return;

    try {
        await deleteDoc(doc(db, "products", id));
        alert("Product Deleted Successfully");
    } catch (e) {
        console.log(e);
        alert("Delete Failed");
    }

}
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
window.loadSales = async function () {

    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;

    if (!from || !to) {
        alert("Please Select From Date and To Date");
        return;
    }

    const table = document.getElementById("salesTable");
    table.innerHTML = "";

    const q = query(
    collection(db, "sales"),
    orderBy("invoiceNo", "asc")
);

const snapshot = await getDocs(q);

    let sno = 1;
    let totalSales = 0;

    snapshot.forEach((doc) => {

        const sale = doc.data();

        const saleDate = sale.date.split(",")[0];
        const parts = saleDate.split("/");

        const dbDate =
            parts[2] + "-" +
            parts[1].padStart(2, "0") + "-" +
            parts[0].padStart(2, "0");

        if (dbDate >= from && dbDate <= to) {

            table.innerHTML += `
            <tr>
                <td>${sno++}</td>
                <td>${sale.invoiceNo}</td>
                <td>${sale.date}</td>
                <td>₹${sale.total}</td>
            </tr>
            `;
            totalSales += Number(sale.total);
        }
        

    });
    
document.getElementById("totalSalesAmount").innerText = "₹" + totalSales;
};

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

   document.getElementById("salesSection").style.display = "block" ;
    document.getElementById("purchaseSection").style.display = "none";
    document.getElementById("stockSection").style.display = "none";

    document.getElementById("salesTable").innerHTML = "";

}
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

       const q = query(
    collection(db, "sales"),
    orderBy("invoiceNo", "asc")
);

const snapshot = await getDocs(q);

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
function barcodeScanned(barcode) {
    alert("Scanned: " + barcode);

    // Next step lo Firebase lo barcode search chesi
    // product auto add chestam.
}
window.showPurchaseReport = function(){

    document.getElementById("purchaseSection").style.display="block";

    document.getElementById("salesSection").style.display="none";

    document.getElementById("stockSection").style.display="none";

    

}

loadStock();
//loadProfitReport();
window.updateOldSales = async function () {

    try {

        const snapshot = await getDocs(collection(db, "sales"));

        let count = 0;

        for (const saleDoc of snapshot.docs) {

            const sale = saleDoc.data();

            // Skip if already updated
            if (sale.reportDate) continue;

            // Example date:
            // 14/07/2026, 4:35:20 PM

            const dateOnly = sale.date.split(",")[0];

            const parts = dateOnly.split("/");

            const reportDate =
                parts[2] + "-" +
                parts[1].padStart(2, "0") + "-" +
                parts[0].padStart(2, "0");

            await updateDoc(doc(db, "sales", saleDoc.id), {

                reportDate: reportDate

            });

            count++;

        }

        alert(count + " Sales Updated Successfully");

    } catch (error) {

        console.log(error);

        alert("Update Failed");

    }

};

window.addStock = async function(id, name, currentQty){

    const qty = prompt(
        `${name}\n\nCurrent Stock : ${currentQty}\n\nEnter New Stock`
    );

    if(qty == null) return;

    const addQty = Number(qty);

    if(isNaN(addQty) || addQty <= 0){

        alert("Enter Valid Quantity");

        return;

    }

    try{

        const productRef = doc(db,"products",id);

        // Update Product Sto
        await updateDoc(productRef,{
            quantity : currentQty + addQty
        });

        // Save Purchase Report
        await addDoc(collection(db,"purchaseReports"),{

            product: name,

            previousQty: currentQty,

            addedQty: addQty,

            currentQty: currentQty + addQty,

            date: new Date().toLocaleString(),

            reportDate: new Date().toISOString().split("T")[0]

        });

        alert("Stock Updated Successfully");

    }catch(error){

        console.log(error);

        alert("Update Failed");

    }

}
window.loadPurchaseReport = async function(){

    const from = document.getElementById("purchaseFromDate").value;

    const to = document.getElementById("purchaseToDate").value;

    if(!from || !to){

        alert("Select From Date and To Date");

        return;

    }

    const table = document.getElementById("purchaseTable");

    table.innerHTML = "";

    const q = query(

        collection(db,"purchaseReports"),

        where("reportDate",">=",from),

        where("reportDate","<=",to),

        orderBy("reportDate","asc")

    );

    const snapshot = await getDocs(q);

    let sno = 1;

    snapshot.forEach(doc=>{

        const item = doc.data();

        table.innerHTML += `

        <tr>

            <td>${sno++}</td>

            <td>${item.product}</td>

            <td>${item.previousQty}</td>

            <td>${item.addedQty}</td>

            <td>${item.currentQty}</td>

            <td>${item.date}</td>

        </tr>

        `;

    });

}
window.addStock = async function(id, name, currentQty) {

    

    const qty = prompt(
        `${name}\n\nCurrent Stock : ${currentQty}\n\nEnter Quantity to Add`
    );

    if (qty == null) return;

    const addQty = Number(qty);

    if (isNaN(addQty) || addQty <= 0) {
        alert("Enter Valid Quantity");
        return;
    }

    try {

        const productRef = doc(db, "products", id);

        await updateDoc(productRef, {
            quantity: Number(currentQty) + addQty
        });

        await addDoc(collection(db, "purchaseReports"), {
            product: name,
            previousQty: Number(currentQty),
            addedQty: addQty,
            currentQty: Number(currentQty) + addQty,
            date: new Date().toLocaleString(),
            reportDate: new Date().toISOString().split("T")[0]
        });

        alert("Stock Updated Successfully");

    } catch (error) {
        console.log(error);
        alert("Update Failed");
    }

};
window.editPrice = async function(id, currentPrice) {

    const newPrice = prompt(
        "Enter New Sales Price",
        currentPrice
    );

    if (newPrice == null) return;

    const price = Number(newPrice);

    if (isNaN(price) || price <= 0) {
        alert("Enter Valid Price");
        return;
    }

    try {

        await updateDoc(doc(db, "products", id), {
            salesPrice: price
        });

        alert("Price Updated Successfully");

    } catch (error) {

        console.log(error);
        alert("Update Failed");

    }

};