import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
let editId = null;
// Save Staff
window.saveStaff = async function () {

    const name = document.getElementById("staffName").value;
    const phone = document.getElementById("staffPhone").value;
    const username = document.getElementById("staffUsername").value;
    const password = document.getElementById("staffPassword").value;

    if(name=="" || phone=="" || username=="" || password==""){
        alert("Please Fill All Details");
        return;
    }

    if(editId){

        await updateDoc(doc(db,"staff",editId),{

            name:name,
            phone:phone,
            username:username,
            password:password

        });

        alert("Staff Updated Successfully");

        editId = null;

    }else{

        await addDoc(collection(db,"staff"),{

            name:name,
            phone:phone,
            username:username,
            password:password

        });

        alert("Staff Saved Successfully");

    }

    document.getElementById("staffName").value="";
    document.getElementById("staffPhone").value="";
    document.getElementById("staffUsername").value="";
    document.getElementById("staffPassword").value="";

    loadStaff();

}
// Load Staff
async function loadStaff(){

    const tbody=document.getElementById("staffTable");

    tbody.innerHTML="";

    const querySnapshot=await getDocs(collection(db,"staff"));

    querySnapshot.forEach((docSnap)=>{

        const data=docSnap.data();

        tbody.innerHTML += `

        <tr>

            <td>${data.name}</td>

            <td>${data.phone}</td>

            <td>${data.username}</td>

            

            <td>

<button onclick="editStaff(
'${docSnap.id}',
'${data.name}',
'${data.phone}',
'${data.username}',
'${data.password}'
)">
Edit
</button>

<button onclick="deleteStaff('${docSnap.id}')">
Delete
</button>

</td>
        </tr>

        `;

    });

}



// Delete Staff
window.deleteStaff = async function(id){

    if(confirm("Delete Staff?")){

        await deleteDoc(doc(db,"staff",id));

        loadStaff();

    }

}

window.editStaff = function(id,name,phone,username,password){

    editId = id;

    document.getElementById("staffName").value = name;
    document.getElementById("staffPhone").value = phone;
    document.getElementById("staffUsername").value = username;
    document.getElementById("staffPassword").value = password;

}

loadStaff();