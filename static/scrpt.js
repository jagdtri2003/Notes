const login = async (email,password) =>{

    const loginBtn = document.getElementById("loginBtn");
    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
    loginBtn.disabled = true;

    const res = await fetch('/login',{
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body:JSON.stringify({email,password})
    })

    const user = await res.json();

    if(user.code==='Fail'){
        document.getElementById("error").style.display="block";
    }else if(user.code==='success'){
        window.location.href="/homepage";
    }
    loginBtn.innerHTML = 'Login';
    loginBtn.disabled = false;
} 

const register = async(name,email,password) =>{

    const registerBtn = document.getElementById("registerBtn");
    registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
    registerBtn.disabled = true;

    const res = await fetch('/register',{
        method:"POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({name,email,password})
    });

    const msg = await res.json();
    console.log(msg);

    if(msg.code==='success'){
        document.getElementById("error-msg").style.display="none";
        document.getElementById("msg").style.display="block";
    }else if(msg.code==='Fail'){
        document.getElementById("msg").style.display="none";
        document.getElementById("error-msg").style.display="block";
    }
    registerBtn.innerHTML = 'Register';
    registerBtn.disabled = false;
}