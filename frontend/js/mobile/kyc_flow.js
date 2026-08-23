// ==========================================================================
// 2026 Fintech Mobile App - 5-Step KYC Verification Flow & Status Center
// ==========================================================================

const MobileKYC = {
  currentStep: 1,
  kycData: {
    personal: { fullName: 'Alex Morgan', dob: '1995-08-20', nationality: 'Indian', occupation: 'Software Architect', annualIncome: '₹15L - ₹25L' },
    idDoc: { docType: 'PAN', idNumber: 'ABCPS1234K' },
    address: { street: '42 Horizon Tower, Financial District', city: 'Mumbai', state: 'Maharashtra', pin: '400051' },
    photos: {
      front: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      back: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
      selfie: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
    }
  },

  renderKYCWizard(container) {
    const user = Store.state.currentUser;

    container.innerHTML = `
      <div class="mobile-subpage-layout kyc-wizard-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">KYC Verification</h2>
            <span class="subpage-step-indicator">Step ${this.currentStep} of 5</span>
          </div>
          <button class="header-text-action-btn" onclick="Store.setMobileScreen('home')">Exit</button>
        </div>

        <!-- 5-Step Progress Bar -->
        <div class="kyc-stepper-progress">
          <div class="kyc-progress-bar-bg">
            <div class="kyc-progress-bar-fill" style="width: ${(this.currentStep / 5) * 100}%;"></div>
          </div>
          <div class="kyc-step-dots-row">
            ${[1, 2, 3, 4, 5].map(step => `
              <div class="kyc-step-dot ${step < this.currentStep ? 'completed' : step === this.currentStep ? 'active' : ''}">
                ${step < this.currentStep ? '✓' : step}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Step Content Area -->
        <div id="kyc-step-body" class="kyc-step-card-content">
          ${this.renderCurrentStepContent()}
        </div>
      </div>
    `;
  },

  renderCurrentStepContent() {
    switch (this.currentStep) {
      // Step 1: Personal Information
      case 1:
        return `
          <div class="kyc-step-inner">
            <div class="step-badge-tag">STEP 1 • IDENTITY DETAILS</div>
            <h3 class="kyc-step-heading">Personal Information</h3>
            <p class="kyc-step-sub">Please ensure these details match your government-issued ID proof.</p>

            <div class="form-group">
              <label class="form-label">Full Legal Name</label>
              <input type="text" id="kyc-fullname" class="form-input" value="${this.kycData.personal.fullName}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Date of Birth</label>
              <input type="date" id="kyc-dob" class="form-input" value="${this.kycData.personal.dob}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Occupation</label>
              <select id="kyc-occupation" class="form-input">
                <option value="Salaried Employee" selected>Salaried Professional</option>
                <option value="Business Owner">Business Owner / Entrepreneur</option>
                <option value="Self Employed">Self Employed / Freelancer</option>
                <option value="Institutional Investor">Institutional Investor</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Annual Income Range</label>
              <select id="kyc-income" class="form-input">
                <option value="< ₹5L">Below ₹5 Lakhs</option>
                <option value="₹5L - ₹15L">₹5 Lakhs - ₹15 Lakhs</option>
                <option value="₹15L - ₹25L" selected>₹15 Lakhs - ₹25 Lakhs</option>
                <option value="₹25L - ₹1Cr">₹25 Lakhs - ₹1 Crore</option>
                <option value="> ₹1Cr">Above ₹1 Crore (HNW)</option>
              </select>
            </div>

            <div class="kyc-actions-row">
              <button class="btn btn-primary btn-full btn-lg" onclick="MobileKYC.nextStep()">
                <span>Continue to ID Document</span> →
              </button>
            </div>
          </div>
        `;

      // Step 2: Identity Document
      case 2:
        return `
          <div class="kyc-step-inner">
            <div class="step-badge-tag">STEP 2 • GOVERNMENT ID</div>
            <h3 class="kyc-step-heading">Identity Document</h3>
            <p class="kyc-step-sub">Select your primary identity document for regulatory compliance.</p>

            <div class="kyc-doc-type-selector">
              <div class="doc-type-card active" onclick="Haptics.tick(); MobileKYC.selectDocType('PAN', this)">
                <span class="doc-type-icon">🪪</span>
                <span class="doc-type-name">PAN Card</span>
                <span class="doc-type-req">Mandatory for India</span>
              </div>
              <div class="doc-type-card" onclick="Haptics.tick(); MobileKYC.selectDocType('Aadhaar', this)">
                <span class="doc-type-icon">🆔</span>
                <span class="doc-type-name">Aadhaar Card</span>
                <span class="doc-type-req">UIDAI Verified</span>
              </div>
              <div class="doc-type-card" onclick="Haptics.tick(); MobileKYC.selectDocType('Passport', this)">
                <span class="doc-type-icon">🛂</span>
                <span class="doc-type-name">Passport</span>
                <span class="doc-type-req">Global Citizens</span>
              </div>
            </div>

            <div class="form-group" style="margin-top: 16px;">
              <label class="form-label" id="kyc-id-label">PAN Number</label>
              <input type="text" id="kyc-id-number" class="form-input" placeholder="ABCPS1234K" value="${this.kycData.idDoc.idNumber}" style="text-transform: uppercase;" required />
            </div>

            <div class="kyc-actions-row">
              <button class="btn btn-secondary" onclick="MobileKYC.prevStep()">Back</button>
              <button class="btn btn-primary btn-full btn-lg" onclick="MobileKYC.nextStep()">
                <span>Continue to Address</span> →
              </button>
            </div>
          </div>
        `;

      // Step 3: Address
      case 3:
        return `
          <div class="kyc-step-inner">
            <div class="step-badge-tag">STEP 3 • RESIDENCE PROOF</div>
            <h3 class="kyc-step-heading">Residential Address</h3>
            <p class="kyc-step-sub">Enter your permanent or current residential address.</p>

            <div class="form-group">
              <label class="form-label">Street Address & Landmark</label>
              <input type="text" id="kyc-street" class="form-input" value="${this.kycData.address.street}" required />
            </div>

            <div class="form-row-2col">
              <div class="form-group">
                <label class="form-label">City</label>
                <input type="text" id="kyc-city" class="form-input" value="${this.kycData.address.city}" required />
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input type="text" id="kyc-state" class="form-input" value="${this.kycData.address.state}" required />
              </div>
            </div>

            <div class="form-row-2col">
              <div class="form-group">
                <label class="form-label">Postal PIN Code</label>
                <input type="text" id="kyc-pin" class="form-input" value="${this.kycData.address.pin}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Country</label>
                <input type="text" class="form-input" value="India" readonly />
              </div>
            </div>

            <div class="kyc-actions-row">
              <button class="btn btn-secondary" onclick="MobileKYC.prevStep()">Back</button>
              <button class="btn btn-primary btn-full btn-lg" onclick="MobileKYC.nextStep()">
                <span>Continue to Uploads</span> →
              </button>
            </div>
          </div>
        `;

      // Step 4: Document Upload
      case 4:
        return `
          <div class="kyc-step-inner">
            <div class="step-badge-tag">STEP 4 • DOCUMENT CAPTURE</div>
            <h3 class="kyc-step-heading">Upload Documents & Selfie</h3>
            <p class="kyc-step-sub">Take clear photos of your ID document and a live facial selfie.</p>

            <div class="kyc-upload-cards-grid">
              <div class="kyc-upload-item">
                <div class="upload-preview-box">
                  <img src="${this.kycData.photos.front}" alt="Document Front" class="upload-img-preview" />
                  <span class="upload-badge-tag">✓ Front Attached</span>
                </div>
                <div class="upload-item-info">
                  <strong>ID Document Front</strong>
                  <small>Clear photo of front side</small>
                </div>
                <button class="btn btn-outline btn-sm" onclick="Haptics.tick(); alert('Photo re-captured successfully!');">Re-take</button>
              </div>

              <div class="kyc-upload-item">
                <div class="upload-preview-box">
                  <img src="${this.kycData.photos.selfie}" alt="Selfie" class="upload-img-preview" />
                  <span class="upload-badge-tag" style="background: var(--primary);">✓ Liveness Verified</span>
                </div>
                <div class="upload-item-info">
                  <strong>Live Facial Selfie</strong>
                  <small>Biometric matching photo</small>
                </div>
                <button class="btn btn-outline btn-sm" onclick="Haptics.tick(); alert('Selfie liveness scanned!');">Re-scan</button>
              </div>
            </div>

            <div class="kyc-actions-row" style="margin-top: 16px;">
              <button class="btn btn-secondary" onclick="MobileKYC.prevStep()">Back</button>
              <button class="btn btn-primary btn-full btn-lg" onclick="MobileKYC.nextStep()">
                <span>Review & Submit</span> →
              </button>
            </div>
          </div>
        `;

      // Step 5: Review & Submit
      case 5:
        return `
          <div class="kyc-step-inner">
            <div class="step-badge-tag">STEP 5 • FINAL REVIEW</div>
            <h3 class="kyc-step-heading">Review & Submit</h3>
            <p class="kyc-step-sub">Please confirm all submitted details before sending to compliance.</p>

            <div class="kyc-summary-card">
              <div class="summary-row">
                <span class="summary-label">Legal Name</span>
                <strong class="summary-val">${this.kycData.personal.fullName}</strong>
              </div>
              <div class="summary-row">
                <span class="summary-label">Date of Birth</span>
                <strong class="summary-val">${this.kycData.personal.dob}</strong>
              </div>
              <div class="summary-row">
                <span class="summary-label">Document Type</span>
                <strong class="summary-val">${this.kycData.idDoc.docType} (${this.kycData.idDoc.idNumber})</strong>
              </div>
              <div class="summary-row">
                <span class="summary-label">Address</span>
                <strong class="summary-val">${this.kycData.address.city}, ${this.kycData.address.state} (${this.kycData.address.pin})</strong>
              </div>
              <div class="summary-row">
                <span class="summary-label">Documents Attached</span>
                <strong class="summary-val" style="color: #10B981;">3 Proofs Attached ✓</strong>
              </div>
            </div>

            <div class="form-group terms-checkbox-group" style="margin-top: 14px;">
              <label class="custom-checkbox-label">
                <input type="checkbox" id="kyc-declaration-check" checked />
                <span class="terms-text">
                  I solemnly declare that the information provided is accurate and authentic under PMLA guidelines.
                </span>
              </label>
            </div>

            <div class="kyc-actions-row" style="margin-top: 16px;">
              <button class="btn btn-secondary" onclick="MobileKYC.prevStep()">Back</button>
              <button class="btn btn-primary btn-full btn-lg" onclick="MobileKYC.submitKYC()">
                <span>Submit KYC for Review</span> ✓
              </button>
            </div>
          </div>
        `;
    }
  },

  selectDocType(type, element) {
    this.kycData.idDoc.docType = type;
    document.querySelectorAll('.doc-type-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    const label = document.getElementById('kyc-id-label');
    if (label) label.innerText = `${type} Number`;
  },

  nextStep() {
    Haptics.tap();
    if (this.currentStep < 5) {
      this.currentStep++;
      const viewport = document.getElementById('mobile-screen-content');
      this.renderKYCWizard(viewport);
    }
  },

  prevStep() {
    Haptics.tap();
    if (this.currentStep > 1) {
      this.currentStep--;
      const viewport = document.getElementById('mobile-screen-content');
      this.renderKYCWizard(viewport);
    }
  },

  submitKYC() {
    Haptics.success();
    Store.state.currentUser.kyc_status = 'approved';
    const viewport = document.getElementById('mobile-screen-content');
    this.renderKYCSuccess(viewport);
  },

  renderKYCSuccess(container) {
    container.innerHTML = `
      <div class="auth-screen-layout kyc-success-screen">
        <div class="kyc-success-emblem-box">
          <div class="success-icon-ring">
            <span style="font-size: 2.2rem; color: #10B981;">✓</span>
          </div>
        </div>

        <h2 class="auth-page-title" style="margin-top: 16px;">KYC Submitted!</h2>
        <p class="auth-page-sub">
          Your documents have been verified and approved. Full transaction limits and high-yield plans are now unlocked on your account.
        </p>

        <div class="kyc-status-pill approved" style="margin: 16px auto;">
          <span>STATUS: APPROVED & VERIFIED</span>
        </div>

        <button class="btn btn-primary btn-full btn-lg" style="margin-top: 24px;" onclick="Store.setMobileScreen('home')">
          <span>Go to Home Dashboard</span> →
        </button>
      </div>
    `;
  },

  // ==========================================================================
  // KYC STATUS TRACKER SCREEN
  // ==========================================================================
  renderKYCStatus(container) {
    const user = Store.state.currentUser;
    const status = user.kyc_status || 'approved';

    const statusConfigs = {
      'not_started': {
        icon: '⚠️',
        badge: 'Not Started',
        color: '#F59E0B',
        desc: 'Submit your government identity document to enable instant withdrawals and institutional plans.'
      },
      'submitted': {
        icon: '📤',
        badge: 'Submitted',
        color: '#38BDF8',
        desc: 'Your documents have been submitted to compliance. Estimated review time is 15-30 minutes.'
      },
      'pending': {
        icon: '⏳',
        badge: 'Under Review',
        color: '#F59E0B',
        desc: 'Compliance officers are currently reviewing your address proof and liveness selfie.'
      },
      'approved': {
        icon: '✓',
        badge: 'Approved & Verified',
        color: '#10B981',
        desc: 'Your identity is fully verified under AML/CFT standards. Full platform limits active.'
      },
      'rejected': {
        icon: '✕',
        badge: 'Verification Rejected',
        color: '#EF4444',
        desc: 'Document photo was blurry or address did not match. Please re-upload a clear government ID.'
      }
    };

    const cfg = statusConfigs[status] || statusConfigs['approved'];

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">KYC Status</h2>
          </div>
          <div></div>
        </div>

        <div class="kyc-status-hero-card">
          <div class="status-icon-circle" style="border-color: ${cfg.color}; color: ${cfg.color};">
            ${cfg.icon}
          </div>

          <h3 class="status-heading">${cfg.badge}</h3>
          <p class="status-desc">${cfg.desc}</p>

          <div class="status-details-list">
            <div class="status-detail-item">
              <span>Account Holder</span>
              <strong>${user.full_name}</strong>
            </div>
            <div class="status-detail-item">
              <span>Verified Document</span>
              <strong>PAN Card (ABCPS1234K)</strong>
            </div>
            <div class="status-detail-item">
              <span>Tier Limit</span>
              <strong style="color: #10B981;">₹25,00,000 / Day</strong>
            </div>
          </div>

          ${status !== 'approved' ? `
            <button class="btn btn-primary btn-full btn-lg" style="margin-top: 20px;" onclick="MobileKYC.currentStep=1; Store.setMobileScreen('kyc');">
              <span>${status === 'rejected' ? 'Re-Submit Verification' : 'Start Verification Flow'}</span> →
            </button>
          ` : `
            <button class="btn btn-secondary btn-full btn-lg" style="margin-top: 20px;" onclick="Store.setMobileScreen('home')">
              <span>Back to Dashboard</span>
            </button>
          `}
        </div>
      </div>
    `;
  }
};

window.MobileKYC = MobileKYC;
