// Sports Arbitrage System - Frontend JavaScript

// Global variables
let apiUrl = localStorage.getItem('apiUrl') || 'https://example.com/api';
let opportunities = [];
let sports = [];
let bookmakers = [];
let betTypes = [];
let currentFilters = {
    min_profit: null,
    max_profit: null,
    sport: '',
    bookmaker: '',
    bet_type: ''
};

// Document ready function
$(document).ready(function() {
    // Initialize the application
    init();
    
    // Setup event listeners
    setupEventListeners();
});

// Initialize the application
function init() {
    // Load API URL from localStorage
    $('#api-url').val(apiUrl);
    
    // Check API connection
    checkApiConnection();
    
    // Load data from API
    loadData();
    
    // Apply filters from URL if any
    applyFiltersFromUrl();
}

// Setup event listeners
function setupEventListeners() {
    // API settings form submission
    $('#api-settings-form').on('submit', function(e) {
        e.preventDefault();
        saveApiSettings();
    });
    
    // Refresh data button
    $('#refresh-data').on('click', function() {
        loadData();
    });
    
    // Filter form submission
    $('#filter-form').on('submit', function(e) {
        e.preventDefault();
        applyFilters();
    });
}

// Save API settings
function saveApiSettings() {
    const newApiUrl = $('#api-url').val().trim();
    if (newApiUrl) {
        apiUrl = newApiUrl;
        localStorage.setItem('apiUrl', apiUrl);
        showFlashMessage('API URL updated successfully', 'success');
        checkApiConnection();
        loadData();
    } else {
        showFlashMessage('Please enter a valid API URL', 'danger');
    }
}

// Check API connection
function checkApiConnection() {
    updateApiStatus('checking');
    
    fetch(`${apiUrl}/health-check`)
        .then(response => {
            if (!response.ok) throw new Error('API not reachable');
            return response.json();
        })
        .then(data => {
            updateApiStatus('connected');
        })
        .catch(err => {
            updateApiStatus('disconnected');
            console.error('API connection error:', err);
        });
}

// Update API status indicators
function updateApiStatus(status) {
    const statusBadge = $('#api-status-badge');
    
    switch(status) {
        case 'connected':
            statusBadge.removeClass('bg-warning bg-danger').addClass('bg-success');
            statusBadge.text('Connected');
            break;
        case 'disconnected':
            statusBadge.removeClass('bg-warning bg-success').addClass('bg-danger');
            statusBadge.text('Disconnected');
            break;
        case 'checking':
            statusBadge.removeClass('bg-success bg-danger').addClass('bg-warning');
            statusBadge.text('Checking...');
            break;
    }
}

// Load data from API
function loadData() {
    showLoading(true);
    
    // Get opportunities from the API
    fetch(`${apiUrl}/opportunities`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch opportunities');
            return response.json();
        })
        .then(data => {
            opportunities = data;
            updateLastUpdated();
            
            // Extract filter options
            extractFilterOptions();
            
            // Populate filter dropdowns
            populateFilterDropdowns();
            
            // Apply current filters
            displayOpportunities(filterOpportunities());
        })
        .catch(err => {
            console.error('Error fetching opportunities:', err);
            showFlashMessage('Failed to fetch opportunities from API', 'danger');
        })
        .finally(() => {
            showLoading(false);
        });
}

// Extract unique values for filter dropdowns
function extractFilterOptions() {
    const sportSet = new Set();
    const bookmakerSet = new Set();
    const betTypeSet = new Set();
    
    opportunities.forEach(opp => {
        if (opp.sport) sportSet.add(opp.sport);
        if (opp.bookmaker1) bookmakerSet.add(opp.bookmaker1);
        if (opp.bookmaker2) bookmakerSet.add(opp.bookmaker2);
        if (opp.bet_type) betTypeSet.add(opp.bet_type);
    });
    
    sports = Array.from(sportSet).sort();
    bookmakers = Array.from(bookmakerSet).sort();
    betTypes = Array.from(betTypeSet).sort();
}

// Populate filter dropdown options
function populateFilterDropdowns() {
    // Populate sports dropdown
    const sportDropdown = $('#sport');
    sportDropdown.find('option:not(:first)').remove();
    sports.forEach(sport => {
        sportDropdown.append(`<option value="${sport}" ${currentFilters.sport === sport ? 'selected' : ''}>${sport}</option>`);
    });
    
    // Populate bookmakers dropdown
    const bookmakerDropdown = $('#bookmaker');
    bookmakerDropdown.find('option:not(:first)').remove();
    bookmakers.forEach(bookmaker => {
        bookmakerDropdown.append(`<option value="${bookmaker}" ${currentFilters.bookmaker === bookmaker ? 'selected' : ''}>${bookmaker}</option>`);
    });
    
    // Populate bet types dropdown
    const betTypeDropdown = $('#bet_type');
    betTypeDropdown.find('option:not(:first)').remove();
    betTypes.forEach(betType => {
        betTypeDropdown.append(`<option value="${betType}" ${currentFilters.bet_type === betType ? 'selected' : ''}>${betType}</option>`);
    });
}

// Filter opportunities based on current filter settings
function filterOpportunities() {
    return opportunities.filter(opp => {
        // Filter by min profit if set
        if (currentFilters.min_profit !== null && opp.profit_margin < currentFilters.min_profit) {
            return false;
        }
        
        // Filter by max profit if set
        if (currentFilters.max_profit !== null && opp.profit_margin > currentFilters.max_profit) {
            return false;
        }
        
        // Filter by sport if set
        if (currentFilters.sport && opp.sport !== currentFilters.sport) {
            return false;
        }
        
        // Filter by bookmaker if set
        if (currentFilters.bookmaker && opp.bookmaker1 !== currentFilters.bookmaker && opp.bookmaker2 !== currentFilters.bookmaker) {
            return false;
        }
        
        // Filter by bet type if set
        if (currentFilters.bet_type && opp.bet_type !== currentFilters.bet_type) {
            return false;
        }
        
        return true;
    });
}

// Apply filters from form
function applyFilters() {
    // Get filter values from form
    const minProfit = $('#min_profit').val() ? parseFloat($('#min_profit').val()) : null;
    const maxProfit = $('#max_profit').val() ? parseFloat($('#max_profit').val()) : null;
    const sport = $('#sport').val();
    const bookmaker = $('#bookmaker').val();
    const betType = $('#bet_type').val();
    
    // Update current filters
    currentFilters = {
        min_profit: minProfit,
        max_profit: maxProfit,
        sport: sport,
        bookmaker: bookmaker,
        bet_type: betType
    };
    
    // Apply filters
    const filteredOpportunities = filterOpportunities();
    
    // Update URL with filters
    updateUrlWithFilters();
    
    // Display filtered opportunities
    displayOpportunities(filteredOpportunities);
}

// Apply filters from URL parameters
function applyFiltersFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get filter values from URL parameters
    const minProfit = urlParams.get('min_profit') ? parseFloat(urlParams.get('min_profit')) : null;
    const maxProfit = urlParams.get('max_profit') ? parseFloat(urlParams.get('max_profit')) : null;
    const sport = urlParams.get('sport') || '';
    const bookmaker = urlParams.get('bookmaker') || '';
    const betType = urlParams.get('bet_type') || '';
    
    // Update form values
    $('#min_profit').val(minProfit);
    $('#max_profit').val(maxProfit);
    
    // Store current filters
    currentFilters = {
        min_profit: minProfit,
        max_profit: maxProfit,
        sport: sport,
        bookmaker: bookmaker,
        bet_type: betType
    };
}

// Update URL with current filters
function updateUrlWithFilters() {
    const urlParams = new URLSearchParams();
    
    // Add filter parameters to URL if they exist
    if (currentFilters.min_profit !== null) urlParams.set('min_profit', currentFilters.min_profit);
    if (currentFilters.max_profit !== null) urlParams.set('max_profit', currentFilters.max_profit);
    if (currentFilters.sport) urlParams.set('sport', currentFilters.sport);
    if (currentFilters.bookmaker) urlParams.set('bookmaker', currentFilters.bookmaker);
    if (currentFilters.bet_type) urlParams.set('bet_type', currentFilters.bet_type);
    
    // Update URL without refreshing the page
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    history.pushState({}, '', newUrl);
}

// Display opportunities in the UI
function displayOpportunities(filteredOpportunities) {
    const container = $('#opportunities-container');
    const noOpportunitiesMsg = $('#no-opportunities-message');
    const opportunityCount = $('#opportunity-count');
    
    // Clear existing content
    container.empty();
    
    // Update opportunity count
    opportunityCount.text(`(${filteredOpportunities.length} found)`);
    
    // Show message if no opportunities
    if (filteredOpportunities.length === 0) {
        noOpportunitiesMsg.removeClass('hidden');
        return;
    }
    
    // Hide no opportunities message
    noOpportunitiesMsg.addClass('hidden');
    
    // Add each opportunity to the container
    filteredOpportunities.forEach(opp => {
        // Calculate bet amounts
        const betAmounts = calculateBetAmounts(opp, 1000);
        
        // Determine profit color class
        let profitColorClass = '';
        if (opp.profit_margin > 3) {
            profitColorClass = 'profit-high';
        } else if (opp.profit_margin > 1) {
            profitColorClass = 'profit-medium';
        } else {
            profitColorClass = 'profit-low';
        }
        
        // Create opportunity card
        const card = `
            <div class="col-md-6">
                <div class="card opportunity-card">
                    <div class="card-header">
                        <h5>
                            ${opp.sport} - ${opp.bet_type}
                            <span class="float-end ${profitColorClass}">
                                ${opp.profit_margin.toFixed(2)}%
                            </span>
                        </h5>
                    </div>
                    <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted">${opp.team1}</h6>
                        <p class="card-text">
                            <strong>${opp.bookmaker1}</strong>: ${opp.bet1} @ <strong>${opp.odds1}</strong><br>
                            <strong>${opp.bookmaker2}</strong>: ${opp.bet2} @ <strong>${opp.odds2}</strong>
                        </p>
                        
                        <p class="card-text">
                            <small>
                                Stake: $1000<br>
                                Bet 1: $${betAmounts.bet1.toFixed(2)} @ ${opp.odds1}<br>
                                Bet 2: $${betAmounts.bet2.toFixed(2)} @ ${opp.odds2}<br>
                                Expected Return: $${betAmounts.expectedReturn.toFixed(2)}<br>
                                Profit: $${betAmounts.profit.toFixed(2)} (${betAmounts.roi.toFixed(2)}%)
                            </small>
                        </p>
                        
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-primary view-details" data-opp-id="${opp.id}">View Details</button>
                            <div>
                                ${opp.bookmaker1_link ? `<a href="${opp.bookmaker1_link}" target="_blank" class="btn btn-sm btn-outline-secondary me-2">${opp.bookmaker1}</a>` : ''}
                                ${opp.bookmaker2_link ? `<a href="${opp.bookmaker2_link}" target="_blank" class="btn btn-sm btn-outline-secondary">${opp.bookmaker2}</a>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.append(card);
    });
    
    // Setup view details buttons
    $('.view-details').on('click', function() {
        const oppId = $(this).data('opp-id');
        showOpportunityDetails(oppId);
    });
}

// Show opportunity details in modal
function showOpportunityDetails(opportunityId) {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    
    if (!opportunity) {
        console.error('Opportunity not found:', opportunityId);
        return;
    }
    
    // Calculate bet amounts for different stake levels
    const stakeAmounts = [100, 500, 1000, 5000, 10000];
    const betCalculations = {};
    
    stakeAmounts.forEach(stake => {
        betCalculations[stake] = calculateBetAmounts(opportunity, stake);
    });
    
    // Create modal content
    const modalContent = `
        <div class="opportunity-detail">
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <h3 class="mb-0">
                        ${opportunity.sport} - ${opportunity.bet_type}
                        <span class="float-end ${opportunity.profit_margin > 3 ? 'text-success' : (opportunity.profit_margin > 1 ? 'text-info' : 'text-warning')}">
                            ${opportunity.profit_margin.toFixed(2)}% Profit
                        </span>
                    </h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h4>Event Details</h4>
                            <table class="table">
                                <tr>
                                    <th>Event:</th>
                                    <td>${opportunity.team1}</td>
                                </tr>
                                <tr>
                                    <th>Sport:</th>
                                    <td>${opportunity.sport}</td>
                                </tr>
                                <tr>
                                    <th>League:</th>
                                    <td>${opportunity.league || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Market:</th>
                                    <td>${opportunity.market || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Bet Type:</th>
                                    <td>${opportunity.bet_type}</td>
                                </tr>
                                ${opportunity.total_line && opportunity.total_line !== 'N/A' ? 
                                    `<tr>
                                        <th>Total Line:</th>
                                        <td>${opportunity.total_line}</td>
                                    </tr>` : ''}
                                <tr>
                                    <th>Last Updated:</th>
                                    <td>${opportunity.timestamp || 'N/A'}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h4>Bookmaker Information</h4>
                            <div class="card mb-3">
                                <div class="card-header bg-light">
                                    <h5>${opportunity.bookmaker1}</h5>
                                </div>
                                <div class="card-body">
                                    <p><strong>Bet:</strong> ${opportunity.bet1}</p>
                                    <p><strong>Odds:</strong> ${opportunity.odds1}</p>
                                    ${opportunity.bookmaker1_link && opportunity.bookmaker1_link !== 'N/A' ? 
                                        `<a href="${opportunity.bookmaker1_link}" target="_blank" class="btn btn-outline-primary">Place Bet</a>` : ''}
                                </div>
                            </div>
                            
                            <div class="card">
                                <div class="card-header bg-light">
                                    <h5>${opportunity.bookmaker2}</h5>
                                </div>
                                <div class="card-body">
                                    <p><strong>Bet:</strong> ${opportunity.bet2}</p>
                                    <p><strong>Odds:</strong> ${opportunity.odds2}</p>
                                    ${opportunity.bookmaker2_link && opportunity.bookmaker2_link !== 'N/A' ? 
                                        `<a href="${opportunity.bookmaker2_link}" target="_blank" class="btn btn-outline-primary">Place Bet</a>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header bg-light">
                    <h4>Bet Calculation</h4>
                </div>
                <div class="card-body">
                    <p class="lead">Use this table to determine how much to bet on each outcome based on your total stake:</p>
                    
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Total Stake ($)</th>
                                <th>Bet on ${opportunity.bookmaker1} ($)</th>
                                <th>Bet on ${opportunity.bookmaker2} ($)</th>
                                <th>Expected Return ($)</th>
                                <th>Profit ($)</th>
                                <th>ROI (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stakeAmounts.map(stake => `
                                <tr>
                                    <td>$${stake}</td>
                                    <td>$${betCalculations[stake].bet1.toFixed(2)}</td>
                                    <td>$${betCalculations[stake].bet2.toFixed(2)}</td>
                                    <td>$${betCalculations[stake].expectedReturn.toFixed(2)}</td>
                                    <td>$${betCalculations[stake].profit.toFixed(2)}</td>
                                    <td>${betCalculations[stake].roi.toFixed(2)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="alert alert-info">
                        <h5 class="alert-heading">How to Use This Table</h5>
                        <p>1. Decide on your total stake amount (how much you want to invest in this arbitrage opportunity)</p>
                        <p>2. Bet the corresponding amounts on each outcome at the respective bookmakers</p>
                        <p>3. No matter which outcome occurs, you'll earn the same profit</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set modal content and show modal
    $('#opportunity-detail-content').html(modalContent);
    const modal = new bootstrap.Modal(document.getElementById('opportunityDetailModal'));
    modal.show();
}

// Calculate bet amounts for arbitrage opportunities
function calculateBetAmounts(opportunity, totalStake) {
    const odds1 = opportunity.odds1;
    const odds2 = opportunity.odds2;
    
    // Calculate implied probabilities
    const prob1 = 1 / odds1;
    const prob2 = 1 / odds2;
    const totalProb = prob1 + prob2;
    
    // Calculate bet amounts
    const bet1 = (prob1 / totalProb) * totalStake;
    const bet2 = (prob2 / totalProb) * totalStake;
    
    // Calculate expected return
    const expectedReturn = bet1 * odds1;  // or bet2 * odds2, they should be the same
    const profit = expectedReturn - totalStake;
    const roi = (profit / totalStake) * 100;
    
    return {
        bet1: bet1,
        bet2: bet2,
        expectedReturn: expectedReturn,
        profit: profit,
        roi: roi
    };
}

// Show/hide loading indicator
function showLoading(isLoading) {
    if (isLoading) {
        const loadingSpinner = `
            <div class="spinner-container">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        $('#opportunities-container').html(loadingSpinner);
        $('#no-opportunities-message').addClass('hidden');
    }
}

// Show flash message
function showFlashMessage(message, type) {
    const flashContainer = $('#flash-messages');
    const alertId = 'flash-' + Date.now();
    
    const alert = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    flashContainer.append(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        $(`#${alertId}`).alert('close');
    }, 5000);
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    $('#last-updated').text(`Last updated: ${now.toLocaleString()}`);
}

// Auto-refresh data every 60 seconds
setInterval(loadData, 60000);