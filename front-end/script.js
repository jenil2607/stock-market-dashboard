// Get references to the HTML elements we'll be interacting with
const companyListElement = document.getElementById('company-list');
const companyNameElement = document.getElementById('company-name');
const chartCanvas = document.getElementById('stock-chart');
let stockChart = null; // This variable will hold our chart instance

// The base URL of your backend API
const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Fetches the list of companies from the backend API.
 */
async function fetchCompanies() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/companies`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const companies = await response.json();
        renderCompanyList(companies);
        // Automatically load the first company's data
        if (companies.length > 0) {
            fetchStockData(companies[0].ticker, companies[0].name);
        }
    } catch (error) {
        console.error('Error fetching companies:', error);
        companyListElement.innerHTML = `<li>Error loading companies. Please ensure the backend is running.</li>`;
    }
}

/**
 * Renders the list of companies in the sidebar.
 * @param {Array} companies - An array of company objects {name, ticker}.
 */
function renderCompanyList(companies) {
    companyListElement.innerHTML = ''; // Clear any existing list items
    companies.forEach(company => {
        const listItem = document.createElement('li');
        listItem.textContent = company.name;
        listItem.dataset.ticker = company.ticker; // Store the ticker in a data attribute

        // Add a click event listener to fetch data for the clicked company
        listItem.addEventListener('click', () => {
            fetchStockData(company.ticker, company.name);

            // Update active class for styling
            document.querySelectorAll('#company-list li').forEach(li => li.classList.remove('active'));
            listItem.classList.add('active');
        });
        companyListElement.appendChild(listItem);
    });
    // Mark the first item as active initially
    if (companyListElement.firstChild) {
        companyListElement.firstChild.classList.add('active');
    }
}

/**
 * Fetches stock data for a specific company from the backend API.
 * @param {string} ticker - The stock ticker for the company (e.g., "AAPL").
 * @param {string} companyName - The full name of the company.
 */
async function fetchStockData(ticker, companyName) {
    try {
        companyNameElement.textContent = `Loading data for ${companyName}...`;
        const response = await fetch(`${API_BASE_URL}/api/stock-data/${ticker}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stockData = await response.json();
        companyNameElement.textContent = `${companyName} (${ticker}) Stock Price`;
        renderChart(stockData);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        companyNameElement.textContent = `Error loading data for ${companyName}.`;
        // Clear the chart if data fails to load
        if (stockChart) {
            stockChart.destroy();
            stockChart = null;
        }
    }
}

/**
 * Renders the stock data chart using Chart.js.
 * @param {Object} stockData - The stock data object from the API.
 */
function renderChart(stockData) {
    // If a chart instance already exists, destroy it before creating a new one
    if (stockChart) {
        stockChart.destroy();
    }

    const dates = stockData.data.map(item => item.date);
    const closePrices = stockData.data.map(item => item.close);

    const ctx = chartCanvas.getContext('2d');
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: `Closing Price (USD)`,
                data: closePrices,
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                borderWidth: 2,
                tension: 0.1, // Makes the line slightly curved
                pointRadius: 0, // Hides the points on the line
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10 // Show a reasonable number of date labels
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
        }
    });
}

// Fetch the initial list of companies when the page is fully loaded.
document.addEventListener('DOMContentLoaded', fetchCompanies);
