document.addEventListener('DOMContentLoaded', () => {
    const goToLogin = document.getElementById('goToLogin');
    const goToSignup = document.getElementById('goToSignup');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordButton = document.getElementById('forgotPassword');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');
    const backToLogin = document.getElementById('backToLogin');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetPasswordFormElement = document.getElementById('resetPasswordFormElement');

    if (goToLogin) {
        goToLogin.addEventListener('click', () => {
            document.getElementById('signup').style.display = 'none';
            document.getElementById('login').style.display = 'block';
        });
    }

    if (goToSignup) {
        goToSignup.addEventListener('click', () => {
            document.getElementById('login').style.display = 'none';
            document.getElementById('signup').style.display = 'block';
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const result = await response.text();
            if(result === 'User created successfully'){
                document.getElementById('signup').style.display = 'none';
                document.getElementById('login').style.display = 'block';
            }
            alert(result);
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("log in successful");
                localStorage.setItem('token', result.token); // Store token in localStorage
                window.location.href = "../html/dashboard.html";
                document.getElementById('login').style.display = 'none';
            } else {
                if (result.message === "User not found"){
                    alert("email does not exists");
                }
                else if(result.message === "Invalid credentials"){
                    alert("Incorrect Password");
                }else{
                    alert("enter valid username and password");
                }
            }
        });
    }

    if (forgotPasswordButton) {
        forgotPasswordButton.addEventListener('click', () => {
            document.getElementById('login').style.display = 'none';
            document.getElementById('forgotPasswordForm').style.display = 'block';
        });
    }

    if (backToLogin) {
        backToLogin.addEventListener('click', () => {
            document.getElementById('forgotPasswordForm').style.display = 'none';
            document.getElementById('login').style.display = 'block';
        });
    }

    if (forgotPasswordFormElement) {
        forgotPasswordFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgotPasswordEmail').value;

            const response = await fetch('/api/password/forgotpassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();
            alert(result.message);
        });
    }
    
});