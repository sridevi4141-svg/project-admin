// Load products from Admin
let products = JSON.parse(localStorage.getItem("products")) || [];

let bill = [];
let grandTotal = 0;

// Show Products
displayProducts();

function displayProducts() {

    let table = document.getElementById("productList");

    table.innerHTML = "";

    products.forEach((item, index) => {

        table.innerHTML += `
        <tr>

            <td>
                <img src="${item.image}" width="60" height="60">
            </td>

            <td>${item.name}</td>

            <td>₹${item.price}</td>

            <td>${item.stock}</td>

            <td>
                <button onclick="addToBill(${index})">
                    Add
                </button>
            </td>

        </tr>
        `;

    });

}

// Add Product To Bill
function addToBill(index){

    if(products[index].stock <= 0){

        alert("Out Of Stock");

        return;

    }

    let found = bill.find(item => item.name === products[index].name);

    if(found){

        found.qty++;

        found.total = found.qty * found.price;

    }else{

        bill.push({

            name:products[index].name,
            price:Number(products[index].price),
            qty:1,
            total:Number(products[index].price)

        });

    }

    products[index].stock--;

    localStorage.setItem("products",JSON.stringify(products));

    displayProducts();

    displayBill();

}

// Display Bill
function displayBill(){

    let table=document.getElementById("billTable");

    table.innerHTML="";

    grandTotal=0;

    bill.forEach(item=>{

        grandTotal += item.total;

        table.innerHTML +=`

        <tr>

        <td>${item.name}</td>

        <td>₹${item.price}</td>

        <td>${item.qty}</td>

        <td>₹${item.total}</td>

        </tr>

        `;

    });

    document.getElementById("grandTotal").innerHTML =
    "Grand Total : ₹"+grandTotal;

}

// Clear Bill
function clearBill(){

    if(confirm("Clear Bill?")){

        bill=[];

        grandTotal=0;

        displayBill();

    }

}

// Print Bill
function printBill(){

    window.print();

}

function searchProduct(){

    let value = document
        .getElementById("search")
        .value
        .toLowerCase();

    let rows = document.querySelectorAll("#productList tr");

    rows.forEach(row=>{

        let name = row.children[1].innerText.toLowerCase();

        if(name.includes(value)){

            row.style.display="";

        }else{

            row.style.display="none";

        }

    });

}
setInterval(function(){

    let date = new Date();

    document.getElementById("dateTime").innerHTML =
    date.toLocaleString();

},1000);