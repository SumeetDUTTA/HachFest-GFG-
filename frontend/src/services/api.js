import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 300000), // Default to 5 minutes
  headers: {
    'Content-Type': 'application/json',
  },
});

const formatApiError = (error, fallbackMessage) => {
  if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
    return 'Request timed out while waiting for the AI model. Ensure Ollama is running and retry with a simpler prompt.';
  }

  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.status) {
    return `Request failed with status ${error.response.status}`;
  }

  return error.message || fallbackMessage;
};

export const generateDashboard = async (prompt, maxRows = 1000) => {
  try {
    const { data } = await apiClient.post('/generate-dashboard', {
      prompt,
      max_rows: maxRows,
    });
    return data;
  } catch (error) {
    throw new Error(formatApiError(error, 'Unable to generate dashboard'));
  }
};

export const refineDashboard = async (prompt, maxRows = 1000) => {
  try {
    const { data } = await apiClient.post('/refine-dashboard', {
      prompt,
      max_rows: maxRows,
    });
    return data;
  } catch (error) {
    throw new Error(formatApiError(error, 'Unable to refine dashboard'));
  }
};

export const uploadCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const { data } = await apiClient.post('/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    throw new Error(formatApiError(error, 'Unable to upload CSV file'));
  }
};

export const getSchema = async () => {
  try {
    const { data } = await apiClient.get('/schema');
    return data;
  } catch (error) {
    throw new Error(formatApiError(error, 'Unable to fetch schema'));
  }
};

export const getHealth = async () => {
  try {
    const { data } = await apiClient.get('/health');
    return data;
  } catch (error) {
    throw new Error(formatApiError(error, 'Backend is not reachable'));
  }
};
