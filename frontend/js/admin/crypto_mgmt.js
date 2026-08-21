// ==========================================================================
// Admin Crypto & VDA Management Controller
// ==========================================================================

const AdminCrypto = {
  async render(container) {
    try {
      const cfgRes = await API.get('/api/crypto/config');
      const assets = cfgRes.assets || {};
      const isEnabled = cfgRes.module_enabled;

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>Crypto & VDA Administration</h2>
            <p>Configure supported tokens, multi-network gas thresholds, and blockchain monitoring</p>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 0.85rem; font-weight: 700;">Module Master Switch:</span>
            <label class="switch">
              <input type="checkbox" id="crypto-master-switch" ${isEnabled ? 'checked' : ''} onchange="AdminCrypto.toggleMasterSwitch(this.checked)">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- Compliance & Authorization Disclaimer -->
        <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: var(--radius-md); padding: 14px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
          ⚖️ <strong>Regulatory Guardrail:</strong> The platform maintains crypto operations strictly through segregated custodial reserves. Token configurations reflect on-chain liquidity parameters.
        </div>

        <div class="admin-table-container">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Oracle Price (USD)</th>
                <th>Oracle Price (INR)</th>
                <th>Supported Networks</th>
                <th>Min Deposit</th>
                <th>Withdrawal Gas Fee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(assets).map(([sym, a]) => `
                <tr>
                  <td>
                    <strong>${a.name} (${sym})</strong>
                  </td>
                  <td><strong>$${a.price_usd.toLocaleString()}</strong></td>
                  <td><strong>₹${a.price_inr.toLocaleString()}</strong></td>
                  <td>${a.networks.map(n => `<span class="badge badge-approved" style="font-size: 0.65rem; margin-right: 4px;">${n}</span>`).join('')}</td>
                  <td>${a.min_deposit} ${sym}</td>
                  <td style="color: var(--danger-light);">${a.withdraw_fee} ${sym}</td>
                  <td><span class="badge badge-approved">Active</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading crypto admin</p>`;
    }
  },

  async toggleMasterSwitch(enabled) {
    try {
      await API.put('/api/admin/settings', {
        crypto_module_enabled: enabled ? 'true' : 'false'
      });
      Store.showToast(`Crypto VDA Module ${enabled ? 'Enabled' : 'Disabled'} globally`, 'info');
      await Store.refreshAllData();
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  }
};
