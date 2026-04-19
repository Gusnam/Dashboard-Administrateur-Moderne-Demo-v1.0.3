const API_BASE_URL = getApiBaseUrl();

function getApiBaseUrl() {
    if (window.API_BASE_URL && typeof window.API_BASE_URL === 'string') {
        return window.API_BASE_URL;
    }

    return 'http://localhost:5000';
}

function getStoredSession() {
    try {
        return JSON.parse(localStorage.getItem('dashboard-session') || 'null');
    } catch {
        return null;
    }
}

function getAuthToken() {
    const session = getStoredSession();
    return session?.token || null;
}

function saveSession(session) {
    const userSession = {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        token: session.token,
    };
    localStorage.setItem('dashboard-session', JSON.stringify(userSession));
    document.dispatchEvent(new Event('dashboard:auth-changed'));
}

function clearSession() {
    localStorage.removeItem('dashboard-session');
    document.dispatchEvent(new Event('dashboard:auth-changed'));
}

function isLoggedIn() {
    return !!getAuthToken();
}

function logout(redirectTo = 'signin.html') {
    clearSession();
    window.location.href = redirectTo;
}

async function apiRequest(path, options = {}) {
    const { method = 'GET', body, authenticated = false } = options;
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    if (authenticated) {
        const token = getAuthToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue.');
    }
    return data;
}

async function authLogin(email, password) {
    return apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
    });
}

async function authRegister(name, email, password) {
    return apiRequest('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
    });
}

async function authResetPassword(email, password) {
    return apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: { email, password },
    });
}

async function fetchCurrentUser() {
    return apiRequest('/api/auth/me', { authenticated: true });
}

async function updateProfile(updates) {
    return apiRequest('/api/users/profile', {
        method: 'PUT',
        authenticated: true,
        body: updates,
    });
}

async function fetchUsers() {
    return apiRequest('/api/users', { authenticated: true });
}

async function fetchDashboardStats() {
    return apiRequest('/api/stats', { authenticated: true });
}

async function fetchTransactions() {
    return apiRequest('/api/transactions', { authenticated: true });
}

async function createTransaction(transaction) {
    return apiRequest('/api/transactions', {
        method: 'POST',
        authenticated: true,
        body: transaction,
    });
}

window.auth = {
    getApiBaseUrl,
    getStoredSession,
    getAuthToken,
    isLoggedIn,
    saveSession,
    clearSession,
    logout,
    authLogin,
    authRegister,
    authResetPassword,
    fetchCurrentUser,
    updateProfile,
    fetchUsers,
    fetchDashboardStats,
    fetchTransactions,
    createTransaction,
};
