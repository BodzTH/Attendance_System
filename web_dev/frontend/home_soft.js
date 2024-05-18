async function fetchData() {
    let data = [];
    try {
        const response = await fetch('http://localhost:5090/api/attendance'); // Added http:// to the URL
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        data = await response.json();
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
    return data;
}

function updateTable(data) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Clear existing table rows

    data.forEach(item => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const idCell = document.createElement('td');

        nameCell.textContent = `${item.first_name} ${item.last_name}`;
        idCell.textContent = item.user_id;

        row.appendChild(nameCell);
        row.appendChild(idCell);
        tableBody.appendChild(row);
    });
}

async function loadData() {
    const data = await fetchData();
    updateTable(data);
}

document.addEventListener('DOMContentLoaded', loadData);
setInterval(loadData, 10000); // Fetch data every 10 seconds
