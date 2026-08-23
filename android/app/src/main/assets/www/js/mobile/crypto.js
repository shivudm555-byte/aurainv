// ==========================================================================
// 2026 Fintech Mobile App - Digital Assets & VDA Cold Wallet (Screens 18, 19)
// ==========================================================================

const MobileCrypto = {
  selectedAsset: null,

  // ==========================================================================
  // Screen 18: DIGITAL ASSETS HUB
  // ==========================================================================
  render(container) {
    const assets = Store.state.cryptoAssets || [];
    const totalCryptoValue = assets.reduce((sum, a) => sum + (a.value_inr || 0), 0);

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Digital Assets</h2>
            <span class="subpage-step-indicator">Virtual Digital Assets (VDA)</span>
          </div>
          <button class="header-icon-btn" onclick="Haptics.tick(); alert('Real-time price feeds updated from institutional oracle.');" title="Refresh Oracles">🔄</button>
        </div>

        <!-- Total Crypto Portfolio Card -->
        <div class="crypto-hero-card">
          <span class="crypto-val-label">Digital Assets Portfolio</span>
          <h1 class="crypto-big-number">₹${totalCryptoValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h1>
          <div class="crypto-gain-pill">
            <span>+2.45% 24h Oracle Delta</span>
          </div>
        </div>

        <!-- Asset Cards Feed -->
        <div class="section-header-row" style="margin-top: 18px;">
          <h3 class="section-title">Supported Assets</h3>
          <span class="section-sub-badge">Cold Storage Rails</span>
        </div>

        <div class="crypto-assets-list">
          ${assets.map(asset => `
            <div class="crypto-asset-card" onclick="Store.setMobileScreen('crypto_wallet', { symbol: '${asset.symbol}' })">
              <div class="crypto-card-left">
                <div class="asset-logo-circle">
                  <img src="${asset.logo}" alt="${asset.symbol}" class="asset-logo-img" />
                </div>
                <div class="asset-info">
                  <div class="asset-name-row">
                    <strong>${asset.name}</strong>
                    <span class="asset-symbol">${asset.symbol}</span>
                  </div>
                  <span class="asset-price">₹${asset.price_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div class="crypto-card-right">
                <strong class="asset-holding-val">₹${asset.value_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                <span class="asset-delta ${asset.change_24h >= 0 ? 'positive' : 'negative'}">
                  ${asset.change_24h >= 0 ? '+' : ''}${asset.change_24h}%
                </span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Regulatory Notice -->
        <div class="regulatory-disclaimer-box" style="margin-top: 20px;">
          <span class="disclaimer-icon">🛡️</span>
          <p class="disclaimer-text">
            <strong>Notice:</strong> Digital asset services are subject to jurisdictional compliance, AML verification, and local tax frameworks. Testnet simulated rails active for prototype.
          </p>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // Screen 19: DIGITAL ASSET WALLET & ON-CHAIN ACTIONS
  // ==========================================================================
  renderWallet(container, params = {}) {
    const symbol = params.symbol || 'USDT';
    const asset = (Store.state.cryptoAssets || []).find(a => a.symbol === symbol) || Store.state.cryptoAssets[0];
    this.selectedAsset = asset;

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('crypto')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">${asset.name} Wallet</h2>
            <span class="subpage-step-indicator">${asset.symbol} • ${asset.network}</span>
          </div>
          <div></div>
        </div>

        <!-- Asset Balance Card -->
        <div class="crypto-details-hero">
          <div class="asset-large-logo">
            <img src="${asset.logo}" alt="${asset.symbol}" />
          </div>
          <span class="asset-holdings-count">${asset.holdings} ${asset.symbol}</span>
          <h2 class="asset-inr-valuation">₹${asset.value_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>

          <div class="crypto-action-buttons-row">
            <button class="btn btn-primary btn-full" onclick="MobileCrypto.openDepositSheet()">
              <span>↓ Receive / Deposit</span>
            </button>
            <button class="btn btn-secondary btn-full" onclick="MobileCrypto.openWithdrawSheet()">
              <span>↑ Send / Withdraw</span>
            </button>
          </div>
        </div>

        <!-- Wallet Address Box -->
        <div class="section-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 class="section-card-title" style="margin: 0;">Dedicated Deposit Address</h4>
            <span class="badge-verified">Cold Storage</span>
          </div>
          <div class="crypto-address-copy-box" style="margin-top: 10px;">
            <span class="address-string">${asset.wallet_address}</span>
            <button class="copy-icon-btn" onclick="Haptics.success(); alert('Wallet address copied to clipboard!');">📋</button>
          </div>
          <small style="color: var(--text-muted); display: block; margin-top: 6px;">Only deposit ${asset.symbol} via ${asset.network} network.</small>
        </div>

        <!-- Network Specifications -->
        <div class="section-card">
          <h4 class="section-card-title">Network Specs</h4>
          <div class="summary-table-row">
            <span>Blockchain</span>
            <strong>${asset.network}</strong>
          </div>
          <div class="summary-table-row">
            <span>Oracle Price</span>
            <strong>₹${asset.price_inr.toLocaleString('en-IN')}</strong>
          </div>
          <div class="summary-table-row">
            <span>24h Change</span>
            <strong style="color: ${asset.change_24h >= 0 ? '#10B981' : '#EF4444'};">${asset.change_24h}%</strong>
          </div>
        </div>
      </div>
    `;
  },

  openDepositSheet() {
    const asset = this.selectedAsset;
    MobileRouter.openBottomSheet(`
      <div class="crypto-deposit-sheet-content">
        <h3 style="margin-top: 0;">Receive ${asset.name} (${asset.symbol})</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem;">Scan QR code or copy address to deposit funds.</p>

        <div class="mock-upi-qr-card" style="margin: 16px auto;">
          <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" fill="white" rx="8"/>
            <rect x="10" y="10" width="25" height="25" fill="#0A0E1A"/>
            <rect x="15" y="15" width="15" height="15" fill="white"/>
            <rect x="18" y="18" width="9" height="9" fill="#0A0E1A"/>
            <rect x="65" y="10" width="25" height="25" fill="#0A0E1A"/>
            <rect x="70" y="15" width="15" height="15" fill="white"/>
            <rect x="73" y="18" width="9" height="9" fill="#0A0E1A"/>
            <rect x="10" y="65" width="25" height="25" fill="#0A0E1A"/>
            <rect x="15" y="70" width="15" height="15" fill="white"/>
            <rect x="18" y="73" width="9" height="9" fill="#0A0E1A"/>
            <rect x="42" y="42" width="16" height="16" fill="#A855F7"/>
            <path d="M40 15h15v5h-15z M45 25h10v10h-10z M15 45h10v10h-10z M40 65h10v15h-10z M65 45h20v5h-20z" fill="#0A0E1A"/>
          </svg>
        </div>

        <div class="crypto-address-copy-box">
          <span class="address-string">${asset.wallet_address}</span>
          <button class="copy-icon-btn" onclick="Haptics.success(); alert('Address copied!');">📋</button>
        </div>

        <button class="btn btn-primary btn-full btn-lg" style="margin-top: 18px;" onclick="MobileRouter.closeBottomSheet();">
          Done
        </button>
      </div>
    `, `Deposit ${asset.symbol}`);
  },

  openWithdrawSheet() {
    const asset = this.selectedAsset;
    MobileRouter.openBottomSheet(`
      <div class="crypto-withdraw-sheet-content">
        <h3 style="margin-top: 0;">Send ${asset.name}</h3>

        <div class="form-group">
          <label class="form-label">Recipient Wallet Address</label>
          <input type="text" id="crypto-dest-address" class="form-input" placeholder="Enter ${asset.network} address" required />
        </div>

        <div class="form-group">
          <label class="form-label">Amount (${asset.symbol})</label>
          <input type="number" id="crypto-send-amt" class="form-input" placeholder="0.00" max="${asset.holdings}" required />
          <small style="color: var(--text-muted);">Available: ${asset.holdings} ${asset.symbol}</small>
        </div>

        <div class="summary-table-row" style="margin-top: 10px;">
          <span>Network Gas Fee</span>
          <strong style="color: #00F0FF;">0.50 USDT (Simulated)</strong>
        </div>

        <button class="btn btn-primary btn-full btn-lg" style="margin-top: 18px;" onclick="Haptics.success(); alert('Testnet blockchain transaction broadcasted!'); MobileRouter.closeBottomSheet();">
          <span>Broadcast Transaction</span> →
        </button>
      </div>
    `, `Send ${asset.symbol}`);
  }
};

window.MobileCrypto = MobileCrypto;
