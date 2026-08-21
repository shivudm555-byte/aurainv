// Check if running inside WordPress
if (typeof window !== 'undefined' && window.agy_wp_vars && window.agy_wp_vars.rest_url) {
  API.BASE_URL = window.agy_wp_vars.rest_url;
}
// ==========================================================================
// Centralized REST API Client
// ==========================================================================

const API = {
  baseURL: window.location.origin,

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
