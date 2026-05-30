import axios from 'axios';

// Connect directly to the production Render backend for MenuMind
const API_BASE_URL = 'https://menumind-backend.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const MenuMindService = {
  getLatestRun: async () => {
    try {
      const response = await api.get('/agent/runs?limit=1');
      return response.data;
    } catch (error) {
      console.error('Error fetching latest run:', error);
      throw error;
    }
  },
  
  getMenuState: async () => {
    try {
      const response = await api.get('/menu/state');
      return response.data;
    } catch (error) {
      console.error('Error fetching menu state:', error);
      throw error;
    }
  },

  postSignal: async (text: string) => {
    try {
      const response = await api.post('/signals', {
        source_type: 'manual_app',
        raw_text: text,
      });
      return response.data;
    } catch (error) {
      console.error('Error posting signal:', error);
      throw error;
    }
  }
};
