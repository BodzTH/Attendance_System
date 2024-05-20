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

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    console.log(today);
    data.forEach(item => {
        // Only add the row if the date is today's date
        if (item.date === today) {
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
        
    }});
}

async function loadData() {
    const data = await fetchData();
    updateTable(data);
}

document.addEventListener('DOMContentLoaded', loadData);
setInterval(loadData, 1000); // Fetch data every 20 seconds

function exportTableToExcel(tableID, filename = '') {
    const table = document.getElementById(tableID);
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Generate XLSX file and download
    XLSX.writeFile(wb, `${filename}.xlsx`);
}
