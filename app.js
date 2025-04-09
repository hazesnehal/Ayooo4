// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('token');
let currentUser = null;
let spendingChart = null;

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const dashboard = document.getElementById('dashboard');
const addTransactionForm = document.getElementById('add-transaction-form');
const addWalletForm = document.getElementById('add-wallet-form');
const fabButton = document.getElementById('fab-btn');
const addWalletButton = document.getElementById('add-wallet-btn');
const transactionList = document.getElementById('transactions-list');
const walletsGrid = document.getElementById('wallets-grid');
const logoutButton = document.getElementById('logout-btn');
const userAvatar = document.getElementById('user-avatar');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const addTransactionModal = document.getElementById('add-transaction-modal');
const addWalletModal = document.getElementById('add-wallet-modal');
const categoryFilter = document.getElementById('category-filter');
const timeFilter = document.getElementById('time-filter');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});
document.addEventListener('DOMContentLoaded', function() {
    // Your dashboard initialization code
});

// Check authentication status
function checkAuthStatus() {
    if (authToken) {
        document.body.classList.add('authenticated');
        loadDashboardData();
        loadUserProfile();
    } else {
        document.body.classList.remove('authenticated');
        showLoginModal();
    }
}

// Setup event listeners
function setupEventListeners() {
    if (fabButton) {
        fabButton.addEventListener('click', () => {
            addTransactionModal.classList.add('active');
        });
    }

    if (addWalletButton) {
        addWalletButton.addEventListener('click', () => {
            addWalletModal.classList.add('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', handleAddTransaction);
    }

    if (addWalletForm) {
        addWalletForm.addEventListener('submit', handleAddWallet);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.remove('active');
            registerModal.classList.add('active');
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.classList.remove('active');
            loginModal.classList.add('active');
        });
    }

    if (categoryFilter && timeFilter) {
        categoryFilter.addEventListener('change', loadTransactions);
        timeFilter.addEventListener('change', loadTransactions);
    }

    document.getElementById('transaction-date').valueAsDate = new Date();
}

// API Helper Functions
async function makeRequest(method, endpoint, data = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await axios({
            method,
            url: `${API_BASE_URL}${endpoint}`,
            data,
            headers
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response?.data?.message || error.message);
        showToast(error.response?.data?.message || 'An error occurred', 'error');
        throw error;
    }
}

// Dashboard Data Loading
async function loadDashboardData() {
    if (!authToken) return;

    try {
        document.querySelectorAll('.loading').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.content').forEach(el => el.style.display = 'none');

        const [transactions, wallets, summary] = await Promise.all([
            makeRequest('get', '/transactions'),
            makeRequest('get', '/wallets'),
            makeRequest('get', '/summary')
        ]);

        renderTransactions(transactions);
        renderWallets(wallets);
        updateSummaryCards(summary);
        renderSpendingChart(transactions);

        document.querySelectorAll('.loading').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.content').forEach(el => el.style.display = 'block');
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Load transactions with filters
async function loadTransactions() {
    try {
        transactionList.innerHTML = '';
        document.querySelector('#transactions-section .loading').style.display = 'block';
        document.querySelector('#transactions-section .content').style.display = 'none';

        const category = categoryFilter.value;
        const time = timeFilter.value;

        let url = '/transactions';
        const params = [];
        if (category) params.push(`category=${category}`);
        if (time) params.push(`time=${time}`);
        if (params.length) url += `?${params.join('&')}`;

        const transactions = await makeRequest('get', url);

        renderTransactions(transactions);
        document.querySelector('#transactions-section .loading').style.display = 'none';
        document.querySelector('#transactions-section .content').style.display = 'block';
    } catch (error) {
        console.error('Failed to load transactions:', error);
    }
}
