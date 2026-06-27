import api from './api';

export const getSubjects = async () => {
  try {
    const response = await api.get('/api/admin/subjects');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
