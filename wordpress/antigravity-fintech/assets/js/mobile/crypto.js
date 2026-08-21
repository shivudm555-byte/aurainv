// ==========================================================================
// Modular Crypto / VDA Section Controller
// ==========================================================================

const MobileCrypto = {
  async render(container) {
    const user = Store.state.currentUser;
    try {
      const [cfgRes, balRes] = await Promise.all([
        API.get('/api/crypto/config'),
        API.get(`/api/crypto/balances/${user.id}`)
      ]);

      const isEnabled = cfgRes.module_enabled;
      const balances = balRes.balances || [];
      const totalUSD = balRes.total_crypto_value_usd || 0;
      const totalINR = balRes.total_crypto_value_inr || 0;

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800;">Crypto & VDA Vault</h2>
              <span class="badge ${isEnabled ? 'badge-approved' : 'badge-rejected'}">
                ${isEnabled ? 'Modular Gateway Active' : 'Restricted Jurisdiction'}
              </span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="Store.setMobileScreen('crypto_history')">Tx Explorer</button>
          </div>

          <!-- Compliance Notice -->
          <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: var(--radius-md); padding: 12px; font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4;">
            ⚖️ <strong>Compliance & VDA Disclosure:</strong> Virtual Digital Assets are high volatility assets. This module operates as a separate segregated gateway subject to local statutory authorization.
          </div>

          <!-- Portfolio Valuation -->
          <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: var(--radius-lg); padding: 20px; text-align: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Total VDA Valuation</span>
            <div style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; color: #fff; margin: 6px 0;">
              $${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span style="font-size: 0.85rem; color: var(--purple-accent); font-weight: 700;">
              ≈ ₹${totalINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <!-- Supported Assets Grid -->
          <div class="mobile-section-box">
            <div class="section-title-bar">
              <h3>Supported Assets</h3>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${balances.map(b => `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800;">
                      ${b.icon}
                    </div>
                    <div>
                      <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">${b.name} (${b.asset})</strong>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">$${b.price_usd.toLocaleString()} | ₹${b.price_inr.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style="text-align: right;">
                    <strong style="font-size: 0.95rem; color: var(--text-primary);">${b.balance} ${b.asset}</strong>
                    <span style="font-size: 0.75rem; color: var(--primary-light); display: block;">≈ $${b.value_usd.toLocaleString()}</span>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: -4px;">
                  <button class="btn btn-secondary btn-sm" onclick="Store.setMobileScreen('crypto_deposit', '${b.asset}')">
                    Deposit ${b.asset}
                  </button>
                  <button class="btn btn-secondary btn-sm" onclick="Store.setMobileScreen('crypto_withdraw', '${b.asset}')">
                    Withdraw ${b.asset}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading crypto module</p>`;
    }
  },

  async renderDeposit(container, asset = 'USDT') {
    const cfgRes = await API.get('/api/crypto/config');
    const assetCfg = (cfgRes.assets || {})[asset] || cfgRes.assets['USDT'];

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('crypto')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">Deposit ${asset}</h3>
          <span></span>
        </div>

        <div class="form-group">
          <label class="form-label">Select Blockchain Network</label>
          <select id="crypto-network-select" class="form-select" onchange="MobileCrypto.updateDepositAddress('${asset}')">
            ${assetCfg.networks.map(n => `<option value="${n}">${n}</option>`).join('')}
          </select>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px;">
          <!-- QR Code Display -->
          <div style="width: 140px; height: 140px; background: #fff; border-radius: 8px; padding: 8px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 100%; height: 100%; border: 4px solid #0f172a; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 6px;">
              <span style="background: #a855f7;"></span><span style="background: #a855f7;"></span><span></span><span style="background: #a855f7;"></span>
              <span></span><span style="background: #a855f7;"></span><span style="background: #a855f7;"></span><span></span>
              <span style="background: #a855f7;"></span><span></span><span style="background: #a855f7;"></span><span style="background: #a855f7;"></span>
            </div>
          </div>

          <div style="width: 100%;">
            <label class="form-label">Deposit Address</label>
            <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 10px; font-family: monospace; font-size: 0.75rem; word-break: break-all; color: var(--text-primary);">
              ${Object.values(assetCfg.deposit_addresses)[0]}
            </div>
            <button class="btn btn-ghost btn-sm" style="margin-top: 4px; color: var(--primary-light);" onclick="Store.showToast('Deposit address copied to clipboard!', 'info')">
              📋 Copy Address
            </button>
          </div>
        </div>

        <form onsubmit="MobileCrypto.submitDepositTx(event, '${asset}')" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Amount Deposited</label>
            <input type="number" id="crypto-dep-amt" step="any" class="form-input" placeholder="e.g. 500" required />
          </div>

          <div class="form-group">
            <label class="form-label">Blockchain Transaction Hash (TxID)</label>
            <input type="text" id="crypto-dep-hash" class="form-input" placeholder="0x..." />
          </div>

          <button type="submit" class="btn btn-primary btn-lg">Submit Transaction for Confirmation</button>
        </form>
      </div>
    `;
  },

  async submitDepositTx(e, asset) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const network = document.getElementById('crypto-network-select').value;
    const amount = parseFloat(document.getElementById('crypto-dep-amt').value);
    const tx_hash = document.getElementById('crypto-dep-hash').value;

    try {
      const res = await API.post('/api/crypto/deposit', {
        user_id: user.id,
        asset,
        network,
        amount,
        tx_hash
      });

      if (res.success) {
        Store.showToast(res.message, 'success', 'Deposit Tracked');
        Store.setMobileScreen('crypto_history');
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  async renderWithdraw(container, asset = 'USDT') {
    const cfgRes = await API.get('/api/crypto/config');
    const assetCfg = (cfgRes.assets || {})[asset] || cfgRes.assets['USDT'];

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('crypto')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">Withdraw ${asset}</h3>
          <span></span>
        </div>

        <form onsubmit="MobileCrypto.submitWithdrawTx(event, '${asset}')" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Network</label>
            <select id="crypto-with-network" class="form-select">
              ${assetCfg.networks.map(n => `<option value="${n}">${n}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Recipient ${asset} Address</label>
            <input type="text" id="crypto-dest-addr" class="form-input" placeholder="Enter recipient wallet address" required />
          </div>

          <div class="form-group">
            <label class="form-label">Withdrawal Amount</label>
            <input type="number" id="crypto-with-amt" step="any" class="form-input" placeholder="Min: ${assetCfg.min_withdraw} ${asset}" required />
          </div>

          <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 12px; font-size: 0.8rem; display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Estimated Network Gas Fee:</span>
            <strong>${assetCfg.withdraw_fee} ${asset}</strong>
          </div>

          <button type="submit" class="btn btn-primary btn-lg">Authorize & Broadcast Payout</button>
        </form>
      </div>
    `;
  },

  async submitWithdrawTx(e, asset) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const network = document.getElementById('crypto-with-network').value;
    const destination_address = document.getElementById('crypto-dest-addr').value;
    const amount = parseFloat(document.getElementById('crypto-with-amt').value);

    try {
      const res = await API.post('/api/crypto/withdraw', {
        user_id: user.id,
        asset,
        network,
        destination_address,
        amount
      });

      if (res.success) {
        Store.showToast(res.message, 'success', 'Broadcast Successful');
        await Store.refreshAllData();
        Store.setMobileScreen('crypto_history');
      }
    } catch (err) {
      Store.showToast(err.message, 'error', 'Withdrawal Error');
    }
  },

  async renderHistory(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/crypto/history/${user.id}`);
      const txs = res.transactions || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('crypto')">←</button>
            <h3 style="font-size: 1rem; font-weight: 700;">Blockchain Tx Explorer</h3>
            <span></span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${txs.length === 0 ? `
              <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 20px;">No crypto transactions recorded.</p>
            ` : `
              ${txs.map(t => `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">${t.tx_type} ${t.amount} ${t.asset}</strong>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${t.network}</span>
                    <span style="font-size: 0.65rem; color: var(--primary-light); font-family: monospace; display: block;">TxHash: ${t.tx_hash.slice(0, 16)}...</span>
                  </div>
                  <div style="text-align: right;">
                    <span class="badge ${t.status === 'completed' ? 'badge-approved' : 'badge-pending'}">${t.status}</span>
                    <span style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 4px;">${t.confirmations}/${t.required_confirmations} Confs</span>
                  </div>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading history</p>`;
    }
  }
};
