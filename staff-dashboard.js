const staff = JSON.parse(localStorage.getItem("staffLogin"));

if(staff){

    document.getElementById("staffWelcome").innerHTML =
    "👋 Welcome " + staff.name;

}else{

    window.location="staff-login.html";

}

function openDay(day){

    window.location =
    "day-customers.html?day=" + day;

}

function logoutStaff(){

    localStorage.removeItem("staffLogin");

    window.location="staff-login.html";

}