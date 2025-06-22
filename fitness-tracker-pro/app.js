// Fitness Progress Tracker Application
class FitnessTracker {
    constructor() {
        this.currentPage = 'dashboard';
        this.data = this.loadData();
        this.charts = {};
        this.isOnline = navigator.onLine;
        this.syncPending = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateConnectionStatus();
        this.renderDashboard();
        this.renderHistory();
        this.initializeCharts();
        this.setTodaysDate();
        this.loadSettings();
        
        // Update connection status periodically
        setInterval(() => this.updateConnectionStatus(), 5000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Quick actions
        document.querySelector('.quick-entry-btn').addEventListener('click', () => {
            this.navigateToPage('entry');
        });

        document.querySelector('.sync-btn').addEventListener('click', () => {
            this.syncWithGoogleSheets();
        });

        // Form submission
        document.getElementById('entryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEntry();
        });

        document.querySelector('.clear-form-btn').addEventListener('click', () => {
            this.clearForm();
        });

        // Settings
        document.querySelector('.connect-sheets-btn').addEventListener('click', () => {
            this.connectGoogleSheets();
        });

        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        document.getElementById('autoSync').addEventListener('change', (e) => {
            this.setSetting('autoSync', e.target.checked);
        });

        // Data management
        document.querySelector('.export-data-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.querySelector('.clear-data-btn').addEventListener('click', () => {
            this.clearAllData();
        });

        // History search and filter
        document.getElementById('historySearch').addEventListener('input', (e) => {
            this.filterHistory(e.target.value);
        });

        document.getElementById('phaseFilter').addEventListener('change', (e) => {
            this.filterHistoryByPhase(e.target.value);
        });

        // Online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus();
            if (this.getSetting('autoSync', false)) {
                this.syncWithGoogleSheets();
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus();
        });
    }

    navigateToPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(page).classList.add('active');

        this.currentPage = page;

        // Refresh page-specific content
        if (page === 'dashboard') {
            this.renderDashboard();
        } else if (page === 'progress') {
            this.updateCharts();
        } else if (page === 'history') {
            this.renderHistory();
        }
    }

    loadData() {
        const stored = localStorage.getItem('fitnessData');
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            entries: [],
            settings: {
                theme: 'auto',
                autoSync: false,
                googleSheetsConnected: false,
                sheetUrl: '',
                lastSync: null
            }
        };
    }

    saveData() {
        localStorage.setItem('fitnessData', JSON.stringify(this.data));
        this.syncPending = true;
        this.updateSyncStatus();
    }

    setTodaysDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('entryDate').value = today;
    }

    saveEntry() {
        this.showLoading();

        const entry = {
            date: document.getElementById('entryDate').value,
            weight: document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null,
            waist: document.getElementById('waist').value ? parseFloat(document.getElementById('waist').value) : null,
            calories: document.getElementById('calories').value ? parseInt(document.getElementById('calories').value) : null,
            protein: document.getElementById('protein').value ? parseInt(document.getElementById('protein').value) : null,
            mood: document.getElementById('mood').value || null,
            phase: document.getElementById('phase').value || null,
            trainingNotes: document.getElementById('trainingNotes').value || null,
            createdAt: new Date().toISOString()
        };

        // Check if entry for this date already exists
        const existingIndex = this.data.entries.findIndex(e => e.date === entry.date);
        
        setTimeout(() => {
            if (existingIndex >= 0) {
                this.data.entries[existingIndex] = entry;
                this.showToast('Entry Updated', 'Your fitness entry has been updated successfully.', 'success');
            } else {
                this.data.entries.push(entry);
                this.showToast('Entry Saved', 'Your fitness entry has been saved successfully.', 'success');
            }

            this.data.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.saveData();
            
            this.hideLoading();
            this.clearForm();
            this.renderDashboard();
            this.renderHistory();
            
            if (this.getSetting('autoSync', false) && this.isOnline) {
                this.syncWithGoogleSheets();
            }
        }, 800);
    }

    clearForm() {
        document.getElementById('entryForm').reset();
        this.setTodaysDate();
    }

    renderDashboard() {
        const entries = this.data.entries;
        const latest = entries[0];

        // Current stats
        document.getElementById('currentWeight').textContent = latest?.weight ? `${latest.weight} kg` : '--';
        document.getElementById('currentWaist').textContent = latest?.waist ? `${latest.waist}"` : '--';
        document.getElementById('currentPhase').textContent = latest?.phase || '--';

        // Weight change
        if (entries.length >= 2 && latest?.weight && entries[1]?.weight) {
            const change = latest.weight - entries[1].weight;
            const changeEl = document.getElementById('weightChange');
            changeEl.textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`;
            changeEl.className = `stat-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : ''}`;
        } else {
            document.getElementById('weightChange').textContent = 'No data';
        }

        // Waist change
        if (entries.length >= 2 && latest?.waist && entries[1]?.waist) {
            const change = latest.waist - entries[1].waist;
            const changeEl = document.getElementById('waistChange');
            changeEl.textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)}"`;
            changeEl.className = `stat-change ${change < 0 ? 'positive' : change > 0 ? 'negative' : ''}`;
        } else {
            document.getElementById('waistChange').textContent = 'No data';
        }

        // Phase duration
        if (latest?.phase) {
            const phaseEntries = entries.filter(e => e.phase === latest.phase);
            document.getElementById('phaseDuration').textContent = `${phaseEntries.length} days`;
        }

        // Weekly entries
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyEntries = entries.filter(e => new Date(e.date) >= oneWeekAgo);
        document.getElementById('weeklyEntries').textContent = weeklyEntries.length;

        // Recent entries
        this.renderRecentEntries();
    }

    renderRecentEntries() {
        const container = document.getElementById('recentEntriesList');
        const recentEntries = this.data.entries.slice(0, 5);

        if (recentEntries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-title">No entries yet</div>
                    <div class="empty-state-description">Start tracking your fitness journey by adding your first entry.</div>
                </div>
            `;
            return;
        }

        container.innerHTML = recentEntries.map(entry => `
            <div class="entry-item">
                <div class="entry-header">
                    <span class="entry-date">${this.formatDate(entry.date)}</span>
                    ${entry.phase ? `<span class="entry-phase">${entry.phase}</span>` : ''}
                </div>
                <div class="entry-metrics">
                    ${entry.weight ? `<span>Weight: ${entry.weight}kg</span>` : ''}
                    ${entry.waist ? `<span>Waist: ${entry.waist}"</span>` : ''}
                    ${entry.calories ? `<span>Calories: ${entry.calories}</span>` : ''}
                    ${entry.protein ? `<span>Protein: ${entry.protein}g</span>` : ''}
                    ${entry.mood ? `<span>Mood: ${entry.mood}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    renderHistory() {
        const container = document.getElementById('historyList');
        const entries = this.data.entries;

        if (entries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <div class="empty-state-title">No history yet</div>
                    <div class="empty-state-description">Your fitness entries will appear here as you add them.</div>
                </div>
            `;
            return;
        }

        container.innerHTML = entries.map((entry, index) => `
            <div class="history-item" data-index="${index}">
                <div class="history-item-header">
                    <span class="history-item-date">${this.formatDate(entry.date)}</span>
                    <div class="history-item-actions">
                        <button class="btn btn--sm btn--outline edit-entry-btn" data-index="${index}">Edit</button>
                        <button class="btn btn--sm btn--outline delete-entry-btn" data-index="${index}">Delete</button>
                    </div>
                </div>
                <div class="history-item-content">
                    <div class="history-metric">
                        <span class="history-metric-label">Weight</span>
                        <span class="history-metric-value">${entry.weight ? `${entry.weight} kg` : '--'}</span>
                    </div>
                    <div class="history-metric">
                        <span class="history-metric-label">Waist</span>
                        <span class="history-metric-value">${entry.waist ? `${entry.waist}"` : '--'}</span>
                    </div>
                    <div class="history-metric">
                        <span class="history-metric-label">Calories</span>
                        <span class="history-metric-value">${entry.calories || '--'}</span>
                    </div>
                    <div class="history-metric">
                        <span class="history-metric-label">Protein</span>
                        <span class="history-metric-value">${entry.protein ? `${entry.protein}g` : '--'}</span>
                    </div>
                    <div class="history-metric">
                        <span class="history-metric-label">Mood</span>
                        <span class="history-metric-value">${entry.mood || '--'}</span>
                    </div>
                    <div class="history-metric">
                        <span class="history-metric-label">Phase</span>
                        <span class="history-metric-value">${entry.phase || '--'}</span>
                    </div>
                </div>
                ${entry.trainingNotes ? `
                    <div class="history-notes">
                        <strong>Training Notes:</strong> ${entry.trainingNotes}
                    </div>
                ` : ''}
            </div>
        `).join('');

        // Add event listeners for edit/delete buttons
        container.querySelectorAll('.edit-entry-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.editEntry(index);
            });
        });

        container.querySelectorAll('.delete-entry-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.deleteEntry(index);
            });
        });
    }

    editEntry(index) {
        const entry = this.data.entries[index];
        
        // Populate form with entry data
        document.getElementById('entryDate').value = entry.date;
        document.getElementById('weight').value = entry.weight || '';
        document.getElementById('waist').value = entry.waist || '';
        document.getElementById('calories').value = entry.calories || '';
        document.getElementById('protein').value = entry.protein || '';
        document.getElementById('mood').value = entry.mood || '';
        document.getElementById('phase').value = entry.phase || '';
        document.getElementById('trainingNotes').value = entry.trainingNotes || '';

        // Navigate to entry page
        this.navigateToPage('entry');
        
        this.showToast('Edit Mode', 'Form populated with existing entry data. Save to update.', 'info');
    }

    deleteEntry(index) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.data.entries.splice(index, 1);
            this.saveData();
            this.renderHistory();
            this.renderDashboard();
            this.showToast('Entry Deleted', 'The entry has been removed successfully.', 'success');
        }
    }

    filterHistory(searchTerm) {
        const items = document.querySelectorAll('.history-item');
        const term = searchTerm.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'block' : 'none';
        });
    }

    filterHistoryByPhase(phase) {
        const items = document.querySelectorAll('.history-item');
        
        items.forEach((item, index) => {
            const entry = this.data.entries[index];
            item.style.display = !phase || entry.phase === phase ? 'block' : 'none';
        });
    }

    initializeCharts() {
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };

        // Weight Chart
        this.charts.weight = new Chart(document.getElementById('weightChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Weight (kg)',
                    data: [],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: chartOptions
        });

        // Waist Chart
        this.charts.waist = new Chart(document.getElementById('waistChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Waist (inches)',
                    data: [],
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: chartOptions
        });

        // Nutrition Chart
        this.charts.nutrition = new Chart(document.getElementById('nutritionChart'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Calories vs Protein',
                    data: [],
                    backgroundColor: '#B4413C'
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Calories'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Protein (g)'
                        }
                    }
                }
            }
        });

        // Phase Chart
        this.charts.phase = new Chart(document.getElementById('phaseChart'), {
            type: 'bar',
            data: {
                labels: ['Cutting', 'Bulking'],
                datasets: [{
                    label: 'Days',
                    data: [0, 0],
                    backgroundColor: ['#5D878F', '#DB4545']
                }]
            },
            options: chartOptions
        });

        this.updateCharts();
    }

    updateCharts() {
        const entries = this.data.entries.filter(e => e.weight || e.waist || e.calories || e.protein);
        
        // Weight chart
        const weightData = entries.filter(e => e.weight).reverse();
        this.charts.weight.data.labels = weightData.map(e => this.formatDate(e.date));
        this.charts.weight.data.datasets[0].data = weightData.map(e => e.weight);
        this.charts.weight.update();

        // Waist chart
        const waistData = entries.filter(e => e.waist).reverse();
        this.charts.waist.data.labels = waistData.map(e => this.formatDate(e.date));
        this.charts.waist.data.datasets[0].data = waistData.map(e => e.waist);
        this.charts.waist.update();

        // Nutrition chart
        const nutritionData = entries.filter(e => e.calories && e.protein);
        this.charts.nutrition.data.datasets[0].data = nutritionData.map(e => ({
            x: e.calories,
            y: e.protein
        }));
        this.charts.nutrition.update();

        // Phase chart
        const phaseCounts = {
            'Cutting': entries.filter(e => e.phase === 'Cutting').length,
            'Bulking': entries.filter(e => e.phase === 'Bulking').length
        };
        this.charts.phase.data.datasets[0].data = [phaseCounts.Cutting, phaseCounts.Bulking];
        this.charts.phase.update();
    }

    connectGoogleSheets() {
        this.showLoading();
        
        // Simulate API connection
        setTimeout(() => {
            this.data.settings.googleSheetsConnected = true;
            this.data.settings.sheetUrl = 'https://docs.google.com/spreadsheets/d/your-sheet-id';
            this.data.settings.lastSync = new Date().toISOString();
            this.saveData();
            
            this.updateGoogleSheetsStatus();
            this.hideLoading();
            this.showToast('Connected!', 'Successfully connected to Google Sheets', 'success');
        }, 2000);
    }

    syncWithGoogleSheets() {
        if (!this.data.settings.googleSheetsConnected) {
            this.showToast('Not Connected', 'Please connect to Google Sheets first', 'warning');
            return;
        }

        this.updateSyncStatus('syncing');
        
        // Simulate sync process
        setTimeout(() => {
            this.data.settings.lastSync = new Date().toISOString();
            this.syncPending = false;
            this.saveData();
            this.updateSyncStatus('synced');
            this.showToast('Synced!', 'Data synchronized with Google Sheets', 'success');
        }, 2000);
    }

    updateConnectionStatus() {
        const indicator = document.getElementById('connectionStatus');
        const text = document.getElementById('connectionText');
        
        if (this.isOnline) {
            indicator.className = 'status-indicator';
            text.textContent = 'Online';
        } else {
            indicator.className = 'status-indicator offline';
            text.textContent = 'Offline';
        }
    }

    updateSyncStatus(status = null) {
        const indicator = document.querySelector('.sync-indicator');
        const text = document.getElementById('syncText');
        
        if (status === 'syncing') {
            indicator.className = 'status-indicator syncing';
            text.textContent = 'Syncing...';
        } else if (this.syncPending) {
            indicator.className = 'status-indicator offline';
            text.textContent = 'Sync Pending';
        } else {
            indicator.className = 'status-indicator';
            text.textContent = 'Synced';
        }
    }

    updateGoogleSheetsStatus() {
        const indicator = document.getElementById('sheetsStatus');
        const text = document.getElementById('sheetsStatusText');
        const btn = document.querySelector('.connect-sheets-btn');
        const info = document.querySelector('.sheets-info');
        
        if (this.data.settings.googleSheetsConnected) {
            indicator.className = 'status-indicator';
            text.textContent = 'Connected';
            btn.textContent = 'Disconnect';
            info.style.display = 'block';
            document.getElementById('sheetUrl').textContent = this.data.settings.sheetUrl;
            document.getElementById('lastSync').textContent = this.data.settings.lastSync ? 
                this.formatDateTime(this.data.settings.lastSync) : 'Never';
        } else {
            indicator.className = 'status-indicator offline';
            text.textContent = 'Not Connected';
            btn.textContent = 'Connect Google Sheets';
            info.style.display = 'none';
        }
    }

    loadSettings() {
        document.getElementById('themeSelect').value = this.data.settings.theme || 'auto';
        document.getElementById('autoSync').checked = this.data.settings.autoSync || false;
        this.updateGoogleSheetsStatus();
        this.setTheme(this.data.settings.theme || 'auto');
    }

    setSetting(key, value) {
        this.data.settings[key] = value;
        this.saveData();
    }

    getSetting(key, defaultValue = null) {
        return this.data.settings[key] !== undefined ? this.data.settings[key] : defaultValue;
    }

    setTheme(theme) {
        this.setSetting('theme', theme);
        
        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-color-scheme');
        } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
        }
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Exported!', 'Your data has been exported successfully', 'success');
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.data.entries = [];
            this.saveData();
            this.renderDashboard();
            this.renderHistory();
            this.updateCharts();
            this.showToast('Data Cleared', 'All fitness data has been removed', 'warning');
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    showToast(title, message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${title}</span>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 5000);
        
        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fitnessTracker = new FitnessTracker();
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully');
            })
            .catch(error => {
                console.log('Service Worker registration failed');
            });
    }
});

// PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or notification
    const installBtn = document.createElement('button');
    installBtn.textContent = 'Install App';
    installBtn.className = 'btn btn--secondary install-btn';
    installBtn.style.position = 'fixed';
    installBtn.style.top = '10px';
    installBtn.style.right = '10px';
    installBtn.style.zIndex = '1000';
    
    installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            document.body.removeChild(installBtn);
        });
    });
    
    document.body.appendChild(installBtn);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (document.body.contains(installBtn)) {
            document.body.removeChild(installBtn);
        }
    }, 10000);
});

// Handle touch gestures for navigation (swipe)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 100;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        const pages = ['dashboard', 'entry', 'progress', 'history', 'settings'];
        const currentIndex = pages.indexOf(window.fitnessTracker.currentPage);
        
        if (diff > 0 && currentIndex < pages.length - 1) {
            // Swipe left - next page
            window.fitnessTracker.navigateToPage(pages[currentIndex + 1]);
        } else if (diff < 0 && currentIndex > 0) {
            // Swipe right - previous page
            window.fitnessTracker.navigateToPage(pages[currentIndex - 1]);
        }
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                window.fitnessTracker.navigateToPage('dashboard');
                break;
            case '2':
                e.preventDefault();
                window.fitnessTracker.navigateToPage('entry');
                break;
            case '3':
                e.preventDefault();
                window.fitnessTracker.navigateToPage('progress');
                break;
            case '4':
                e.preventDefault();
                window.fitnessTracker.navigateToPage('history');
                break;
            case '5':
                e.preventDefault();
                window.fitnessTracker.navigateToPage('settings');
                break;
        }
    }
});

// Auto-save form data as user types (draft functionality)
const formInputs = ['weight', 'waist', 'calories', 'protein', 'mood', 'phase', 'trainingNotes'];
formInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('input', () => {
            const draftData = {};
            formInputs.forEach(id => {
                const el = document.getElementById(id);
                if (el && el.value) {
                    draftData[id] = el.value;
                }
            });
            localStorage.setItem('entryDraft', JSON.stringify(draftData));
        });
    }
});

// Load draft data when page loads
window.addEventListener('load', () => {
    const draft = localStorage.getItem('entryDraft');
    if (draft) {
        const draftData = JSON.parse(draft);
        Object.keys(draftData).forEach(key => {
            const input = document.getElementById(key);
            if (input && !input.value) {
                input.value = draftData[key];
            }
        });
    }
});

// Clear draft when form is submitted
document.getElementById('entryForm').addEventListener('submit', () => {
    localStorage.removeItem('entryDraft');
});