// Load Products from Local Storage
let products = JSON.parse(localStorage.getItem("products")) || [];

// Display Products
displayProducts();

function addProduct() {

    let name = document.getElementById("name").value;
    let price = document.getElementById("price").value;
    let quantity = document.getElementById("quantity").value;
    let stock = document.getElementById("stock").value;
    let image = document.getElementById("image").value;

    if(name=="" || price=="" || stock==""){
        alert("Please fill all fields");
        return;
    }

    let product = {
        name:name,
        price:price,
       quantity:quantity,
        stock:stock,
        image:image
    };

    products.push(product);

    localStorage.setItem("products",JSON.stringify(products));

    displayProducts();

    document.getElementById("name").value="";
    document.getElementById("price").value="";
    document.getElementById("quantity").value="";
    document.getElementById("stock").value="";
    document.getElementById("image").value="";
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

        <td>₹ ${item.price}</td>

        
        <td>${item.quantity}</td>

        <td>${item.stock}</td>

        <td>

        <button class="edit-btn" onclick="editProduct(${index})">Edit</button>

        <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>

        </td>

        </tr>

        `;

    });
   

}

function deleteProduct(index){

    if(confirm("Delete this product?")){

        products.splice(index,1);

        localStorage.setItem("products",JSON.stringify(products));

        displayProducts();

    }

}

function editProduct(index){

    let newPrice = prompt("Enter New Price",products[index].price);

    let newStock = prompt("Enter New Stock",products[index].stock);

    if(newPrice!=null){

        products[index].price=newPrice;

    }

    if(newStock!=null){

        products[index].stock=newStock;

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

