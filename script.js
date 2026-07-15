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
    orderBy,getDocs,where
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
    const barcode = document.getElementById("barcode").value;

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
            quantity,
            barcode,

        });

        alert("Product Added Successfully");

        document.getElementById("name").value = "";
        document.getElementById("image").value = "";
        document.getElementById("purchasePrice").value = "";
        document.getElementById("salesPrice").value = "";
        document.getElementById("quantity").value = "";
        document.getElementById("barcode").value = "";

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
                    <td>${item.barcode}</td>


                    <td>
                        <td>

<button onclick="editProduct('${doc.id}', ${item.purchasePrice}, ${item.salesPrice})">
    Edit Price
</button>

<button onclick="addStock('${doc.id}', '${item.name}', ${item.quantity})">
    Add Stock
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
window.loadSales = async function () {

    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;

    if (!from || !to) {
        alert("Please Select From Date and To Date");
        return;
    }

    const table = document.getElementById("salesTable");
    table.innerHTML = "";

    const snapshot = await getDocs(collection(db, "sales"));

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

        // Update Product Stock
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