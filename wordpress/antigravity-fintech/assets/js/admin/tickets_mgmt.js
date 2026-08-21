// ==========================================================================
// Admin Support Tickets Desk Controller
// ==========================================================================

const AdminTickets = {
  async render(container) {
    try {
      const res = await API.get('/api/support/tickets/5'); // or all tickets
      const tickets = res.tickets || [];

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>Support Ticket Helpdesk</h2>
            <p>Respond to customer inquiries regarding deposits, KYC, and investments</p>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Ticket Code</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.map(t => `
                <tr>
                  <td><strong>${t.ticket_code}</strong></td>
                  <td><strong>${t.subject}</strong></td>
                  <td><span class="badge badge-approved">${t.category}</span></td>
                  <td><span class="badge badge-pending">${t.priority}</span></td>
                  <td>${new Date(t.created_at).toLocaleString()}</td>
                  <td><span class="badge ${t.status === 'resolved' ? 'badge-approved' : 'badge-pending'}">${t.status}</span></td>
                  <td>
                    <button class="btn btn-primary btn-sm" onclick="AdminTickets.openTicketChat(${t.id})">
                      Open Conversation
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading support desk</p>`;
    }
  },

  async openTicketChat(ticketId) {
    try {
      const res = await API.get(`/api/support/tickets/${ticketId}/messages`);
      const ticket = res.ticket;
      const messages = res.messages || [];

      const modalHTML = `
        <div id="admin-ticket-modal" class="admin-modal-overlay open" onclick="if(event.target === this) this.remove()">
          <div class="admin-modal-card" style="height: 580px;">
            <div class="modal-header-row">
              <div>
                <h3>${ticket.subject}</h3>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${ticket.ticket_code} • ${ticket.category}</span>
              </div>
              <button class="icon-btn" onclick="document.getElementById('admin-ticket-modal').remove()">✕</button>
            </div>

            <!-- Messages Stream -->
            <div id="admin-chat-messages" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: var(--bg-tertiary); padding: 14px; border-radius: var(--radius-sm);">
              ${messages.map(m => `
                <div style="display: flex; flex-direction: column; align-self: ${m.sender_type === 'admin' ? 'flex-end' : 'flex-start'}; max-width: 75%;">
                  <span style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">
                    ${m.sender_name} (${m.sender_type}) • ${new Date(m.created_at).toLocaleTimeString()}
                  </span>
                  <div style="background: ${m.sender_type === 'admin' ? 'var(--primary)' : 'var(--bg-card)'}; color: ${m.sender_type === 'admin' ? '#fff' : 'var(--text-primary)'}; border-radius: 10px; padding: 10px 14px; font-size: 0.85rem;">
                    ${m.message}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Admin Reply Input -->
            <form onsubmit="AdminTickets.sendAdminReply(event, ${ticketId})" style="display: flex; gap: 8px;">
              <input type="text" id="admin-reply-input" class="form-input" placeholder="Type official administrative response..." required style="flex: 1;" />
              <button type="submit" class="btn btn-primary btn-sm">Send Reply</button>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (err) {
      Store.showToast('Error opening ticket conversation', 'error');
    }
  },

  async sendAdminReply(e, ticketId) {
    e.preventDefault();
    const admin = Store.state.currentAdmin;
    const input = document.getElementById('admin-reply-input');
    const msg = input.value;

    try {
      await API.post(`/api/support/tickets/${ticketId}/messages`, {
        sender_type: 'admin',
        sender_name: `${admin.full_name} (${admin.role_title})`,
        message: msg
      });
      document.getElementById('admin-ticket-modal')?.remove();
      Store.showToast('Response sent to user', 'success');
      this.openTicketChat(ticketId);
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  }
};
