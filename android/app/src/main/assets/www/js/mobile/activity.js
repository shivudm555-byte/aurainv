// ==========================================================================
// 2026 Fintech Mobile App - Activity & Transaction Details (Screens 16, 17)
// ==========================================================================

const MobileActivity = {
  activeFilter: 'All',
  searchQuery: '',

  // ==========================================================================
  // Screen 16: ACTIVITY & TRANSACTION CENTER
  // ==========================================================================
  render(container) {
    const transactions = Store.state.transactions || [];

    const filtered = transactions.filter(tx => {
      const matchCategory = (this.activeFilter === 'All') ||
        (this.activeFilter === 'Deposits' && tx.category === 'Deposits') ||
        (this.activeFilter === 'Withdrawals' && tx.category === 'Withdrawals') ||
        (this.activeFilter === 'Investments' && tx.category === 'Investments') ||
        (this.activeFilter === 'Earnings' && tx.category === 'Earnings') ||
        (this.activeFilter === 'Fees' && tx.category === 'Fees') ||
        (this.activeFilter === 'Digital Assets' && tx.category === 'Digital Assets');

      const matchSearch = !this.searchQuery ||
        tx.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        tx.reference.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Activity</h2>
            <span class="subpage-step-indicator">Transaction Center</span>
          </div>
          <button class="header-icon-btn" onclick="MobileActivity.exportStatement()" title="Export Statement">📥</button>
        </div>

        <!-- Search Input -->
        <div class="activity-search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="tx-search-input" class="search-input" placeholder="Search by ID, UTR, or type..." value="${this.searchQuery}" oninput="MobileActivity.handleSearch(this.value)" />
          ${this.searchQuery ? `<button class="clear-search-btn" onclick="MobileActivity.handleSearch('')">✕</button>` : ''}
        </div>

        <!-- 7 Category Filter Chips -->
        <div class="filter-chips-scroll-row">
          ${['All', 'Deposits', 'Withdrawals', 'Investments', 'Earnings', 'Fees', 'Digital Assets'].map(f => `
            <button class="filter-chip ${f === this.activeFilter ? 'active' : ''}" onclick="MobileActivity.setFilter('${f}')">
              ${f}
            </button>
          `).join('')}
        </div>

        <!-- Transaction Feed -->
        <div class="activity-transactions-list" style="margin-top: 14px;">
          ${filtered.length > 0 ? filtered.map(tx => `
            <div class="tx-card-item" onclick="Store.setMobileScreen('transaction_details', { id: '${tx.id}' })">
              <div class="tx-card-icon-box ${tx.is_positive ? 'pos' : 'neg'}">
                ${tx.is_positive ? '↓' : '↑'}
              </div>
              <div class="tx-card-center">
                <div class="tx-title-row">
                  <strong class="tx-title">${tx.title}</strong>
                  <span class="tx-status-badge ${tx.status.toLowerCase()}">${tx.status}</span>
                </div>
                <div class="tx-meta-row">
                  <span class="tx-ref">${tx.reference}</span>
                  <span class="tx-date">${tx.date}</span>
                </div>
              </div>
              <div class="tx-card-amount ${tx.is_positive ? 'positive' : ''}">
                ${tx.is_positive ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          `).join('') : `
            <div class="empty-state-card">
              <span class="empty-icon">🧾</span>
              <h3>No Transactions Found</h3>
              <p>Your transaction history for "${this.activeFilter}" will appear here.</p>
            </div>
          `}
        </div>
      </div>
    `;
  },

  setFilter(filter) {
    Haptics.tick();
    this.activeFilter = filter;
    const viewport = document.getElementById('mobile-screen-content');
    this.render(viewport);
  },

  handleSearch(val) {
    this.searchQuery = val;
    const viewport = document.getElementById('mobile-screen-content');
    this.render(viewport);
  },

  exportStatement() {
    Haptics.success();
    alert('Financial statement PDF generated and ready for download!');
  },

  // ==========================================================================
  // Screen 17: TRANSACTION DETAILS VIEW
  // ==========================================================================
  renderDetails(container, params = {}) {
    const txId = params.id || 'TX-2026-904';
    const tx = Store.state.transactions.find(t => t.id === txId) || Store.state.transactions[0];

    if (!tx) {
      Store.setMobileScreen('activity');
      return;
    }

    const isCrypto = tx.category === 'Digital Assets';

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="MobileRouter.goBack()">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Transaction Details</h2>
            <span class="subpage-step-indicator">${tx.id}</span>
          </div>
          <div></div>
        </div>

        <div class="tx-details-hero-card">
          <div class="tx-details-icon-circle ${tx.is_positive ? 'pos' : 'neg'}">
            ${tx.is_positive ? '↓' : '↑'}
          </div>
          <span class="tx-details-title">${tx.title}</span>
          <h1 class="tx-details-amount ${tx.is_positive ? 'positive' : ''}">
            ${tx.is_positive ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h1>
          <span class="tx-status-badge ${tx.status.toLowerCase()}" style="font-size: 0.85rem; padding: 4px 14px;">
            ${tx.status.toUpperCase()}
          </span>
        </div>

        <div class="tx-audit-receipt-card">
          <div class="receipt-row">
            <span>Transaction ID</span>
            <strong>${tx.id}</strong>
          </div>
          <div class="receipt-row">
            <span>Transaction Type</span>
            <strong>${tx.type}</strong>
          </div>
          <div class="receipt-row">
            <span>Gross Amount</span>
            <strong>₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="receipt-row">
            <span>Platform / Network Fee</span>
            <strong>₹${(tx.fee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="receipt-row">
            <span>Balance Before</span>
            <strong>₹${(tx.balance_before || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="receipt-row">
            <span>Balance After</span>
            <strong style="color: #00F0FF;">₹${(tx.balance_after || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="receipt-row">
            <span>Reference / UTR</span>
            <strong>${tx.reference}</strong>
          </div>
          <div class="receipt-row">
            <span>Timestamp</span>
            <strong>${tx.date}</strong>
          </div>

          ${isCrypto ? `
            <div class="receipt-divider"></div>
            <div class="receipt-row">
              <span>Blockchain Network</span>
              <strong>TRON (TRC-20) / ERC-20</strong>
            </div>
            <div class="receipt-row">
              <span>Destination Address</span>
              <strong style="font-size: 0.75rem; font-family: monospace;">TX9v8k7y8x7d6f5e4w3z2a1s0</strong>
            </div>
            <div class="receipt-row">
              <span>Tx Hash</span>
              <strong style="font-size: 0.75rem; font-family: monospace;">0x9a8f...3e21</strong>
            </div>
            <div class="receipt-row">
              <span>Block Confirmations</span>
              <strong style="color: #10B981;">18 / 18 (Finalized)</strong>
            </div>
          ` : ''}
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="btn btn-secondary btn-full" onclick="Haptics.success(); alert('Official double-entry ledger receipt downloaded!');">
            <span>📄 Download Receipt</span>
          </button>
          <button class="btn btn-outline btn-full" onclick="Store.setMobileScreen('support')">
            <span>Need Help?</span>
          </button>
        </div>
      </div>
    `;
  }
};

window.MobileActivity = MobileActivity;
