// ==========================================================================
// Mobile Help Center & Support Tickets Controller
// ==========================================================================

const MobileSupport = {
  async renderHelpCenter(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('profile')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">Help & Support</h3>
          <span></span>
        </div>

        <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-md); padding: 16px;">
          <h4 style="font-size: 1rem; font-weight: 800; color: #fff;">How can we assist you?</h4>
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Our 24/7 dedicated support desk is ready to assist with deposits, KYC, or investment inquiries.</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button class="btn btn-secondary btn-lg" onclick="Store.setMobileScreen('faq')">
            📚 Browse FAQ
          </button>
          <button class="btn btn-primary btn-lg" onclick="Store.setMobileScreen('support_tickets')">
            🎫 My Tickets
          </button>
        </div>

        <div class="mobile-section-box">
          <div class="section-title-bar">
            <h3>Quick FAQ Highlights</h3>
          </div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem;">
            <strong style="color: var(--text-primary);">When are daily earnings calculated?</strong>
            <p style="color: var(--text-secondary); font-size: 0.8rem;">Daily returns are automatically accrued every 24 hours from the time your investment subscription becomes active.</p>
          </div>
        </div>
      </div>
    `;
  },

  async renderFAQ(container) {
    try {
      const res = await API.get('/api/support/faqs');
      const faqs = res.faqs || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('help_center')">←</button>
            <h3 style="font-size: 1rem; font-weight: 700;">Frequently Asked Questions</h3>
            <span></span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${faqs.map((f, idx) => `
              <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; display: flex; flex-direction: column; gap: 6px;">
                <strong style="font-size: 0.85rem; color: var(--text-primary);">${f.question}</strong>
                <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">${f.answer}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading FAQ</p>`;
    }
  },

  async renderTickets(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/support/tickets/${user.id}`);
      const tickets = res.tickets || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('help_center')">←</button>
            <h3 style="font-size: 1rem; font-weight: 700;">Support Desk</h3>
            <button class="btn btn-primary btn-sm" onclick="MobileSupport.openCreateTicketModal()">＋ New Ticket</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${tickets.length === 0 ? `
              <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 20px;">No support tickets created.</p>
            ` : `
              ${tickets.map(t => `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="Store.setMobileScreen('ticket_chat', ${t.id})">
                  <div>
                    <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">${t.subject}</strong>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">Ref: ${t.ticket_code} • ${new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                  <span class="badge ${t.status === 'resolved' ? 'badge-approved' : t.status === 'in_progress' ? 'badge-pending' : 'badge-pending'}">
                    ${t.status.replace(/_/g, ' ')}
                  </span>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading tickets</p>`;
    }
  },

  openCreateTicketModal() {
    const modalHTML = `
      <div id="create-ticket-modal" class="mobile-modal-overlay open">
        <div class="mobile-bottom-sheet">
          <div class="sheet-drag-handle"></div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 1.1rem; font-weight: 800;">Submit Support Request</h3>
            <button class="icon-btn" onclick="document.getElementById('create-ticket-modal').remove()">✕</button>
          </div>

          <form onsubmit="MobileSupport.submitTicket(event)" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Subject</label>
              <input type="text" id="tck-subject" class="form-input" placeholder="e.g. Question on Liquid Growth compounding" required />
            </div>

            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="tck-category" class="form-select">
                <option value="investment">Investment Plans</option>
                <option value="deposit">Deposit & Payment Gateway</option>
                <option value="withdrawal">Withdrawal & Banking</option>
                <option value="kyc">KYC & Compliance</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Message Details</label>
              <textarea id="tck-msg" class="form-textarea" rows="3" placeholder="Please describe your inquiry..." required></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 6px;">Submit Ticket</button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async submitTicket(e) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const subject = document.getElementById('tck-subject').value;
    const category = document.getElementById('tck-category').value;
    const message = document.getElementById('tck-msg').value;

    try {
      const res = await API.post('/api/support/tickets', {
        user_id: user.id,
        subject,
        category,
        message
      });

      if (res.success) {
        document.getElementById('create-ticket-modal')?.remove();
        Store.showToast('Support ticket created successfully!', 'success');
        Store.setMobileScreen('ticket_chat', res.ticket_id);
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  async renderTicketChat(container, ticketId) {
    try {
      const res = await API.get(`/api/support/tickets/${ticketId}/messages`);
      const ticket = res.ticket;
      const messages = res.messages || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; gap: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('support_tickets')">←</button>
            <div>
              <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">${ticket.subject}</strong>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${ticket.ticket_code} • ${ticket.status}</span>
            </div>
            <span></span>
          </div>

          <!-- Messages Thread -->
          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 4px;">
            ${messages.map(m => `
              <div style="display: flex; flex-direction: column; align-self: ${m.sender_type === 'user' ? 'flex-end' : 'flex-start'}; max-width: 80%;">
                <span style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 2px; align-self: ${m.sender_type === 'user' ? 'flex-end' : 'flex-start'};">
                  ${m.sender_name} • ${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div style="background: ${m.sender_type === 'user' ? 'var(--primary)' : 'var(--bg-card)'}; color: ${m.sender_type === 'user' ? '#fff' : 'var(--text-primary)'}; border: 1px solid ${m.sender_type === 'user' ? 'transparent' : 'var(--border-color)'}; border-radius: 14px; padding: 10px 14px; font-size: 0.85rem; line-height: 1.4;">
                  ${m.message}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Reply Input -->
          <form onsubmit="MobileSupport.sendUserReply(event, ${ticketId})" style="display: flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 10px;">
            <input type="text" id="ticket-reply-input" class="form-input" placeholder="Type your response..." required style="flex: 1;" />
            <button type="submit" class="btn btn-primary btn-sm">Send</button>
          </form>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading ticket chat</p>`;
    }
  },

  async sendUserReply(e, ticketId) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const input = document.getElementById('ticket-reply-input');
    const msg = input.value;

    try {
      await API.post(`/api/support/tickets/${ticketId}/messages`, {
        sender_type: 'user',
        sender_name: user.full_name,
        message: msg
      });
      this.renderTicketChat(document.getElementById('mobile-screen-content'), ticketId);
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  }
};
