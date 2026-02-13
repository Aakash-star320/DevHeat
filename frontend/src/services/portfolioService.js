import api from './api';

const portfolioService = {
    // Generate Portfolio
    generatePortfolio: async (formData) => {
        const response = await api.post('/portfolio/generate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get Portfolio by slug
    getPortfolio: async (slug) => {
        const response = await api.get(`/portfolio/${slug}`);
        return response.data;
    },

    // Get Private Coaching
    getCoaching: async (slug) => {
        const response = await api.get(`/portfolio/${slug}/coaching`);
        return response.data;
    },

    // Check Generation Status
    getStatus: async (slug) => {
        const response = await api.get(`/portfolio/${slug}/status`);
        return response.data;
    },

    // Edit Portfolio (Manual)
    editPortfolio: async (slug, updates) => {
        const response = await api.patch(`/portfolio/${slug}`, updates);
        return response.data;
    },

    // Refine Portfolio (AI-Assisted)
    refinePortfolio: async (slug, refinementData) => {
        const response = await api.post(`/portfolio/${slug}/refine`, refinementData);
        return response.data;
    },

    // Confirm Portfolio (Commit Draft)
    confirmPortfolio: async (slug) => {
        const response = await api.post(`/portfolio/${slug}/confirm`);
        return response.data;
    },

    // Revert Portfolio
    revertPortfolio: async (slug, versionId) => {
        const response = await api.post(`/portfolio/${slug}/revert`, { version_id: versionId });
        return response.data;
    },

    // Get Version History
    getVersionHistory: async (slug, limit = 50) => {
        const response = await api.get(`/portfolio/${slug}/versions`, {
            params: { limit },
        });
        return response.data;
    },

    // Get Specific Version
    getVersion: async (slug, versionId) => {
        const response = await api.get(`/portfolio/${slug}/versions/${versionId}`);
        return response.data;
    },

    // Get User Portfolios
    getMyPortfolios: async () => {
        const response = await api.get('/portfolio/me/all');
        return response.data;
    },

    // Upload LinkedIn Profile
    uploadLinkedIn: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload/linkedin', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Upload Resume
    uploadResume: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload/resume', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get Codeforces Stats
    getCodeforcesStats: async (username) => {
        const response = await api.get(`/codeforces/${username}`);
        return response.data;
    },

    // Analyze GitHub Repositories
    analyzeGitHub: async (repos) => {
        const response = await api.post('/github/analyze', { repos });
        return response.data;
    },

    // Get LeetCode Stats
    getLeetCodeStats: async (username) => {
        const response = await api.get(`/leetcode/${username}`);
        return response.data;
    },
};

export default portfolioService;
