/* ========================
   SIGNUP FUNCTION
======================== */

function signup(){

    const name=document.getElementById("name").value;
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    
    if(name==="" || email==="" || password===""){
    alert("Please fill all fields");
    return;
    }
    
    /* Save user in LocalStorage */
    localStorage.setItem("userEmail",email);
    localStorage.setItem("userPassword",password);
    
    /* Login automatically */
    localStorage.setItem("isLoggedIn","true");
    
    alert("Signup Successful ✅");
    
    /* Redirect to Home Page */
    window.location.href="index.html";
    }
    
    
    /* ========================
       LOGIN FUNCTION
    ======================== */
    
    function login(){
    
    const email=document.getElementById("loginEmail").value;
    const password=document.getElementById("loginPassword").value;
    
    const savedEmail=localStorage.getItem("userEmail");
    const savedPassword=localStorage.getItem("userPassword");
    
    if(email===savedEmail && password===savedPassword){
    
    localStorage.setItem("isLoggedIn","true");
    
    alert("Login Successful ✅");
    
    /* Redirect to Home Page */
    window.location.href="index.html";
    
    }
    else{
    alert("Invalid Credentials ❌");
    }
    }
    
    
    /* ========================
       LOGOUT FUNCTION
    ======================== */
    
    function logout(){
    
    localStorage.removeItem("isLoggedIn");
    
    window.location.href="login.html";
    }