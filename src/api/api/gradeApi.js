import api from './api';

export const getGrades = async () => {
  try {
    const response = await api.get('/api/public/demo/settings/grades');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAdminGrades = async () => {
  try {
    const response = await api.get('/api/admin/grades');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
