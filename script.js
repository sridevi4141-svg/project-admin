// Load Products from Local Storage
let products = JSON.parse(localStorage.getItem("products")) || [];

// Display Products
displayProducts();

function addProduct(){

let product={

name:document.getElementById("name").value,

image:document.getElementById("image").value,

purchasePrice:Number(document.getElementById("purchasePrice").value),

salesPrice:Number(document.getElementById("salesPrice").value),

quantity:Number(document.getElementById("quantity").value)

};

products.push(product);

localStorage.setItem("products",JSON.stringify(products));

displayProducts();


document.getElementById("name").value = "";
document.getElementById("image").value = "";
document.getElementById("purchasePrice").value = "";
document.getElementById("salePrice").value = "";
document.getElementById("quantity").value = "";
}

function displayProducts(){

    let table=document.getElementById("productTable");

    table.innerHTML="";

    products.forEach((item,index)=>{

        table.innerHTML += `

        <tr>

        <td>
        <img src="${item.image}" width="60">
        </td>

        <td>${item.name}</td>

        <td>₹ ${item.purchasePrice}</td>
        <td>₹ ${item.salesPrice}</td>

        
        <td>${item.quantity}</td>

       

        <td>

        <button class="edit-btn" onclick="editProduct(${index})">Edit</button>

        </td>

        </tr>

        `;

    });
   

}


function editProduct(index){

    let newsalesPrice = prompt("Enter New salesPrice",products[index].salesPrice);

    let newpurchasePrice = prompt("Enter New purchasePrice",products[index].purchaseprice);

    if(newsalesPrice!=null){

        products[index].salesPrice=newsalesPrice;

    }

    if(newpurchasePrice!=null){

        products[index].purchasePrice=newpurchasePrice;

    }

    localStorage.setItem("products",JSON.stringify(products));

    displayProducts();

}

function stockReport(){

    let report="";

    products.forEach(item=>{

        report += item.name + " : " + item.stock + " Items\n";

    });

    alert(report);

}

function salesReport(){

    alert("Sales Report Module will be connected with Billing Page.");

}
let invoiceNo = Math.floor(Math.random()*100000);

console.log("Invoice :",invoiceNo);

function showForm(){

    let form = document.getElementById("productForm");

    if(form.style.display=="none"){

        form.style.display="block";

    }else{

        form.style.display="none";

    }

}