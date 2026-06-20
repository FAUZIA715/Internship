const BASE_URL = 'http://localhost:5000/api/auth';

const getToken = () => localStorage.getItem('token');

export const api = {

  login: async (data) => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return res.json();
  },

  changePassword: async (data) => {
    const res = await fetch(`${BASE_URL}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  forgotPassword: async (data) => {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  resetPassword: async (token, data) => {
    const res = await fetch(`${BASE_URL}/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Logout — clears session from localStorage
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }

};
