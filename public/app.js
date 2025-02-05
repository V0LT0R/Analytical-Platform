const ctx = document.getElementById('chart').getContext('2d');
let chart;

document.getElementById('filterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const field = document.getElementById('field').value;
    const start_date = document.getElementById('start_date').value;
    const end_date = document.getElementById('end_date').value;

    try {
        console.log('Fetching data for:', { field, start_date, end_date }); // Логирование запроса

        const response = await fetch(`/api/measurements?field=${field}&start_date=${start_date}&end_date=${end_date}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data from server:', data);

        if (data.length === 0) {
            alert('No data found for the selected range.');
            return;
        }

        const metricsResponse = await fetch(`/api/measurements/metrics?field=${field}`);
        if (!metricsResponse.ok) {
            throw new Error(`HTTP error! Status: ${metricsResponse.status}`);
        }
        const metrics = await metricsResponse.json();
        console.log('Metrics from server:', metrics);

        document.getElementById('avg').textContent = metrics.avg.toFixed(2);
        document.getElementById('min').textContent = metrics.min.toFixed(2);
        document.getElementById('max').textContent = metrics.max.toFixed(2);
        document.getElementById('stdDev').textContent = metrics.stdDev.toFixed(2);

        if (chart) chart.destroy(); // Удаляем старый график, если он есть

        const labels = data.map((d) => new Date(d.timestamp));
        const values = data.map((d) => d[field]);

        console.log('Labels:', labels); 
        console.log('Values:', values); 

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: field,
                    data: values,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }],
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
                        },
                        title: {
                            display: true,
                            text: 'Time',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value',
                        },
                    },
                },
            },
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data.');
    }
});