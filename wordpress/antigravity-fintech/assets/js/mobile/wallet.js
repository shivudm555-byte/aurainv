// ==========================================================================
// Mobile Wallet, Deposit, Withdrawal & Transactions Controller
// ==========================================================================

const MobileWallet = {
  async render(container) {
    const user = Store.state.currentUser;
    await Store.refreshAllData();
    const wallet = Store.state.wallet || {
      cash_balance: 0,
      invested_balance: 0,
      accrued_balance: 0,
      total_portfolio: 0
    };

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800;">My Wallet</h2>
          <button class="btn btn-secondary btn-sm" onclick="Store.setMobileScreen('transactions')">Ledger History</button>
        </div>

        <!-- Wallet Card -->
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid var(--border-accent); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-glow);">
          <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Available Cash Balance</span>
          <div style="font-family: var(--font-display); font-size: 2.1rem; font-weight: 900; color: var(--text-primary); margin: 6px 0 16px 0;">
            ₹${wallet.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <button class="btn btn-primary btn-lg" onclick="Store.setMobileScreen('deposit')">
              ＋ Deposit Funds
            </button>
            <button class="btn btn-secondary btn-lg" onclick="Store.setMobileScreen('withdrawal')">
              ⤓ Withdraw
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--border-color); padding-top: 14px; gap: 10px;">
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Locked in Investments</span>
              <strong style="font-size: 1rem; color: var(--text-primary); display: block;">₹${wallet.invested_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Accrued Yield</span>
              <strong style="font-size: 1rem; color: var(--primary-light); display: block;">+₹${wallet.accrued_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; cursor: pointer;" onclick="Store.setMobileScreen('deposit_history')">
            <span style="font-size: 1.3rem;">📥</span>
            <strong style="font-size: 0.85rem; color: var(--text-primary); display: block; margin-top: 6px;">Deposit History</strong>
            <span style="font-size: 0.7rem; color: var(--text-muted);">View all bank & UPI deposits</span>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; cursor: pointer;" onclick="Store.setMobileScreen('withdrawal_history')">
            <span style="font-size: 1.3rem;">📤</span>
            <strong style="font-size: 0.85rem; color: var(--text-primary); display: block; margin-top: 6px;">Withdrawal Status</strong>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Track payout authorizations</span>
          </div>
        </div>

        <!-- Linked Bank Account Preview -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <strong style="font-size: 0.85rem; color: var(--text-primary);">Linked Bank Account</strong>
            <span class="badge badge-approved">Penny-Drop Verified</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 38px; height: 38px; border-radius: var(--radius-sm); background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
              🏦
            </div>
            <div>
              <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">HDFC Bank Ltd</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">A/C •••••••••5890 | IFSC: HDFC0001234</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderDeposit(container, params = null) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('wallet')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">Deposit Funds</h3>
          <span></span>
        </div>

        <!-- Payment Method Tabs -->
        <div class="form-group">
          <label class="form-label">Select Payment Method</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <button id="dep-tab-upi" class="btn btn-primary btn-sm" onclick="MobileWallet.switchDepositMethod('UPI')">UPI / QR</button>
            <button id="dep-tab-bank" class="btn btn-secondary btn-sm" onclick="MobileWallet.switchDepositMethod('BANK')">Bank IMPS</button>
            <button id="dep-tab-gateway" class="btn btn-secondary btn-sm" onclick="MobileWallet.switchDepositMethod('GATEWAY')">Gateway</button>
          </div>
        </div>

        <form id="deposit-action-form" onsubmit="MobileWallet.handleDepositSubmit(event)" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Deposit Amount (INR)</label>
            <input type="number" id="deposit-amount-input" class="form-input" placeholder="e.g. 50000" min="500" value="25000" required />
          </div>

          <div id="deposit-method-details" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;">
            <div style="width: 140px; height: 140px; background: #ffffff; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <!-- Simulated QR Code -->
              <div style="width: 100%; height: 100%; border: 4px solid #0f172a; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 6px;">
                <span style="background: #0f172a;"></span><span style="background: #0f172a;"></span><span></span><span style="background: #0f172a;"></span>
                <span></span><span style="background: #0f172a;"></span><span style="background: #0f172a;"></span><span></span>
                <span style="background: #0f172a;"></span><span></span><span style="background: #0f172a;"></span><span style="background: #0f172a;"></span>
                <span style="background: #0f172a;"></span><span style="background: #0f172a;"></span><span></span><span style="background: #0f172a;"></span>
              </div>
            </div>

            <div>
              <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">UPI VPA: antigravity@hdfcbank</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Scan QR using PhonePe, GPay, Paytm, or BHIM</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">UTR / Bank Reference Number</label>
            <input type="text" id="deposit-utr-input" class="form-input" placeholder="e.g. UPI/20260819/987654321" value="UPI/20260819/776655443" required />
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-tertiary); padding: 10px 14px; border-radius: var(--radius-sm);">
            <div>
              <strong style="font-size: 0.8rem; color: var(--text-primary); display: block;">⚡ Instant Prototype Credit</strong>
              <span style="font-size: 0.7rem; color: var(--text-muted);">Credit immediately vs place in Admin pending queue</span>
            </div>
            <input type="checkbox" id="auto-approve-toggle" checked style="width: 18px; height: 18px; accent-color: var(--primary);" />
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 6px;">Submit Deposit Request</button>
        </form>
      </div>
    `;
  },

  switchDepositMethod(method) {
    const details = document.getElementById('deposit-method-details');
    if (!details) return;

    ['upi', 'bank', 'gateway'].forEach(m => {
      const btn = document.getElementById(`dep-tab-${m}`);
      if (btn) btn.className = `btn btn-${m === method.toLowerCase() ? 'primary' : 'secondary'} btn-sm`;
    });

    if (method === 'BANK') {
      details.innerHTML = `
        <div style="text-align: left; width: 100%; display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem;">
          <strong style="font-size: 0.85rem; color: var(--text-primary);">Beneficiary Bank Account Details:</strong>
          <div><strong>Bank:</strong> HDFC Bank Ltd</div>
          <div><strong>Account Name:</strong> Antigravity Global Financial Services Pvt Ltd</div>
          <div><strong>Account Number:</strong> 50200088991122</div>
          <div><strong>IFSC Code:</strong> HDFC0001234</div>
          <div><strong>Account Type:</strong> Current Account</div>
        </div>
      `;
    } else if (method === 'GATEWAY') {
      details.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <span style="font-size: 2rem;">🔒</span>
          <strong style="font-size: 0.85rem; color: var(--text-primary);">Secured Card & NetBanking Gateway</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Simulated instant payment gateway router</span>
        </div>
      `;
    } else {
      details.innerHTML = `
        <div style="width: 140px; height: 140px; background: #ffffff; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 100%; height: 100%; border: 4px solid #0f172a; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 6px;">
            <span style="background: #0f172a;"></span><span style="background: #0f172a;"></span><span></span><span style="background: #0f172a;"></span>
            <span></span><span style="background: #0f172a;"></span><span style="background: #0f172a;"></span><span></span>
            <span style="background: #0f172a;"></span><span></span><span style="background: #0f172a;"></span><span style="background: #0f172a;"></span>
            <span style="background: #0f172a;"></span><span style="background: #0f172a;"></span><span></span><span style="background: #0f172a;"></span>
          </div>
        </div>
        <div>
          <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">UPI VPA: antigravity@hdfcbank</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Scan QR using PhonePe, GPay, Paytm, or BHIM</span>
        </div>
      `;
    }
  },

  async handleDepositSubmit(e) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const amount = parseFloat(document.getElementById('deposit-amount-input').value);
    const utr_ref = document.getElementById('deposit-utr-input').value;
    const auto_approve = document.getElementById('auto-approve-toggle').checked;

    try {
      const res = await API.post('/api/wallet/deposit', {
        user_id: user.id,
        amount,
        payment_method: 'UPI',
        utr_ref,
        auto_approve
      });

      if (res.success) {
        Store.showToast(res.message, 'success', 'Deposit Submitted');
        await Store.refreshAllData();
        Store.setMobileScreen('wallet');
      }
    } catch (err) {
      Store.showToast(err.message, 'error', 'Deposit Error');
    }
  },

  async renderDepositHistory(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/wallet/deposit/history/${user.id}`);
      const deposits = res.deposits || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('wallet')">←</button>
            <h3 style="font-size: 1rem; font-weight: 700;">Deposit History</h3>
            <span></span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${deposits.length === 0 ? `
              <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 20px;">No deposit transactions found.</p>
            ` : `
              ${deposits.map(d => `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">${d.payment_method} Deposit</strong>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">Ref: ${d.utr_ref}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">${new Date(d.created_at).toLocaleString()}</span>
                  </div>
                  <div style="text-align: right;">
                    <strong style="font-size: 0.95rem; color: var(--primary-light);">+₹${d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    <span class="badge ${d.status === 'approved' ? 'badge-approved' : d.status === 'pending' ? 'badge-pending' : 'badge-rejected'}" style="display: block; margin-top: 4px;">
                      ${d.status}
                    </span>
                  </div>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading deposit history</p>`;
    }
  },

  async renderWithdrawal(container) {
    const user = Store.state.currentUser;
    await Store.refreshAllData();
    const wallet = Store.state.wallet || { cash_balance: 0 };

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('wallet')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">Request Withdrawal</h3>
          <button class="btn btn-ghost btn-sm" onclick="Store.setMobileScreen('withdrawal_history')">Status</button>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">Available for Withdrawal:</span>
          <strong style="font-size: 1.1rem; color: var(--primary-light);">₹${wallet.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
        </div>

        <!-- High Value Dual Approval Rule Alert -->
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 0.75rem; color: var(--text-secondary);">
          ⚠️ <strong>Dual-Admin Risk Control:</strong> Withdrawals of ₹50,000 or greater enforce dual-authorization (Finance Admin + Operations/Super Admin) before bank disbursement.
        </div>

        <form id="withdrawal-form" onsubmit="MobileWallet.handleWithdrawalSubmit(event)" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Beneficiary Bank Account</label>
            <select id="wdl-bank-select" class="form-select">
              <option value="HDFC">HDFC Bank Ltd (••••••••5890)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Withdrawal Amount (INR)</label>
            <input type="number" id="wdl-amount-input" class="form-input" placeholder="Min ₹500" value="10000" min="500" max="${wallet.cash_balance}" oninput="MobileWallet.calcWithdrawalFee()" required />
          </div>

          <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 12px; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Platform Processing Fee (1%):</span>
              <span id="wdl-fee-text" style="color: var(--danger-light);">₹100.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 6px;">
              <strong style="color: var(--text-primary);">Net Amount Credited:</strong>
              <strong id="wdl-net-text" style="color: var(--primary-light);">₹9,900.00</strong>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Enter 4-digit Transaction PIN</label>
            <input type="password" id="wdl-pin-input" maxlength="4" class="form-input" style="letter-spacing: 6px; text-align: center; font-size: 1.2rem; font-weight: 800;" placeholder="••••" value="1234" required />
          </div>

          <button type="submit" class="btn btn-primary btn-lg">Submit Withdrawal Request</button>
        </form>
      </div>
    `;
  },

  calcWithdrawalFee() {
    const amtInput = document.getElementById('wdl-amount-input');
    const feeEl = document.getElementById('wdl-fee-text');
    const netEl = document.getElementById('wdl-net-text');
    if (!amtInput || !feeEl || !netEl) return;

    const amt = parseFloat(amtInput.value) || 0;
    const fee = amt * 0.01;
    const net = Math.max(0, amt - fee);

    feeEl.innerText = `₹${fee.toFixed(2)}`;
    netEl.innerText = `₹${net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  async handleWithdrawalSubmit(e) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const amount = parseFloat(document.getElementById('wdl-amount-input').value);
    const pin = document.getElementById('wdl-pin-input').value;

    try {
      const res = await API.post('/api/wallet/withdraw', {
        user_id: user.id,
        amount,
        payout_method: 'BANK_TRANSFER',
        destination_details: { bank: 'HDFC Bank', account: '••••••••5890' },
        pin
      });

      if (res.success) {
        Store.showToast(res.message, 'success', 'Withdrawal Request Placed');
        await Store.refreshAllData();
        Store.setMobileScreen('withdrawal_history');
      }
    } catch (err) {
      Store.showToast(err.message, 'error', 'Withdrawal Error');
    }
  },

  async renderWithdrawalHistory(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/wallet/withdraw/history/${user.id}`);
      const withdrawals = res.withdrawals || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('wallet')">←</button>
            <h3 style="font-size: 1rem; font-weight: 700;">Withdrawal History</h3>
            <span></span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${withdrawals.length === 0 ? `
              <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 20px;">No withdrawal records found.</p>
            ` : `
              ${withdrawals.map(w => `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">Withdrawal ${w.withdrawal_code}</strong>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">Net: ₹${w.net_amount.toLocaleString('en-IN')} (Fee: ₹${w.fee})</span>
                    ${w.requires_dual_approval ? `<span class="badge badge-pending" style="font-size: 0.65rem; margin-top: 2px;">Dual Admin Required</span>` : ''}
                  </div>
                  <div style="text-align: right;">
                    <strong style="font-size: 0.95rem; color: var(--text-primary);">₹${w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    <span class="badge ${w.status === 'completed' ? 'badge-approved' : w.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}" style="display: block; margin-top: 4px;">
                      ${w.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading withdrawals</p>`;
    }
  },

  async renderTransactions(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/wallet/transactions/${user.id}`);
      const txs = res.transactions || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800;">Transaction Ledger</h2>
            <button class="btn btn-secondary btn-sm" onclick="Store.setMobileScreen('wallet')">Wallet</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${txs.map(tx => {
              const isCredit = tx.credit_amount > 0;
              const amt = isCredit ? tx.credit_amount : tx.debit_amount;
              return `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="MobileWallet.showReceiptModal('${tx.transaction_id}', '${tx.transaction_type}', ${amt}, ${isCredit}, '${tx.created_at}', '${tx.description}', ${tx.balance_after})">
                  <div>
                    <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">${tx.description}</strong>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">TxID: ${tx.transaction_id} | ${new Date(tx.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style="text-align: right;">
                    <strong style="font-size: 0.95rem; color: ${isCredit ? 'var(--primary-light)' : 'var(--text-primary)'};">
                      ${isCredit ? '+' : '-'}₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </strong>
                    <span style="display: block; font-size: 0.65rem; color: var(--text-muted);">Bal: ₹${tx.balance_after.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading transactions</p>`;
    }
  },

  showReceiptModal(txId, type, amount, isCredit, date, desc, balanceAfter) {
    const modalHTML = `
      <div id="receipt-modal-overlay" class="admin-modal-overlay open" onclick="if(event.target === this) this.remove()">
        <div class="receipt-card" style="width: 340px; margin: auto;">
          <div class="receipt-header">
            <h4 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 800;">ANTIGRAVITY FINANCE</h4>
            <span style="font-size: 0.7rem; color: #64748b;">Official Financial Ledger Receipt</span>
          </div>

          <div class="receipt-amount-box">
            <span style="font-size: 0.7rem; color: #64748b; text-transform: uppercase;">Transaction Amount</span>
            <div style="font-size: 1.5rem; font-weight: 900; color: ${isCredit ? '#059669' : '#0f172a'};">
              ${isCredit ? '+' : '-'}₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div class="receipt-row">
              <span style="color: #64748b;">Transaction Type:</span>
              <strong>${type.replace(/_/g, ' ')}</strong>
            </div>
            <div class="receipt-row">
              <span style="color: #64748b;">Ledger TxID:</span>
              <strong style="font-family: monospace; font-size: 0.75rem;">${txId}</strong>
            </div>
            <div class="receipt-row">
              <span style="color: #64748b;">Description:</span>
              <span style="text-align: right; max-width: 180px; font-weight: 600;">${desc}</span>
            </div>
            <div class="receipt-row">
              <span style="color: #64748b;">Timestamp:</span>
              <span>${new Date(date).toLocaleString()}</span>
            </div>
            <div class="receipt-row">
              <span style="color: #64748b;">Balance After:</span>
              <strong>₹${balanceAfter.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <button class="btn btn-secondary btn-sm" style="margin-top: 10px;" onclick="document.getElementById('receipt-modal-overlay').remove()">
            Close Receipt
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
};
