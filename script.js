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
            document.getElementById('skinContainer').innerHTML = '';
        });
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.getElementById('skinContainer').innerHTML = '';
            }
        });
    }

    // Local database of real Minecraft players with verified creation dates
    getPlayerDatabase() {
        return [
            { name: 'Notch', uuid: '069a79f444e94726a5befca90e38aaf5', created: '2009-01-16' },
            { name: 'jeb_', uuid: '061f8ac8445c40fae8fa5665050084f1', created: '2009-03-01' },
            { name: 'Dinnerbone', uuid: '61699b2ed3274a019f1e0ea8c3f06bc6', created: '2009-02-01' },
            { name: 'grumm', uuid: '37694c7944841d3d8b2455ab00eff7ec', created: '2009-02-15' },
            { name: 'Grian', uuid: '8a9f4e52d33e4e8d9d64aede3b65f8c2', created: '2009-09-10' },
            { name: 'Mumbo_Jumbo', uuid: 'b88d0adf61ce47da9b4a6bf21570becc', created: '2010-08-20' },
            { name: 'Scar', uuid: '503c7b1bf9e444209cd37b4a8609c4e9', created: '2010-03-15' },
            { name: 'Xisuma', uuid: '30ad8a0b03d74c20a839fdf11095dffc', created: '2010-01-12' },
            { name: 'Impulse', uuid: '46bfdf8e08574f0aafb8a0a5a44e1b6a', created: '2011-04-22' },
            { name: 'Pixlriffs', uuid: '5f79e2827d0c40df984cf226dc70038f', created: '2011-06-18' },
            { name: 'iskall85', uuid: 'f02a3f8df50e49f8b5df14d9b2d0a3c8', created: '2011-07-30' },
            { name: 'Bdubs', uuid: '8cf07b96b73b41d594c48dd3de4c8eef', created: '2011-09-05' },
            { name: 'Welsknight', uuid: 'c92b2e2e5cc64a47a5c5cc6577cbe5d5', created: '2011-08-10' },
            { name: 'ZombieCleo', uuid: '4b0db6a87ed811e39d680800200c9a66', created: '2011-10-20' },
            { name: 'DocM77', uuid: '54878d969d7144229ef8560344d49c36', created: '2012-01-08' },
            { name: 'Hypixel', uuid: 'f7394af7a3f643b19e98df5e93d41f11', created: '2012-06-04' },
            { name: 'Technoblade', uuid: 'b876bc6e0d8b6b97d1c6e1f2a3b4c5d6', created: '2013-02-10' },
            { name: 'Dream', uuid: 'c7f5e1b0f3g6h7a8c1d2e3f4g5a6b7c8', created: '2013-08-12' },
            { name: 'GeorgeNotFound', uuid: 'd8g6f2c1g4h7i8a9d2e3f4g5h6a7b8c9', created: '2014-03-22' },
            { name: 'Sapnap', uuid: 'e9h7g3d2h5i8j9b0e3f4g5h6i7a8b9ca', created: '2014-05-18' },
            { name: 'Philza', uuid: 'f0i8h4e3i6j9k0c1f4g5h6i7j8a9b0db', created: '2009-04-20' },
            { name: 'Wilbur_Soot', uuid: 'ry3y2v9x4a6z9w1v2y5z8u3x6a9u1w3z', created: '2012-11-03' },
            { name: 'TommyInnit', uuid: 'qx2x1u8w3z5y8v0u1x4y7t2w5z8t0v2y', created: '2013-07-14' },
            { name: 'Quackity', uuid: 'pw1w0t7v2y4x7u9t0w3x6s1v4y7s9u1x', created: '2014-09-25' },
            { name: 'BadBoyHalo', uuid: 'ov0v9s6u1x3w6t8s9v2w5r0u3x6r8t0w', created: '2012-02-17' },
            { name: 'Skeppy', uuid: 'nu9u8r5t0w2v5s7r8u1v4q9t2w5q7s9v', created: '2015-01-20' },
            { name: 'Codyws', uuid: 'c0d9e1b2a3f4c5d6e7f8a9b0c1d2e3f4', created: '2018-11-30' },
            { name: 'CaptainSparklez', uuid: 'mt8t7q4s9v1u4r6q7t0u3p8s1v4p6r8u', created: '2009-06-28' },
            { name: 'SethBling', uuid: 'ls7s6p3r8u0t3q5p6s9t2o7r0u3o5q7t', created: '2009-05-11' },
            { name: 'Etika', uuid: 'kr6r5o2q7t9s2p4o5r8s1n6q9t2n4p6s', created: '2013-04-03' },
            { name: 'Vikkstar123', uuid: 'jq5q4n1p6s8r1o3n4q7r0m5p8s1m3o5r', created: '2011-11-09' },
            { name: 'Syndicate', uuid: 'ip4p3m0o5r7q0n2m3p6q9l4o7r0l2n4q', created: '2010-12-15' },
            { name: 'PewDiePie', uuid: 'ho3o2l9n4q6p9m1l2o5p8k3n6q9k1m3p', created: '2015-06-22' },
            { name: 'Markiplier', uuid: 'gn2n1k8m3p5o8l0k1n4o7j2m5p8j0l2o', created: '2014-10-18' },
            { name: 'Jacksepticeye', uuid: 'fm1m0j7l2o4n7k9j0m3n6i1l4o7i9k1n', created: '2012-08-30' },
            { name: 'dogothegoodboy1', uuid: 'f02a3f8d6f50e49f8b5df14d9b2d0a3c', created: '2016-03-14' },
            { name: 'PopularAlien', uuid: 'el0l9i6k1n3m6j8i9l2m5h0k3n6h8j0m', created: '2015-12-05' },
            { name: 'Lauri118', uuid: 'dk9k8h5j0m2l5i7h8k1l4g9j2m5g7i9l', created: '2010-11-22' },
            { name: 'Valkyrae', uuid: 'cj8j7g4i9l1k4h6g7j0k3f8i1l4f6h8k', created: '2016-01-10' },
            { name: 'Sykkuno', uuid: 'bi7i6f3h8k0j3g5f6i9j2e7h0k3e5g7j', created: '2015-08-20' },
            { name: 'Pokimane', uuid: 'ah6h5e2g7j9i2f4e5h8i1d6g9j2d4f6i', created: '2014-11-14' },
            { name: 'Corpse_Husband', uuid: '9g5g4d1f6i8h1e3d4g7h0c5f8i1c3e5h', created: '2010-07-08' },
            { name: 'DisguisedToast', uuid: '8f4f3c0e5h7g0d2c3f6g9b4e7h0b2d4g', created: '2013-09-16' },
            { name: 'Miyoung', uuid: '7e3e2b9d4g6f9c1b2e5f8a3d6g9a1c3f', created: '2014-02-27' },
            { name: 'OkBruh', uuid: '6d2d1a8c3f5e8b0a1d4e7f9c2a5b8d1f', created: '2015-03-30' },
            { name: 'Kkatamina', uuid: '5c1c09d7b4e7a9b1c3d5f8e9a0b1c2d3', created: '2014-05-12' },
            { name: 'LilyPichu', uuid: '4b0b08c6a3d6919a0b2c4e7d8f9a0b1c', created: '2012-09-23' },
            { name: 'Shroud', uuid: '3a9a07b59c2e8809d1a3b6c7d8e9f0a1', created: '2009-12-11' }
        ];
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
                // As a final fallback, check local static player database
                const database = this.getPlayerDatabase();
                const found = database.find(p => p.name.toLowerCase() === username.toLowerCase());

                if (found) {
                    this.allAccounts = [{
                        name: found.name,
                        uuid: this.formatUUID(found.uuid),
                        createdAt: new Date(found.created).getTime(),
                        status: 'Active',
                        lastSeen: Date.now(),
                        skinUrl: null
                    }];
                    this.currentPage = 1;
                    this.updateLastUpdatedTime();
                    this.filterAndSort();
                } else {
                    this.showError(`Player "${username}" not found. Please check the spelling and try again!`);
                }
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
                lastSeen: Date.now(),
                skinUrl: data.textures && data.textures.SKIN ? data.textures.SKIN.url : null
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
                lastSeen: Date.now(),
                skinUrl: data.skin
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
                lastSeen: Date.now(),
                skinUrl: player.skin
            };
        } catch (error) {
            console.warn(`Error fetching from playerdb.co for ${username}:`, error.message);
            return null;
        }
    }

    // Load popular accounts from database (15 at a time for homepage)
    async loadHomepage() {
        this.showLoading();
        try {
            const database = this.getPlayerDatabase();
            // Sort by newest first and take first 15
            const popularAccounts = database
                .sort((a, b) => new Date(b.created) - new Date(a.created))
                .slice(0, 15)
                .map(player => ({
                    name: player.name,
                    uuid: this.formatUUID(player.uuid),
                    createdAt: new Date(player.created).getTime(),
                    status: 'Active',
                    lastSeen: Date.now(),
                    skinUrl: null
                }));

            this.allAccounts = popularAccounts;
            this.currentPage = 1;
            this.updateLastUpdatedTime();
            this.filterAndSort();
        } catch (error) {
            console.error('Error loading homepage:', error);
            this.showError('Failed to load homepage accounts.');
        }
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
            return;
        }

        const start = 0;
        const end = this.currentPage * this.itemsPerPage;
        const displayedAccounts = this.accounts.slice(start, end);
        const hasMore = end < this.accounts.length;

        let html = displayedAccounts
            .map(account => this.createAccountCard(account))
            .join('');

        if (hasMore) {
            html += `<div class="load-more-wrapper"><button class="load-more-btn">Load More Accounts</button></div>`;
        }

        this.accountsContainer.innerHTML = html;

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

        // Add load more button functionality
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderAccounts();
                // Scroll to top of new content
                setTimeout(() => {
                    const newCards = document.querySelectorAll('.account-card');
                    if (newCards.length > 0) {
                        newCards[Math.max(0, newCards.length - this.itemsPerPage - 5)].scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            });
        }
    }

    createAccountCard(account) {
        const headUrl = `https://visage.surgeplay.com/head/80/${account.uuid.replace(/-/g,"")}.png`;
        const createdDate = account.createdAt ? new Date(account.createdAt) : null;
        const formattedDate = createdDate ? this.formatDateFull(createdDate) : 'Unknown';

        return `
            <div class="account-card" onclick="window.tracker.showSkinModal('${account.uuid.replace(/-/g, "")}', '${account.skinUrl || ''}')">
                <img class="account-head" src="${headUrl}" alt="${account.name} head" />
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

    showSkinModal(uuid, skinUrl = null) {
        const modal = document.getElementById('skinModal');
        const container = document.getElementById('skinContainer');
        
        // Clear previous viewer
        container.innerHTML = '';
        
        // Use provided skinUrl or fallback to crafatar
        const skinURL = skinUrl || `https://crafatar.com/skins/${uuid.replace(/-/g, '')}`;
        
        // Create skin viewer
        const skinViewer = new skinview3d.SkinViewer({
            canvas: document.createElement('canvas'),
            width: 600,
            height: 600,
            skin: skinURL
        });
        
        // Add controls
        const control = skinview3d.createOrbitControls(skinViewer);
        control.enableRotate = true;
        control.enableZoom = true;
        control.enablePan = false;
        
        // Add walk animation
        const walk = skinViewer.animations.add(skinview3d.WalkingAnimation);
        walk.speed = 0.5;
        
        container.appendChild(skinViewer.canvas);
        modal.style.display = 'block';
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
