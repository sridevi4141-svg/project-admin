import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    setDoc,
    updateDoc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
let products = [];
let bill = [];
let grandTotal = 0;
let currentInvoice = "";


// Load Products From Firebase
onSnapshot(collection(db, "products"), (snapshot) => {

    products = [];

    snapshot.forEach((doc) => {

        products.push({
            id: doc.id,
            ...doc.data()
        });

    });

    displayProducts();

});



// Show Products
function displayProducts() {

    let table = document.getElementById("productList");

    table.innerHTML = "";

    products.forEach((item, index) => {

        table.innerHTML += `

        <tr>

            <td>
                <img src="${item.image}" width="60">
            </td>

            <td>${item.name}</td>

            <td>₹${item.salesPrice}</td>

            <td>₹${item.purchasePrice}</td>

            <td>${item.quantity}</td>
            <td>${item.barcode}</td>

            <td>

                <button onclick="addToBill(${index})">
                    Add
                </button>

            </td>

        </tr>

        `;

    });

}



// Add To Bill
window.addToBill = function(index){

    if(products[index].quantity <= 0){

        alert("Out Of Stock");

        return;

    }

    let found = bill.find(item => item.id === products[index].id);

    if(found){

        found.qty++;

        found.total = found.qty * found.salesPrice;

    }else{

        bill.push({

            id: products[index].id,
            name: products[index].name,
            purchasePrice: Number(products[index].purchasePrice),
            salesPrice: Number(products[index].salesPrice),
            qty: 1,
            total: Number(products[index].salesPrice)

        });

    }

    displayBill();

}



// Display Bill
function displayBill() {

    let table = document.getElementById("billTable");

    table.innerHTML = "";

    grandTotal = 0;

    bill.forEach(item => {

        grandTotal += item.total;

        table.innerHTML += `
            <tr>
                <td style="padding:4px 0;">${item.name}</td>

                <td style="text-align:center;">${item.qty}</td>

                <td style="text-align:right;">₹${item.total}</td>
            </tr>
        `;

    });

    document.getElementById("customerGrandTotal").innerHTML = "₹" + grandTotal;
}

// Search
window.searchProduct = function(){

    let value = document
        .getElementById("search")
        .value
        .toLowerCase();

    let rows = document.querySelectorAll("#productList tr");

    rows.forEach(row=>{

        let name = row.children[1].innerText.toLowerCase();

        row.style.display =
            name.includes(value) ? "" : "none";

    });

}



// Clear Bill
window.clearBill = function(){

    if(confirm("Clear Bill?")){

        bill = [];

        grandTotal = 0;

        displayBill();

    }

}



window.printBill = async function () {

    if (bill.length === 0) {
        alert("Bill Empty");
        return;
    }

    try {

        // Invoice Number
        const invoiceNo = await getInvoiceNumber();
        currentInvoice = invoiceNo;

        // Save Sale
        await addDoc(collection(db, "sales"), {
            invoiceNo,
            date: new Date().toLocaleString(),
            items: bill,
            total: grandTotal
        });

        // Update Stock
        for (const item of bill) {

            const productRef = doc(db, "products", item.id);

            await runTransaction(db, async (transaction) => {

                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) {
                    throw new Error("Product not found");
                }

                const currentQty = productDoc.data().quantity;

                if (currentQty < item.qty) {
                    throw new Error(item.name + " Out Of Stock");
                }

                transaction.update(productRef, {
                    quantity: currentQty - item.qty
                });

            });
        }
// Receipt Preview
let rows = "";

bill.forEach(item => {

    rows += `
    <tr>
        <td style="width:70%;padding:6px 0;">
            ${item.name}
        </td>

        <td style="width:10%;text-align:center;">
            ${item.qty}
        </td>

        <td style="width:20%;text-align:right;">
            ₹${item.total}
        </td>
    </tr>
    `;

});

// Update Receipt
document.getElementById("billItems").innerHTML = rows;
document.getElementById("invoiceNo").innerText = currentInvoice;
document.getElementById("date").innerText = new Date().toLocaleString();
document.getElementById("printGrandTotal").innerText = "₹" + grandTotal;

// Show Preview
const printArea = document.getElementById("printArea");
printArea.style.display = "block";

// Bluetooth Print
setTimeout(() => {

    if (window.Android) {

        bluetoothPrint();

    } else {

        window.print();

    }

}, 300);

// Clear Bill
window.onafterprint = function () {

    printArea.style.display = "none";

    bill = [];
    grandTotal = 0;

    displayBill();

};        // Show Receipt
        
    } catch (error) {

        console.error(error);
        alert(error.message);

    }

};

async function getInvoiceNumber() {

    const counterRef = doc(db, "counter", "invoice");
    const counterSnap = await getDoc(counterRef);

    let invoiceNo = 1;

    if (counterSnap.exists()) {

        invoiceNo = counterSnap.data().lastNo + 1;

        await updateDoc(counterRef, {
            lastNo: invoiceNo
        });

    } else {

        await setDoc(counterRef, {
            lastNo: 1
        });

    }

    return "INV-" + invoiceNo.toString().padStart(4, "0");
}
function bluetoothPrint() {

    let printdata = "";

    printdata += "[C]<font size='big'><b>SRI DHANA LAKSHMI RICE</b></font>\n";
    printdata += "[C]<b>AND GENERAL STORE</b>\n";
    printdata += "[C]Suryanarayanapuram - 533344\n";
    printdata += "[C]Ph : 9652209111\n\n";

    printdata += "Invoice : " + currentInvoice + "\n";
    printdata += "Date : " + new Date().toLocaleString() + "\n";

    printdata += "--------------------------------\n";

    bill.forEach(item => {

        let name = item.name.substring(0,18).padEnd(18, " ");
        let qty = String(item.qty).padStart(2, " ");
        let amount = ("₹" + item.total).padStart(8, " ");

        printdata += name + qty + amount + "\n";

    });

    printdata += "--------------------------------\n";
    printdata += "[R]<b>Grand Total : ₹" + grandTotal + "</b>\n";
    printdata += "--------------------------------\n";
    printdata += "[C]Thank You Visit Again\n\n\n";

    Android.printBill(printdata);

}
async function barcodeScanned(barcode) {

    const index = products.findIndex(
        p => String(p.barcode) === String(barcode)
    );

    if (index >= 0) {

        addToBill(index);

    } else {

        alert("Product Not Found");

    }
}
// Barcode Scanner (USB Wireless Keyboard Mode)

let barcodeInput = document.getElementById("barcodeInput");

barcodeInput.addEventListener("keydown", function(e){

    if(e.key === "Enter"){

        let barcode = barcodeInput.value.trim();

        if(barcode !== ""){

            console.log("Barcode Scanned:", barcode);

            searchBarcodeProduct(barcode);

            barcodeInput.value="";
        }
    }

});
function searchBarcodeProduct(barcode){

    let index = products.findIndex(
        p => p.barcode === barcode
    );

    console.log("Product Index:", index);
    console.log("Product:", products[index]);

    if(index !== -1){

        addToBill(index);

    }else{

        alert("Barcode Product Not Found");
    }
}
// Wireless USB Barcode Scanner (Keyboard Mode)

//let barcodeInput = document.getElementById("barcodeInput");

if(barcodeInput){

    barcodeInput.addEventListener("keydown", function(e){

        if(e.key === "Enter"){

            let barcode = barcodeInput.value.trim();

            if(barcode !== ""){

                console.log("Scanned:", barcode);

                barcodeScanned(barcode);

                barcodeInput.value = "";
            }
        }

    });

}