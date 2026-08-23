// ==========================================================================
// Supabase Authentication Service (Email & Password, Magic Link, OTP & Session)
// Project: https://hcvckfirqlggamffsrvc.supabase.co
// ==========================================================================

const SupabaseAuth = {
  config: {
    url: 'https://hcvckfirqlggamffsrvc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdmNrZmlycWxnZ2FtZmZzcnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTcxNjYsImV4cCI6MjEwMjczMzE2Nn0.TR0wutoferxUXY6Uj-ZuOFhQmIbhq_yK_uHYpBmYc60',
    publishableKey: 'sb_publishable_qjL7djPcOPznZm-Nsu9Lgw_H0CUZ3cx'
  },

  client: null,

  init() {
    // Initialize Supabase JS Client if loaded via CDN, or use our direct REST adapter
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        this.client = window.supabase.createClient(this.config.url, this.config.anonKey);
        console.log("Supabase JS Client initialized successfully.");
      } catch (e) {
        console.warn("Falling back to Supabase REST Auth Adapter:", e);
      }
    }
  },

  // Helper for direct Supabase Auth REST API calls
  async authRequest(endpoint, body = {}, method = 'POST') {
    const url = `${this.config.url}/auth/v1${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.config.anonKey,
      'Authorization': `Bearer ${this.config.anonKey}`
    };

    const res = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data.msg || data.message || data.error_description || data.error || `Supabase Auth Error ${res.status}`;
      throw new Error(errorMsg);
    }
    return data;
  },

  // 1. Sign Up with Email & Password
  async signUpWithEmail(email, password, fullName, phone, referralCode = '') {
    email = email.trim().toLowerCase();
    password = password.trim();

    try {
      let sbUser = null;
      let session = null;

      if (this.client) {
        const { data, error } = await this.client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              referral_code: referralCode
            }
          }
        });
        if (error) throw error;
        sbUser = data.user;
        session = data.session;
      } else {
        // Direct REST signup
        const res = await this.authRequest('/signup', {
          email,
          password,
          data: {
            full_name: fullName,
            phone: phone,
            referral_code: referralCode
          }
        });
        sbUser = res.user || res;
        session = res.session || null;
      }

      // Sync user profile & financial wallet with backend ledger
      const syncRes = await API.post('/api/auth/supabase-sync', {
        email,
        full_name: fullName,
        phone: phone,
        supabase_uid: sbUser ? sbUser.id : '',
        referral_code: referralCode
      });

      if (syncRes.success) {
        if (session) {
          localStorage.setItem('sb_session', JSON.stringify(session));
        }
        return {
          success: true,
          user: syncRes.user,
          supabaseUser: sbUser,
          requiresEmailConfirmation: !session
        };
      } else {
        throw new Error(syncRes.message || 'Error syncing ledger wallet');
      }
    } catch (err) {
      console.error('Supabase Sign Up Error:', err);
      throw err;
    }
  },

  // 2. Sign In with Email & Password
  async signInWithEmail(email, password) {
    email = email.trim().toLowerCase();
    password = password.trim();

    try {
      let sbUser = null;
      let session = null;

      if (this.client) {
        const { data, error } = await this.client.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        sbUser = data.user;
        session = data.session;
      } else {
        // Direct REST token grant
        const res = await this.authRequest('/token?grant_type=password', {
          email,
          password
        });
        session = res;
        sbUser = res.user;
      }

      // Sync / fetch financial portfolio from backend
      const syncRes = await API.post('/api/auth/supabase-sync', {
        email,
        supabase_uid: sbUser ? sbUser.id : '',
        full_name: sbUser?.user_metadata?.full_name || ''
      });

      if (syncRes.success) {
        localStorage.setItem('sb_session', JSON.stringify(session));
        return {
          success: true,
          user: syncRes.user,
          token: syncRes.token,
          session
        };
      } else {
        throw new Error(syncRes.message || 'Error loading wallet');
      }
    } catch (err) {
      console.error('Supabase Sign In Error:', err);
      throw err;
    }
  },

  // 3. Passwordless Magic Link / Email OTP Sign In
  async signInWithMagicLink(email) {
    email = email.trim().toLowerCase();
    try {
      if (this.client) {
        const { data, error } = await this.client.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        return { success: true, message: 'Magic link / OTP sent to your email!' };
      } else {
        await this.authRequest('/otp', {
          email,
          create_user: true
        });
        return { success: true, message: 'Magic link / OTP sent to your email!' };
      }
    } catch (err) {
      console.error('Magic Link Error:', err);
      throw err;
    }
  },

  // 4. Verify Email OTP Code
  async verifyOtp(email, token, type = 'email') {
    email = email.trim().toLowerCase();
    token = token.trim();

    try {
      let sbUser = null;
      let session = null;

      if (this.client) {
        const { data, error } = await this.client.auth.verifyOtp({
          email,
          token,
          type
        });
        if (error) throw error;
        sbUser = data.user;
        session = data.session;
      } else {
        const res = await this.authRequest('/verify', {
          email,
          token,
          type
        });
        session = res;
        sbUser = res.user;
      }

      // Sync backend
      const syncRes = await API.post('/api/auth/supabase-sync', {
        email,
        supabase_uid: sbUser ? sbUser.id : ''
      });

      if (syncRes.success) {
        localStorage.setItem('sb_session', JSON.stringify(session));
        return {
          success: true,
          user: syncRes.user,
          session
        };
      }
      throw new Error('Sync failed');
    } catch (err) {
      console.error('OTP Verification Error:', err);
      throw err;
    }
  },

  // 5. Send Password Recovery Email
  async sendPasswordResetEmail(email) {
    email = email.trim().toLowerCase();
    try {
      if (this.client) {
        const { error } = await this.client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
      } else {
        await this.authRequest('/recover', { email });
      }
      return { success: true, message: 'Password recovery email dispatched by Supabase.' };
    } catch (err) {
      console.error('Password Reset Error:', err);
      throw err;
    }
  },

  // 6. Sign Out
  async signOut() {
    try {
      if (this.client) {
        await this.client.auth.signOut();
      }
    } catch (e) {}
    localStorage.removeItem('sb_session');
  }
};

// Initialize when script is parsed
SupabaseAuth.init();
