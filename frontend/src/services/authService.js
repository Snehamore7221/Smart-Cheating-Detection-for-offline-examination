import API from './api';

export const authService = {
  async register(facultyData) {
    const response = await API.post('/auth/register', facultyData);
    if (response.data.token) {
      localStorage.setItem('faculty_token', response.data.token);
      localStorage.setItem('faculty_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await API.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('faculty_token', response.data.token);
      localStorage.setItem('faculty_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('faculty_token');
    localStorage.removeItem('faculty_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('faculty_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('faculty_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
