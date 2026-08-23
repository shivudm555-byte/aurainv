// ==========================================================================
// 2026 Fintech Mobile App - Help Center, FAQ & Tickets (Screen 25)
// ==========================================================================

const MobileSupport = {
  render(container) {
    const tickets = Store.state.tickets || [];

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('profile')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Help Center</h2>
            <span class="subpage-step-indicator">24/7 Priority Support</span>
          </div>
          <button class="header-text-action-btn" onclick="MobileSupport.openCreateTicketSheet()">+ Ticket</button>
        </div>

        <!-- Help Hero Card -->
        <div class="support-hero-card">
          <span class="support-badge">⚡ INSTANT RESOLUTION</span>
          <h3 class="support-title">How can we assist you today?</h3>
          <p class="support-sub">Browse frequently asked questions or open a dedicated support thread with a compliance officer.</p>

          <button class="btn btn-primary btn-full" onclick="MobileSupport.openCreateTicketSheet()">
            <span>💬 Create Support Ticket</span>
          </button>
        </div>

        <!-- FAQ Accordion -->
        <div class="section-header-row" style="margin-top: 20px;">
          <h3 class="section-title">Frequently Asked Questions</h3>
        </div>

        <div class="faq-accordion-group">
          <div class="faq-accordion-item" onclick="MobileSupport.toggleFaq(this)">
            <div class="faq-header">
              <span>How are daily investment accruals calculated?</span>
              <span class="faq-icon">+</span>
            </div>
            <div class="faq-body">
              Accruals are calculated automatically every 24 hours based on your subscribed plan's daily APY rate and posted directly to your double-entry ledger balance.
            </div>
          </div>

          <div class="faq-accordion-item" onclick="MobileSupport.toggleFaq(this)">
            <div class="faq-header">
              <span>What are the withdrawal processing times?</span>
              <span class="faq-icon">+</span>
            </div>
            <div class="faq-body">
              Standard IMPS bank withdrawals under ₹50,000 are settled within 1-5 minutes. High-value withdrawals undergo dual-administrator multi-sign verification.
            </div>
          </div>

          <div class="faq-accordion-item" onclick="MobileSupport.toggleFaq(this)">
            <div class="faq-header">
              <span>Is my capital protected?</span>
              <span class="faq-icon">+</span>
            </div>
            <div class="faq-body">
              All portfolio allocations are backed by segregated institutional assets and monitored 24/7. Investment returns are subject to applicable risk disclosures.
            </div>
          </div>
        </div>

        <!-- My Tickets Feed -->
        <div class="section-header-row" style="margin-top: 20px;">
          <h3 class="section-title">My Support Tickets</h3>
          <span class="section-sub-badge">${tickets.length} Active</span>
        </div>

        <div class="tickets-feed-list">
          ${tickets.map(t => `
            <div class="ticket-card-item" onclick="alert('Ticket conversation thread: ' + '${t.subject}');">
              <div class="ticket-top-row">
                <strong class="ticket-subject">${t.subject}</strong>
                <span class="ticket-status-pill ${t.status.toLowerCase()}">${t.status}</span>
              </div>
              <div class="ticket-meta-row">
                <span>${t.id} • ${t.category}</span>
                <span>Updated ${t.last_updated}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  toggleFaq(element) {
    Haptics.tick();
    element.classList.toggle('open');
    const icon = element.querySelector('.faq-icon');
    if (icon) {
      icon.innerText = element.classList.contains('open') ? '−' : '+';
    }
  },

  openCreateTicketSheet() {
    MobileRouter.openBottomSheet(`
      <div class="create-ticket-sheet-content">
        <h3 style="margin-top: 0;">Create Support Ticket</h3>

        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="ticket-category-select" class="form-input">
            <option value="Billing & Statements">Billing & Statements</option>
            <option value="Deposit & Withdrawal">Deposit & Withdrawal</option>
            <option value="KYC Verification">KYC Verification</option>
            <option value="Investment Strategies">Investment Strategies</option>
            <option value="Security & 2FA">Security & 2FA</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Subject</label>
          <input type="text" id="ticket-subject-input" class="form-input" placeholder="Brief summary of your query" required />
        </div>

        <div class="form-group">
          <label class="form-label">Detailed Message</label>
          <textarea id="ticket-msg-input" class="form-input" rows="3" placeholder="Describe the issue in detail..." required></textarea>
        </div>

        <button class="btn btn-primary btn-full btn-lg" style="margin-top: 16px;" onclick="MobileSupport.submitTicket()">
          <span>Submit Ticket</span> →
        </button>
      </div>
    `, 'New Support Request');
  },

  submitTicket() {
    const subject = document.getElementById('ticket-subject-input').value.trim() || 'General Inquiry';
    const category = document.getElementById('ticket-category-select').value;
    const msg = document.getElementById('ticket-msg-input').value.trim() || '';

    const newTicket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject,
      category: category,
      status: 'Open',
      created_at: new Date().toISOString().split('T')[0],
      last_updated: 'Just now',
      messages: [{ sender: Store.state.currentUser.full_name, text: msg, time: 'Just now' }]
    };

    Store.state.tickets.unshift(newTicket);
    Haptics.success();
    MobileRouter.closeBottomSheet();
    const viewport = document.getElementById('mobile-screen-content');
    this.render(viewport);
    alert('Ticket submitted successfully! Response turnaround is < 15 mins.');
  }
};

window.MobileSupport = MobileSupport;
