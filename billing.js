import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    getDoc,
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

        found.total = found.qty * found.purchasePrice;

    }else{

        bill.push({

            id: products[index].id,
            name: products[index].name,
            purchasePrice: Number(products[index].purchasePrice),
            salesPrice: Number(products[index].salesPrice),
            qty: 1,
            total: Number(products[index].purchasePrice)

        });

    }

    displayBill();

}



// Display Bill
function displayBill(){

    let table = document.getElementById("billTable");

    table.innerHTML = "";

    grandTotal = 0;

    bill.forEach(item=>{

        grandTotal += item.total;

        table.innerHTML += `

        <tr>

            <td>${item.name}</td>

            <td>₹${item.purchasePrice}</td>

            <td>₹${item.salesPrice}</td>

            <td>${item.qty}</td>

            <td>₹${item.total}</td>

        </tr>

        `;

    });

    document.getElementById("grandTotal").innerHTML =
    "Grand Total : ₹" + grandTotal;

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



// Print
window.printBill = function () {

    if (bill.length === 0) {

        alert("Bill Empty");

        return;

    }

    document.getElementById("printInvoice").innerText = currentInvoice;

    document.getElementById("printDate").innerText =
        new Date().toLocaleString();

    let rows = "";

    bill.forEach(item => {

        rows += `
        <tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>${item.total}</td>
        </tr>
        `;

    });

    document.getElementById("printItems").innerHTML = rows;

    document.getElementById("printTotal").innerHTML =
        "Grand Total : ₹" + grandTotal;

    document.getElementById("printArea").style.display = "block";

    window.print();

    document.getElementById("printArea").style.display = "none";

}
// Date Time
setInterval(()=>{

    document.getElementById("dateTime").innerHTML =
        new Date().toLocaleString();

},1000);

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
window.saveBill = async function () {

    if (bill.length === 0) {
        alert("Bill is Empty");
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

        // Reduce Stock
        for (const item of bill) {

            const productRef = doc(db, "products", item.id);

            await runTransaction(db, async (transaction) => {

                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) {
                    throw "Product not found";
                }

                const currentQty = productDoc.data().quantity;

                if (currentQty < item.qty) {
                    throw `${item.name} Out Of Stock`;
                }

                transaction.update(productRef, {
                    quantity: currentQty - item.qty
                });

            });

        }

       

        // Clear Bill
        bill = [];
        grandTotal = 0;
        displayBill();

    } catch (error) {

        console.error(error);
        alert(error);

    }

}