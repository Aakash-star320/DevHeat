import api from './api';

/**
 * Career Bot Service - API wrapper for AI career coaching chatbot
 */
const careerBotService = {
    /**
     * Send a message to the AI career bot
     * @param {string} message - The user's message
     * @returns {Promise<Object>} Response with assistant message, AI service used, model, timestamp
     */
    sendMessage: async (message) => {
        const response = await api.post('/career-bot/chat', { message });
        return response.data;
    },

    /**
     * Get chat conversation history
     * @param {number} limit - Maximum number of messages to retrieve (default: 50)
     * @param {number} offset - Number of messages to skip for pagination (default: 0)
     * @returns {Promise<Object>} Object with messages array and total_count
     */
    getHistory: async (limit = 50, offset = 0) => {
        const response = await api.get('/career-bot/history', {
            params: { limit, offset }
        });
        return response.data;
    },

    /**
     * Clear all chat history
     * @returns {Promise<Object>} Object with deletion confirmation and count
     */
    clearHistory: async () => {
        const response = await api.delete('/career-bot/history');
        return response.data;
    }
};

export default careerBotService;
