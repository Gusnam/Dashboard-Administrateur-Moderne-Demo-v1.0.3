/**
 * Dashboard Module
 * Handles dashboard-specific features, data generation, and interactions
 */

class DashboardManager {
    constructor() {
        this.data = null;
        this.user = null;
        this.stats = null;
        this.transactions = null;
        this.isAnimating = false;
        this.stateChangeUnsubscribe = null;
        this.init();
    }

    init() {
        this.generateData();
        this.render();
        this.setupEventListeners();
        this.subscribeToStateChanges();
        this.loadThemeIcons();

        if (window.globalState?.mode === 'authenticated') {
            this.loadAuthenticatedData();
        }
    }

    generateData() {
        this.data = {
            kpis: DataGenerator.generateKPIs(),
            users: DataGenerator.generateUsers(10),
            transactions: DataGenerator.generateTransactions(8),
            activities: DataGenerator.generateActivityFeed(5),
            chartData: DataGenerator.generateChartData()
        };
    }

    render() {
        this.renderKPIs();
        this.renderActivityFeed();
        this.renderChart();
        this.renderTransactions();
    }

    renderKPIs() {
        const kpiElements = document.querySelectorAll('[data-kpi]');
        const stats = window.globalState.mode === 'authenticated' ? this.stats : null;

        kpiElements.forEach(el => {
            const kpiType = el.getAttribute('data-kpi');
            let value = this.data.kpis[kpiType];

            if (stats) {
                if (kpiType === 'users') {
                    value = stats.usersCount;
                } else if (kpiType === 'revenue') {
                    value = stats.revenue;
                } else if (kpiType === 'transactions') {
                    value = stats.transactionCount;
                } else if (kpiType === 'growth') {
                    value = stats.growth;
                }
            }

            if (window.globalState.mode === 'authenticated') {
                if (kpiType === 'growth') {
                    el.textContent = typeof value === 'string' ? value : `${value.toFixed(1)}%`;
                } else if (kpiType === 'revenue') {
                    el.textContent = `${value.toLocaleString('fr-FR')} €`;
                } else {
                    el.textContent = value.toLocaleString('fr-FR');
                }
            } else {
                el.textContent = 'XXX' + (kpiType === 'revenue' ? ' €' : kpiType === 'growth' ? '%' : '');
            }
        });
    }

    renderActivityFeed() {
        const feedContainer = document.getElementById('activityFeed');
        if (!feedContainer) return;

        feedContainer.innerHTML = this.data.activities.map(activity => `
            <div style="
                display: flex;
                gap: 0.8rem;
                padding: 0.8rem;
                border-radius: var(--radius);
                background: var(--bg-tertiary);
                transition: all var(--transition);
            ">
                <div style="
                    font-size: 1.5rem;
                    flex-shrink: 0;
                ">
                    ${activity.icon}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <p style="margin: 0; font-weight: 500; font-size: 0.95rem;">
                        ${activity.action}
                    </p>
                    <p style="
                        margin: 0.25rem 0 0;
                        font-size: 0.8rem;
                        color: var(--text-muted);
                    ">
                        ${activity.user} • ${activity.timestamp}
                    </p>
                </div>
            </div>
        `).join('');
    }

    renderChart() {
        const chartContainer = document.getElementById('chartBars');
        if (!chartContainer) return;

        const labels = this.data.chartData.labels;
        const values = this.data.chartData.datasets[0].data;
        const maxValue = Math.max(...values);

        chartContainer.innerHTML = labels.map((label, i) => {
            const heightPercent = (values[i] / maxValue) * 100;
            const displayValue = window.globalState.mode === 'preview' ? 'XXX' : values[i].toLocaleString('fr-FR');
            
            return `
                <div style="
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.8rem;
                    cursor: pointer;
                    transition: all var(--transition);
                " class="chart-bar" data-month="${label}" data-value="${values[i]}">
                    <div style="
                        width: 100%;
                        height: ${heightPercent}%;
                        background: linear-gradient(135deg, var(--primary), var(--primary-light));
                        border-radius: var(--radius) var(--radius) 0 0;
                        min-height: 40px;
                        transition: all var(--transition);
                        position: relative;
                    " class="bar-fill">
                        <div class="bar-tooltip" style="
                            position: absolute;
                            bottom: 100%;
                            left: 50%;
                            transform: translateX(-50%);
                            background: var(--text);
                            color: var(--bg);
                            padding: 0.5rem 0.8rem;
                            border-radius: var(--radius);
                            white-space: nowrap;
                            font-size: 0.8rem;
                            font-weight: 600;
                            opacity: 0;
                            pointer-events: none;
                            transition: opacity var(--transition);
                            margin-bottom: 0.5rem;
                        ">
                            ${displayValue}
                        </div>
                    </div>
                    <p style="
                        margin: 0;
                        font-size: 0.85rem;
                        font-weight: 500;
                        color: var(--text);
                    ">
                        ${label}
                    </p>
                </div>
            `;
        }).join('');

        // Add hover listeners
        document.querySelectorAll('.chart-bar').forEach(bar => {
            bar.addEventListener('mouseenter', () => {
                const tooltip = bar.querySelector('.bar-tooltip');
                const barFill = bar.querySelector('.bar-fill');
                if (tooltip) tooltip.style.opacity = '1';
                if (barFill) {
                    barFill.style.filter = 'brightness(1.1)';
                    barFill.style.transform = 'scaleY(1.05)';
                }
            });

            bar.addEventListener('mouseleave', () => {
                const tooltip = bar.querySelector('.bar-tooltip');
                const barFill = bar.querySelector('.bar-fill');
                if (tooltip) tooltip.style.opacity = '0';
                if (barFill) {
                    barFill.style.filter = 'brightness(1)';
                    barFill.style.transform = 'scaleY(1)';
                }
            });
        });
    }

    renderTransactions() {
        const tbody = document.getElementById('transactionsList');
        if (!tbody) return;

        const transactions = window.globalState.mode === 'authenticated' && Array.isArray(this.transactions)
            ? this.transactions
            : this.data.transactions;

        tbody.innerHTML = transactions.map(txn => {
            const statusColor = {
                'Complété': '#10b981',
                'En attente': '#f59e0b',
                'Échoué': '#ef4444',
                'completed': '#10b981',
                'pending': '#f59e0b',
                'failed': '#ef4444'
            };

            const amount = window.globalState.mode === 'preview' ? 'XXX' : Number(txn.amount).toLocaleString('fr-FR');
            const statusKey = txn.status || 'En attente';
            const color = statusColor[statusKey] || '#6b7280';
            const statusLabel = typeof txn.status === 'string' ? txn.status : 'En attente';
            const userLabel = txn.user || txn.email || 'Utilisateur';

            return `
                <tr>
                    <td style="font-weight: 600;">${txn.id}</td>
                    <td>${txn.type || 'Paiement'}</td>
                    <td>${amount} €</td>
                    <td>${txn.date || '-'}</td>
                    <td>
                        <span style="
                            display: inline-block;
                            padding: 0.4rem 0.8rem;
                            border-radius: var(--radius);
                            background: ${color}20;
                            color: ${color};
                            font-size: 0.85rem;
                            font-weight: 600;
                        ">
                            ${statusLabel}
                        </span>
                    </td>
                    <td>${userLabel}</td>
                </tr>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                window.globalState.isDarkMode = !window.globalState.isDarkMode;
                localStorage.setItem(CONFIG.STORAGE_KEYS.DARK_MODE, window.globalState.isDarkMode);
                this.loadThemeIcons();
                document.body.classList.toggle('dark');
            });
        }

        // Profile avatar click
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar) {
            profileAvatar.addEventListener('click', () => {
                showToast('Redirection vers les paramètres...', 'info');
                setTimeout(() => {
                    // Navigation would happen here
                }, 500);
            });
        }
    }

    loadThemeIcons() {
        const sunIcon = document.querySelector('.theme-icon-sun');
        const moonIcon = document.querySelector('.theme-icon-moon');
        
        if (window.globalState.isDarkMode) {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        } else {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        }
    }

    async loadAuthenticatedData() {
        try {
            this.user = await auth.fetchCurrentUser();
            this.stats = await auth.fetchDashboardStats();
            const transactionPayload = await auth.fetchTransactions();
            this.transactions = transactionPayload.data || [];

            const avatarText = document.getElementById('avatarText');
            if (avatarText && this.user?.name) {
                avatarText.textContent = this.user.name.split(' ').map(part => part[0]).join('').substring(0, 2).toUpperCase();
            }

            this.render();
        } catch (error) {
            console.error('Unable to load authenticated dashboard data:', error);
            if (typeof showToast === 'function') {
                showToast(error.message || 'Impossible de charger les données du tableau de bord.', 'error');
            }
        }
    }

    subscribeToStateChanges() {
        this.stateChangeUnsubscribe = window.globalState.subscribe((state) => {
            if (state.mode === 'authenticated') {
                this.animateDataReveal();
            } else {
                this.render();
            }
        });
    }

    animateDataReveal() {
        const kpiElements = document.querySelectorAll('[data-kpi]');
        kpiElements.forEach((el, index) => {
            setTimeout(() => {
                const kpiType = el.getAttribute('data-kpi');
                const value = this.data.kpis[kpiType];
                let displayValue;

                if (kpiType === 'growth') {
                    displayValue = typeof value === 'string' ? value : value.toFixed(1) + '%';
                } else if (kpiType === 'revenue') {
                    displayValue = value.toLocaleString('fr-FR') + ' €';
                } else {
                    displayValue = value.toLocaleString('fr-FR');
                }

                el.style.opacity = '0.5';
                AnimationUtils.animateNumber(el, parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0);
                
                setTimeout(() => {
                    el.textContent = displayValue;
                    el.style.opacity = '1';
                    el.style.transition = 'opacity var(--transition)';
                }, 100);
            }, index * 100);
        });

        // Re-render other content
        setTimeout(() => {
            this.renderActivityFeed();
            this.renderChart();
            this.renderTransactions();
        }, 400);
    }

    destroy() {
        if (this.stateChangeUnsubscribe) {
            this.stateChangeUnsubscribe();
        }
    }
}

// Auth form handling
function openAuthModal(mode) {
    const modal = document.getElementById('authModalOverlay');
    if (!modal) return;

    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const authModalTitle = document.getElementById('authModalTitle');

    if (mode === 'signin') {
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
        authModalTitle.textContent = 'Se connecter';
        document.getElementById('authToggleText').textContent = "Pas de compte? S'inscrire";
    } else if (mode === 'signup') {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
        authModalTitle.textContent = 'Créer un compte';
        document.getElementById('authToggleText').textContent = 'Déjà un compte? Se connecter';
    }

    modal.hidden = false;
}

function toggleAuthForm() {
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');

    if (signinForm.style.display === 'none') {
        openAuthModal('signin');
    } else {
        openAuthModal('signup');
    }
}

async function handleSignIn(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;

    if (!email || !password) {
        showToast('Veuillez saisir votre email et votre mot de passe.', 'warning');
        return;
    }

    try {
        const user = await auth.authLogin(email, password);
        auth.saveSession(user);
        if (window.globalState) {
            window.globalState.setAuthenticated(true);
        }
        document.getElementById('authModalOverlay').hidden = true;
        showToast('Connecté avec succès!', 'success');
        form.reset();
        if (window.dashboard) {
            window.dashboard.loadAuthenticatedData?.();
        }
    } catch (error) {
        showToast(error.message || 'Échec de la connexion. Vérifiez vos informations.', 'error');
    }
}

async function handleSignUp(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;

    if (!name || !email || !password || !confirmPassword) {
        showToast('Veuillez remplir tous les champs.', 'warning');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Les mots de passe ne correspondent pas', 'error');
        return;
    }

    try {
        const user = await auth.authRegister(name, email, password);
        auth.saveSession(user);
        if (window.globalState) {
            window.globalState.setAuthenticated(true);
        }
        document.getElementById('authModalOverlay').hidden = true;
        showToast('Compte créé avec succès!', 'success');
        form.reset();
        if (window.dashboard) {
            window.dashboard.loadAuthenticatedData?.();
        }
    } catch (error) {
        showToast(error.message || 'Échec de l’inscription. Réessayez.', 'error');
    }
}

// Initialize dashboard when DOM is ready
let dashboard;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dashboard = new DashboardManager();
    });
} else {
    dashboard = new DashboardManager();
}
