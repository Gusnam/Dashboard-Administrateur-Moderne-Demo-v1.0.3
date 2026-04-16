/* ---------------------------------------------------------------------------
   Authentication Manager
   --------------------------------------------------------------------------- */

// Initialize demo users on first load
function initializeDemoUsers() {
    if (!localStorage.getItem('dashboard-users')) {
        const demoUsers = [
            {
                id: 'user_1',
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 'user_2',
                name: 'Jean Dupont',
                email: 'jean@example.com',
                password: 'password123',
                role: 'user',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('dashboard-users', JSON.stringify(demoUsers));
    }
}

// Get current session
function getCurrentSession() {
    const session = localStorage.getItem('dashboard-session');
    return session ? JSON.parse(session) : null;
}

// Check if user is authenticated
function isAuthenticated() {
    return getCurrentSession() !== null;
}

// Logout user
function logout() {
    localStorage.removeItem('dashboard-session');
    window.location.href = 'signin.html';
}

// Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate password strength
function validatePasswordStrength(password) {
    return {
        length: password.length >= 6,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*]/.test(password)
    };
}

// Initialize demo users
window.addEventListener('DOMContentLoaded', initializeDemoUsers);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCurrentSession,
        isAuthenticated,
        logout,
        isValidEmail,
        validatePasswordStrength,
        initializeDemoUsers
    };
}
