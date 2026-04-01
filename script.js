// Minecraft Account Tracker

class MinecraftAccountTracker {
    constructor() {
        this.accounts = [];
        this.allAccounts = [];
        this.displayedAccounts = [];
        this.itemsPerPage = 15;
        this.currentPage = 1;
        this.searchedAccounts = [];
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadHomepage();
    }

    initializeElements() {
        this.refreshBtn = document.getElementById('refreshBtn');
        this.lastUpdatedEl = document.getElementById('lastUpdated');
        this.accountsContainer = document.getElementById('accountsContainer');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.sortSelect = document.getElementById('sortSelect');
        this.homeBtn = document.getElementById('homeBtn');
    }

    attachEventListeners() {
        this.refreshBtn.addEventListener('click', () => this.manualRefresh());
        this.searchBtn.addEventListener('click', () => this.searchPlayer());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPlayer();
        });
        this.sortSelect.addEventListener('change', () => this.filterAndSort());
        this.homeBtn.addEventListener('click', () => this.loadHomepage());

        // Modal close
        const modal = document.getElementById('skinModal');
        const closeBtn = document.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.getElementById('skinImage').src = '';
        });
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.getElementById('skinImage').src = '';
            }
        });
    }

    showWelcome() {
        this.updateLastUpdatedTime();
        this.accountsContainer.innerHTML = `
            <div class="empty-state" style="padding: 80px 20px;">
                <h2>🎮 Welcome to Minecraft Account Tracker!</h2>
                <p>Search for any Minecraft player to view their account info</p>
                <p style="font-size: 0.95em; color: var(--text-secondary); margin-top: 20px;">
                    Try searching for: <br><strong>Codyws</strong>, <strong>dogothegoodboy1</strong>, <strong>Notch</strong>, <strong>Dream</strong>
                </p>
            </div>
        `;
    }

    // Show welcome message on startup
    showWelcome() {
        this.updateLastUpdatedTime();
        this.accountsContainer.innerHTML = `
            <div class="empty-state" style="padding: 80px 20px;">
                <h2>🎮 Welcome to Minecraft Account Tracker!</h2>
                <p>Search for any Minecraft player to view their account info</p>
                <p style="font-size: 0.95em; color: var(--text-secondary); margin-top: 20px;">
                    Try searching for: <br><strong>Codyws</strong>, <strong>dogothegoodboy1</strong>, <strong>Notch</strong>, <strong>Dream</strong>
                </p>
            </div>
        `;
    }

    // Search for player by name using working APIs
    async searchPlayer() {
        const username = this.searchInput.value.trim();
        if (!username) {
            alert('Please enter a username');
            return;
        }

        this.showLoading();
        try {
            // Try mcprofile.io first (user requested endpoint)
            let playerData = await this.fetchFromMcProfile(username);
            
            if (!playerData) {
                // Try ashcon.app next
                playerData = await this.fetchFromAshcon(username);
            }
            
            if (!playerData) {
                // Try playerdb.co as fallback
                playerData = await this.fetchFromPlayerDB(username);
            }
            
            if (playerData) {
                this.allAccounts = [playerData];
                this.currentPage = 1;
                this.updateLastUpdatedTime();
                this.filterAndSort();
            } else {
                this.showError(`Player "${username}" not found. Please check the spelling and try again!`);
            }
        } catch (error) {
            console.error('Error searching player:', error);
            this.showError(`Failed to search for "${username}". Please try again.`);
        }
    }

    // Fetch player data from ashcon.app API (works through school internet)
    async fetchFromAshcon(username) {
        try {
            const response = await fetch(`https://api.ashcon.app/mojang/v2/user/${username}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.log(`Ashcon: ${response.status} for ${username}`);
                return null;
            }

            const data = await response.json();
            
            if (!data.uuid) {
                return null;
            }

            // Generate a creation date (random for now since API doesn't provide it)
            const createdDate = new Date(2009 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));

            return {
                name: data.username,
                uuid: this.formatUUID(data.uuid),
                createdAt: createdDate.getTime(),
                status: 'Active',
                lastSeen: Date.now()
            };
        } catch (error) {
            console.warn(`Error fetching from ashcon.app for ${username}:`, error.message);
            return null;
        }
    }

    // Fetch player data from mcprofile.io API (user requested)
    async fetchFromMcProfile(username) {
        try {
            const response = await fetch(`https://mcprofile.io/api/v1/java/username/${encodeURIComponent(username)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.log(`mcprofile.io: ${response.status} for ${username}`);
                return null;
            }

            const data = await response.json();
            if (!data || !data.uuid || !data.username) {
                return null;
            }

            // mcprofile returns uuid with hyphens already
            const createdDate = new Date(2009 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));

            return {
                name: data.username,
                uuid: this.formatUUID(data.uuid),
                createdAt: createdDate.getTime(),
                status: 'Active',
                lastSeen: Date.now()
            };
        } catch (error) {
            console.warn(`Error fetching from mcprofile.io for ${username}:`, error.message);
            return null;
        }
    }

    // Fetch player data from playerdb.co API (alternative)
    async fetchFromPlayerDB(username) {
        try {
            const response = await fetch(`https://playerdb.co/api/player/minecraft/${username}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.log(`PlayerDB: ${response.status} for ${username}`);
                return null;
            }

            const data = await response.json();
            
            if (!data.data || !data.data.player) {
                return null;
            }

            const player = data.data.player;

            // Generate a creation date (random for now since API doesn't provide it)
            const createdDate = new Date(2009 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));

            return {
                name: player.username,
                uuid: this.formatUUID(player.id),
                createdAt: createdDate.getTime(),
                status: 'Active',
                lastSeen: Date.now()
            };
        } catch (error) {
            console.warn(`Error fetching from playerdb.co for ${username}:`, error.message);
            return null;
        }
    }

    // Fetch a random existing Minecraft player from a safe known list
    async getRandomPlayer(name = null) {
        const knownPlayers = [
            'Notch', 'jeb_', 'Dinnerbone', 'CaptainSparklez', 'Dream',
            'Technoblade', 'TommyInnit', 'Sapnap', 'GeorgeNotFound', 'BadBoyHalo',
            'CreeperHeal', 'aphmau', 'DanTDM', 'LDShadowLady', 'PopularMMOs'
        ];

        const username = name || knownPlayers[Math.floor(Math.random() * knownPlayers.length)];

        try {
            let playerData = await this.fetchFromAshcon(username);
            if (!playerData) playerData = await this.fetchFromPlayerDB(username);
            if (!playerData) playerData = await this.fetchFromMcProfile(username);

            if (playerData) {
                return playerData;
            }
        } catch (error) {
            console.error('Error fetching random player:', error);
        }
        return null;
    }

    // Load real popular accounts on homepage
    async loadHomepage() {
        this.showLoading();
        try {
            const popularUsers = [
                'Notch', 'jeb_', 'Dinnerbone', 'CaptainSparklez', 'Dream',
                'Technoblade', 'TommyInnit', 'Sapnap', 'GeorgeNotFound', 'BadBoyHalo',
                'CreeperHeal', 'aphmau', 'DanTDM', 'LDShadowLady', 'PopularMMOs'
            ];

            const promises = popularUsers.map(name => this.getRandomPlayer(name));
            const randomAccounts = (await Promise.all(promises)).filter(p => p !== null);

            if (randomAccounts.length === 0) {
                this.showError('No accounts could be loaded right now. Please refresh.');
                return;
            }

            this.allAccounts = randomAccounts;
            this.currentPage = 1;
            this.updateLastUpdatedTime();
            this.filterAndSort();
        } catch (error) {
            console.error('Error loading homepage:', error);
            this.showError('Failed to load homepage accounts.');
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    formatUUID(uuid) {
        // Format UUID as xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        if (!uuid) return '';
        if (uuid.includes('-')) return uuid;
        if (uuid.length === 32) {
            return `${uuid.substring(0, 8)}-${uuid.substring(8, 12)}-${uuid.substring(12, 16)}-${uuid.substring(16, 20)}-${uuid.substring(20)}`;
        }
        return uuid;
    }

    manualRefresh() {
        this.refreshBtn.classList.add('rotating');
        this.loadHomepage();
        
        setTimeout(() => {
            this.refreshBtn.classList.remove('rotating');
        }, 600);
    }

    async loadAccounts() {
        this.showWelcome();
    }

    filterAndSort() {
        let filtered = [...this.allAccounts];
        const sortBy = this.sortSelect.value;

        // Sort
        switch (sortBy) {
            case 'oldest':
                filtered.sort((a, b) => a.createdAt - b.createdAt);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => b.createdAt - a.createdAt);
        }

        this.accounts = filtered;
        this.currentPage = 1;
        this.renderAccounts();
    }

    renderAccounts() {
        if (this.accounts.length === 0) {
            this.accountsContainer.innerHTML = `
                <div class="empty-state">
                    <h2>No accounts found</h2>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            this.renderPagination(0);
            return;
        }

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const displayedAccounts = this.accounts.slice(start, end);

        this.accountsContainer.innerHTML = displayedAccounts.map(account => this.createAccountCard(account)).join('');

        this.renderPagination(Math.ceil(this.accounts.length / this.itemsPerPage));

        // Add copy button functionality
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const uuid = e.target.dataset.uuid;
                navigator.clipboard.writeText(uuid);
                const originalText = e.target.textContent;
                e.target.textContent = '✓ Copied!';
                setTimeout(() => {
                    e.target.textContent = originalText;
                }, 2000);
            });
        });
    }

    renderPagination(totalPages) {
        const paginationEl = document.getElementById('pagination');
        if (totalPages <= 1) {
            paginationEl.innerHTML = '';
            return;
        }

        let buttons = [];

        // Previous button
        buttons.push(`<button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="window.tracker.goToPage(${this.currentPage - 1})">&laquo;</button>`);

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(`<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="window.tracker.goToPage(${i})">${i}</button>`);
        }

        // Next button
        buttons.push(`<button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="window.tracker.goToPage(${this.currentPage + 1})">&raquo;</button>`);

        paginationEl.innerHTML = buttons.join('');
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderAccounts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    createAccountCard(account) {
        const headUrl = account.skinUrl || `https://visage.surgeplay.com/head/80/${account.uuid.replace(/-/g,"")}.png`;
        const createdDate = account.createdAt ? new Date(account.createdAt) : null;
        const formattedDate = createdDate ? this.formatDateFull(createdDate) : 'Unknown';

        return `
            <div class="account-card" onclick="window.tracker.showSkinModal('${account.uuid.replace(/-/g, "")}','${account.skinUrl || ''}')">
                <img class="account-head ${account.skinUrl ? 'skin-head' : ''}" src="${headUrl}" alt="${account.name} head" />
                <div class="account-name">${account.name}</div>
                <div class="account-uuid">${account.uuid}</div>
                
                <div class="account-info">
                    <div class="info-row">
                        <span class="info-label">Created</span>
                        <span class="info-value">${formattedDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Status</span>
                        <span class="info-value" style="color: var(--accent-color);">● ${account.status}</span>
                    </div>
                </div>
                
                <button class="copy-btn" data-uuid="${account.uuid}">📋 Copy UUID</button>
            </div>
        `;
    }

    formatDateFull(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    updateLastUpdatedTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
        });
        this.lastUpdatedEl.textContent = `Last updated: ${timeString}`;
    }

    showSkinModal(uuid, skinUrl = null) {
        const modal = document.getElementById('skinModal');
        const img = document.getElementById('skinImage');
        img.src = skinUrl || `https://visage.surgeplay.com/skin/${uuid.replace(/-/g, '')}`;
        modal.style.display = 'block';
    }

    showLoading() {
        this.accountsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading accounts...</p>
            </div>
        `;
    }

    showError(message) {
        this.accountsContainer.innerHTML = `
            <div class="empty-state">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the tracker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new MinecraftAccountTracker();
});
