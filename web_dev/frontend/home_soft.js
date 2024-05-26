let intervalId;
let allData = [];

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
        const timeAttendedCell = document.createElement('td');

        nameCell.textContent = item.name;
        idCell.textContent = item.id;
        timeAttendedCell.textContent = item.timeAttended;

        row.appendChild(nameCell);
        row.appendChild(idCell);
        row.appendChild(timeAttendedCell);
        tableBody.appendChild(row);
    });
}

async function loadData() {
    allData = await fetchData();
    updateTable(allData.filter(item => item.date === new Date().toISOString().split('T')[0]));
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    intervalId = setInterval(loadData, 1000); // Fetch data every second
});

document.getElementById('search-date').addEventListener('click', () => {
    const dateInput = document.getElementById('dateInput').value;
    if (!dateInput) return; // Ignore the click if the date input is empty
    clearInterval(intervalId);
    const filteredData = allData.filter(item => item.date === dateInput);
    updateTable(filteredData);
});

document.getElementById('reset').addEventListener('click', () => {
    document.getElementById('dateInput').value = ''; // Clear the date input field
    clearInterval(intervalId);
    loadData();
    intervalId = setInterval(loadData, 1000);
});

function exportTableToExcel(tableID, filename = '') {
    const table = document.getElementById(tableID);
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Generate XLSX file and download
    XLSX.writeFile(wb, `${filename}.xlsx`);
}
