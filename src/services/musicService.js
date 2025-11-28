import axios from 'axios';

const JAMENDO_API_KEY = import.meta.env.VITE_JAMENDO_API_KEY;
const JAMENDO_API_BASE_URL = '/api/jamendo/v3.0';

export const getMusicTracks = async (params = {}) => {
    try {
        const response = await axios.get(`${JAMENDO_API_BASE_URL}/tracks/`, {
            params: {
                client_id: JAMENDO_API_KEY,
                format: 'json',
                limit: 10,
                ...params,
            },
        });
        return response.data.results;
    } catch (error) {
        console.error('Error fetching music tracks:', error);
        throw error;
    }
};