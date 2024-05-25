data2=[
    {
        "_id": "66466720bf539516246bf3b8",
        "id": 222102535,
        "date": "2024-05-16",
        "__v": 0,
        "name": "Karim Mamdouh Ahmed",
        "timeAttended": "23:08:59"
    },
    {
        "_id": "66466842bf539516246bf478",
        "id": 221100740,
        "date": "2024-05-24",
        "__v": 0,
        "name": "Omar Essam Mahmoud Ali",
        "timeAttended": "23:10:42"
    },
    {
        "_id": "6647149a1886089371132edf",
        "date": "2024-05-17",
        "id": 222102387,
        "__v": 0,
        "name": "Maram Ashraf Said Elbana",
        "timeAttended": "18:36:12"
    },
    {
        "_id": "6647149a1886089371132ede",
        "date": "2024-05-17",
        "id": 222102387,
        "__v": 0,
        "name": "Maram Ashraf Said Elbana",
        "timeAttended": "11:26:02"
    },
    {
        "_id": "6647149a1886089371132edd",
        "date": "2024-05-17",
        "id": 222102387,
        "__v": 0,
        "name": "Maram Ashraf Said Elbana",
        "timeAttended": "11:26:02"
    },
    {
        "_id": "6647149a1886089371132ee0",
        "date": "2024-05-17",
        "id": 222102387,
        "__v": 0,
        "name": "Maram Ashraf Said Elbana",
        "timeAttended": "11:26:02"
    },
    {
        "_id": "6647294f18860893711331fb",
        "date": "2024-05-17",
        "id": 221101234,
        "__v": 0,
        "name": "Abdelrahman Ayman Mostafa Mohamed",
        "timeAttended": "12:54:23"
    },
    {
        "_id": "664729611886089371133201",
        "date": "2024-05-24",
        "id": 222102535,
        "__v": 0,
        "name": "Karim Mamdouh Ahmed",
        "timeAttended": "12:54:41"
    }
]

async function fetchData() {
    let data = [];
    try {
        const response = await fetch('http://localhost:3000/api/attendance'); // Added http:// to the URL
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
    //const data = await fetchData();
    updateTable(data2);
}

document.addEventListener('DOMContentLoaded', loadData);
setInterval(loadData, 20000); // Fetch data every 20 seconds

function exportTableToExcel(tableID, filename = '') {
    const table = document.getElementById(tableID);
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Generate XLSX file and download
    XLSX.writeFile(wb, `${filename}.xlsx`);
}
