async function fetchData() {
    try {
        const response = await fetch('localhost:3000/attendance');
        if (!response.ok) {
            throw new Error('error');
        }
        const data = await response.json();
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchData);
setInterval(fetchData, 20000);
