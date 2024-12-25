document.addEventListener('DOMContentLoaded', async () => {
    const monthlyTableBody = document.querySelector('#monthlyTable tbody');
    const yearlyTableBody = document.querySelector('#yearlyTable tbody');
    const notesTableBody = document.querySelector('#notesTable tbody');
    const downloadButton = document.getElementById('downloadButton');
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

    // Enable download button for premium users
    if (userDetails.isPremiumUser) {
        downloadButton.disabled = false;
    }


    const monthlyExpensesData = JSON.parse(localStorage.getItem('monthlyExpenses'));
    if (!monthlyExpensesData ) {
        alert('No monthly expenses data found');
        return;
    }

    const monthlyExpenses = monthlyExpensesData;
    //const totalMonthlyExpense = monthlyExpensesData.totalExpenses;
    let totalIncome = 0;
    let totalExpense = 0;

    monthlyExpenses.forEach(expense => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>${expense.amount}</td>
        `;
        monthlyTableBody.appendChild(tr);

        if (expense.category.toLowerCase() === 'salary') {
            totalIncome += parseFloat(expense.amount);
        } else {
            totalExpense += parseFloat(expense.amount);
        }
       
    });


    document.getElementById('totalIncome').textContent = totalIncome.toFixed(2);
    document.getElementById('totalExpense').textContent = totalExpense.toFixed(2);
    document.getElementById('totalSavings').textContent = (totalIncome - totalExpense).toFixed(2);

    // Fetch yearly expenses
    const fetchYearlyExpenses = async () => {
        const response = await fetch('/api/expenses/yearly', {
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

    const yearlyExpenses = await fetchYearlyExpenses();
    let yearlyTotalIncome = 0;
    let yearlyTotalExpense = 0;

    yearlyExpenses.forEach(expense => {
        const savings = expense.total_income - expense.total_expense;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${expense.month}</td>
            <td>${expense.total_income}</td>
            <td>${expense.total_expense}</td>
            <td style="color: green;">${savings}</td>
        `;
        yearlyTableBody.appendChild(tr);

        yearlyTotalIncome += expense.total_income;
        yearlyTotalExpense += expense.total_expense;
    });

    document.getElementById('yearlyTotalIncome').textContent = yearlyTotalIncome;
    document.getElementById('yearlyTotalExpense').textContent = yearlyTotalExpense;
    document.getElementById('yearlyTotalSavings').textContent = yearlyTotalIncome - yearlyTotalExpense;

    // Fetch notes
    const fetchNotes = async () => {
        const response = await fetch('/api/notes', {
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

    const notes = await fetchNotes();

    notes.forEach(note => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(note.date).toLocaleDateString()}</td>
            <td>${note.note}</td>
        `;
        notesTableBody.appendChild(tr);
    });



    const fetchDownloadUrls = async () => {
        const response = await fetch('/api/expenses/download-urls', {
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
    const downloadUrls = await fetchDownloadUrls();
    const downloadLinksContainer = document.createElement('div');
    downloadLinksContainer.id = 'downloadLinksContainer';
    document.getElementById('app').appendChild(downloadLinksContainer);

    downloadUrls.forEach(url => {
        const link = document.createElement('a');
        link.href = url.file_url;
        link.textContent = `Download from ${new Date(url.download_date).toLocaleString()}`;
        link.target = '_blank';
        downloadLinksContainer.appendChild(link);
        downloadLinksContainer.appendChild(document.createElement('br'));
    });
    // Handle download button click
    downloadButton.addEventListener('click', async () => {
        const response = await fetch('/api/expenses/download', {
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

        const { fileUrl } = await response.json();
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = 'expenses.csv';
        a.click();

        const newLink = document.createElement('a');
        newLink.href = fileUrl;
        newLink.textContent = `Download from ${new Date().toLocaleString()}`;
        newLink.target = '_blank';
        downloadLinksContainer.insertBefore(newLink, downloadLinksContainer.firstChild);
        downloadLinksContainer.insertBefore(document.createElement('br'), downloadLinksContainer.firstChild);
    });
});