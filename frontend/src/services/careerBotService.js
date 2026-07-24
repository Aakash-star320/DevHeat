import api from './api';

const careerBotService = {
    listConversations: async () => (await api.get('/career-bot/conversations')).data,

    createConversation: async (title) => (
        await api.post('/career-bot/conversations', title ? { title } : {})
    ).data,

    renameConversation: async (conversationId, title) => (
        await api.patch(`/career-bot/conversations/${conversationId}`, { title })
    ).data,

    deleteConversation: async (conversationId) => {
        await api.delete(`/career-bot/conversations/${conversationId}`);
    },

    getMessages: async (conversationId) => (
        await api.get(`/career-bot/conversations/${conversationId}/messages`)
    ).data,

    sendMessage: async (conversationId, message) => (
        await api.post(`/career-bot/conversations/${conversationId}/messages`, { message })
    ).data,
};

export default careerBotService;
