const API_BASE_URL = getApiBaseUrl();

function getApiBaseUrl() {
    if (window.location.protocol.startsWith('http')) {
        return `${window.location.protocol}//${window.location.host}`;
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
    localStorage.setItem('dashboard-session', JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem('dashboard-session');
}

async function apiRequest(path, options = {}) {
    const { method = 'GET', body, authenticated = false } = options;
    const headers = { 'Content-Type': 'application/json' };

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

window.auth = {
    getApiBaseUrl,
    getStoredSession,
    getAuthToken,
    saveSession,
    clearSession,
    authLogin,
    authRegister,
    authResetPassword,
    fetchCurrentUser,
    updateProfile,
    fetchUsers,
    fetchDashboardStats,
    fetchTransactions,
};
