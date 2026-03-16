import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardApi = {
  generate: async (prompt, maxRows = 1000) => {
    const response = await api.post('/generate-dashboard', { prompt, max_rows: maxRows });
    return response.data;
  },
  
  refine: async (prompt, maxRows = 1000) => {
    const response = await api.post('/refine-dashboard', { prompt, max_rows: maxRows });
    return response.data;
  },
  
  getSchema: async () => {
    const response = await api.get('/schema');
    return response.data;
  },
  
  uploadCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  health: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
