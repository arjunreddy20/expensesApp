document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordFormElement = document.getElementById('resetPasswordFormElement');

    if (resetPasswordFormElement) {
        resetPasswordFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const urlParams = new URLSearchParams(window.location.search);
            const id = window.location.pathname.split('/').pop();

            const response = await fetch(`/api/password/resetpassword/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });

            const result = await response.json();
            alert(result.message);
            if (response.ok) {
                window.location.href = '/';
            }
        });
    }
    
});