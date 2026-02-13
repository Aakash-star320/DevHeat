import api from './api';

const authService = {
    login: () => {
        // Redirect to backend login endpoint
        const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');
        window.location.href = `${API_BASE_URL}/auth/login`;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    },

    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    getToken: () => {
        return localStorage.getItem('token');
    }
};

export default authService;
