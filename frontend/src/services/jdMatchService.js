import api from './api';

const jdMatchService = {
    analyze: async (jobDescription) => (
        await api.post('/jd-match/analyze', { job_description: jobDescription })
    ).data,
};

export default jdMatchService;
