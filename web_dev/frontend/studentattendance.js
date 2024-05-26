
        let studentname;
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
        function updateTable(data,studentId) {
            const logTableBody = document.getElementById('logTableBody');
            logTableBody.innerHTML = ''; // Clear existing table rows
        
            data.forEach(item => {
                console.log(item.id);
                console.log(studentId);
                // Only add the row if the date is today's date
                if (item.id == studentId) {
                    console.log('found')
                    studentname=item.name;
                    document.getElementById('studentName').innerText = studentname;
                    const row = document.createElement('tr');
                    const dateCell = document.createElement('td');
                    const timeCell = document.createElement('td');
                    dateCell.textContent = item.date;
                    timeCell.textContent = item.timeAttended;
                    row.appendChild(dateCell);
                    row.appendChild(timeCell);
                    logTableBody.appendChild(row);
                
            }});
        }

        document.addEventListener('DOMContentLoaded', async () => {
        data = await fetchData();
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const studentId = urlParams.get('id');
        // Display student information
        document.getElementById('studentId').innerText = studentId;
        updateTable(data,studentId);
        });
