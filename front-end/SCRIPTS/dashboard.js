/**
 * Dashboard Module
 * Handles dashboard-specific features, data generation, and interactions
 */

class DashboardManager {
    constructor() {
        this.data = null;
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
        kpiElements.forEach(el => {
            const kpiType = el.getAttribute('data-kpi');
            const value = this.data.kpis[kpiType];
            
            if (window.globalState.mode === 'authenticated') {
                if (kpiType === 'growth') {
                    el.textContent = typeof value === 'string' ? value : value.toFixed(1) + '%';
                } else if (kpiType === 'revenue') {
                    el.textContent = value.toLocaleString('fr-FR') + ' €';
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

        tbody.innerHTML = this.data.transactions.map(txn => {
            const statusColor = {
                'Complété': '#10b981',
                'En attente': '#f59e0b',
                'Échoué': '#ef4444'
            };

            const amount = window.globalState.mode === 'preview' ? 'XXX' : txn.amount.toLocaleString('fr-FR');

            return `
                <tr>
                    <td style="font-weight: 600;">${txn.id}</td>
                    <td>${txn.type}</td>
                    <td>${amount} €</td>
                    <td>${txn.date}</td>
                    <td>
                        <span style="
                            display: inline-block;
                            padding: 0.4rem 0.8rem;
                            border-radius: var(--radius);
                            background: ${statusColor[txn.status]}20;
                            color: ${statusColor[txn.status]};
                            font-size: 0.85rem;
                            font-weight: 600;
                        ">
                            ${txn.status}
                        </span>
                    </td>
                    <td>${txn.user}</td>
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

function handleSignIn(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    if (window.globalState) {
        window.globalState.setAuthenticated(true);
        document.getElementById('authModalOverlay').hidden = true;
        showToast('Connecté avec succès!', 'success');
        form.reset();
    }
}

function handleSignUp(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input');
    const email = inputs[1].value;
    const password = inputs[2].value;
    const confirmPassword = inputs[3].value;

    if (password !== confirmPassword) {
        showToast('Les mots de passe ne correspondent pas', 'error');
        return;
    }

    if (window.globalState) {
        window.globalState.setAuthenticated(true);
        document.getElementById('authModalOverlay').hidden = true;
        showToast('Compte créé avec succès!', 'success');
        form.reset();
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
