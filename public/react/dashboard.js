document.addEventListener('DOMContentLoaded', async () => {
    const expenseForm = document.getElementById('expenseForm');
    const expenseList = document.getElementById('expenseList');
    const buyPremiumButton = document.getElementById('buyPremium');
    const showLeaderboardButton = document.getElementById('showLeaderboard');
    const leaderboard = document.getElementById('leaderboard');
    const leaderboardList = document.getElementById('leaderboardList');
    const viewInsightsButton = document.getElementById('viewInsights');
    const expensesPerPageSelect = document.getElementById('expensesPerPage');
    const token = localStorage.getItem('token'); // Get token from localStorage

    // Fetch user details
    const fetchUserDetails = async () => {
        const response = await fetch('/api/user-details', {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message);
            return;
        }

        return await response.json();
    };

    const userDetails = await fetchUserDetails();

    // Check if the user is a premium user
    if (userDetails.isPremiumUser) {
        buyPremiumButton.textContent = 'Using Premium';
        buyPremiumButton.addEventListener('click', () => {
            alert('You are using the premium');
        });
        showLeaderboardButton.style.display = 'block';
    } else {
        buyPremiumButton.addEventListener('click', async () => {
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.error);
                return;
            }

            const { orderId } = await response.json();
            localStorage.setItem('orderId', orderId); // Store orderId in localStorage

            const options = {
                key: 'rzp_test_9qr0yuIvVRsWmo',
                amount: 2500,
                currency: 'INR',
                name: 'Expense App',
                description: 'Premium Membership',
                order_id: orderId,
                handler: async function (response) {
                    const paymentId = response.razorpay_payment_id;
                    const orderId = response.razorpay_order_id;
                    const status = 'success';

                    await fetch('/api/update-order-status', {
                        method: 'POST',
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ orderId, paymentId, status })
                    });

                    alert('Transaction successful');
                    window.location.reload();
                },
                prefill: {
                    name: userDetails.name,
                    email: userDetails.email
                },
                theme: {
                    color: '#F37254'
                }
            };

            const rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', async function (response) {
                const paymentId = response.error.metadata.payment_id;
                const orderId = response.error.metadata.order_id;
                const status = 'failed';

                await fetch('/api/update-order-status', {
                    method: 'POST',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ orderId, paymentId, status })
                });

                alert('Transaction failed');
            });

            rzp1.open();
        });
        showLeaderboardButton.style.display = 'none';
        }


        let expensesPerPage = localStorage.getItem('expensesPerPage') || 10;
        expensesPerPageSelect.value = expensesPerPage;

    
        let currentPage = 1;
        
    
        const fetchExpenses = async (page = 1) => {
            const response = await fetch(`/api/expenses/monthly?page=${page}&limit=${expensesPerPage}`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                const error = await response.json();
                alert(error.message);
                return;
            }
    
            const { expenses, totalExpenses, totalPages, currentPage } = await response.json();
            //console.log(expenses);
            //console.log('----------------------------Fetched expenses:', expenses); 
            expenseList.innerHTML = '';
            if (Array.isArray(expenses)) {
                expenses.forEach(expense => {
                    const li = document.createElement('li');
                    li.textContent = `${expense.amount} - ${expense.description} - ${expense.category}`;
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    console.log(expense.id)
                    deleteButton.addEventListener('click', async () => {
                        console.log(`Deleting expense with id: ${expense.id}`);
                        await deleteExpense(expense.id);
                        await fetchExpenses(currentPage); // Ensure the current page is fetched again
                    });
                    li.appendChild(deleteButton);
                    expenseList.appendChild(li);
                });
            }
            updatePagination(totalPages, currentPage);
        };
    
        const updatePagination = (totalPages, currentPage) => {
            paginationContainer.innerHTML = '';
    
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.disabled = i === currentPage;
                pageButton.addEventListener('click', () => {
                    fetchExpenses(i);
                });
                paginationContainer.appendChild(pageButton);
            }
        };
    
        // Initial fetch
        fetchExpenses(currentPage);
    
        const deleteExpense = async (id) => {
            console.log(`Sending DELETE request for id: ${id}`);
            const response = await fetch(`/api/expenses/monthly/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                const error = await response.json();
                alert(error.message);
            } else {
                console.log(`Expense with id: ${id} deleted successfully`);
            }
        };
    
        // Handle adding new expense
        expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = document.getElementById('amount').value;
            const description = document.getElementById('description').value;
            const category = document.getElementById('category').value;
    
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount, description, category })
            });
    
            if (!response.ok) {
                const error = await response.json();
                alert(error.message);
                return;
            }
    
            await fetchExpenses(currentPage);
            expenseForm.reset();
        });
    
        // Handle showing leaderboard
        showLeaderboardButton.addEventListener('click', async () => {
            await updateLeaderboard();
            leaderboard.style.display = 'block';
        });
    
        const updateLeaderboard = async () => {
            const response = await fetch('/api/leaderboard', {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                const error = await response.json();
                alert(error.message);
                return;
            }
    
            const leaderboardData = await response.json();
            leaderboardList.innerHTML = '';
            leaderboardData.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `${user.name} - Total Expenses: ${user.total_expenses}`;
                leaderboardList.appendChild(li);
            });
        };
    
        viewInsightsButton.addEventListener('click', async () => {
            const response = await fetch('/api/expenses/all-monthly', {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                const error = await response.json();
                alert(error.message);
                return;
            }
    
            const { expenses, totalExpenses } = await response.json();
            localStorage.setItem('monthlyExpenses', JSON.stringify(expenses));
            localStorage.setItem('totalExpenses', totalExpenses);
            window.location.href = '/html/insights.html';
            
        });

        expensesPerPageSelect.addEventListener('change', async () => {
            expensesPerPage = expensesPerPageSelect.value;
            localStorage.setItem('expensesPerPage', expensesPerPage);
            await fetchExpenses(currentPage);
        });

        document.getElementById("addNote").addEventListener("click", async () => {
            const note = document.getElementById("note").value;
            const date = document.getElementById("date").value;

            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {  
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note, date })
            });
            
            if (!response.ok) {
                const error = await response.json();
                alert(error.message);
                return;
            }
            alert('Note added successfully');
            document.getElementById("note").value = '';
            document.getElementById("date").value = '';
        })
    });