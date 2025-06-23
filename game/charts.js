console.log("charts.js loaded");

let creditsChartInstance = null;
let winPercentageChartInstance = null;
let roundCount = 0;  // Tracks rounds (each hand counts as one round)

// Update (or initialize) charts with new credits and win percentage values
export function updateCharts(credits, winPercentage) {
    const creditsCtx = document.getElementById('credits-chart').getContext('2d');
    const winCtx = document.getElementById('win-percentage-chart').getContext('2d');

    roundCount += 1;  // Each call counts as a separate game

    if (!creditsChartInstance || !winPercentageChartInstance) {
        // Initialize charts

        const creditsData = {
            labels: [`Game ${roundCount}`],
            datasets: [{
                label: 'Credits Over Time',
                data: [credits],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        };

        creditsChartInstance = new Chart(creditsCtx, {
            type: 'line',
            data: creditsData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                }
            }
        });

        const winData = {
            labels: [`Game ${roundCount}`],
            datasets: [{
                label: 'Win Percentage Over Time',
                data: [winPercentage],
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                fill: false
            }]
        };

        winPercentageChartInstance = new Chart(winCtx, {
            type: 'line',
            data: winData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { beginAtZero: true },
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

    } else {
        // Update charts with new values

        creditsChartInstance.data.labels.push(`Game ${roundCount}`);
        creditsChartInstance.data.datasets[0].data.push(credits);
        creditsChartInstance.update();

        winPercentageChartInstance.data.labels.push(`Game ${roundCount}`);
        winPercentageChartInstance.data.datasets[0].data.push(winPercentage);
        winPercentageChartInstance.update();
    }
}

// Initializes charts with dummy zero values to prepare layout
export function initializeCharts() {
    console.log("initializeCharts called");
    updateCharts(0, 0);
}
