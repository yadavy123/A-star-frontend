import api from './api';

export const getAdminLeads = async () => {
  try {
    const response = await api.get('/api/admin/leads');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const sendLeadOtp = async (data) => {
  try {
    const response = await api.post('/api/leads/send-otp', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const submitLead = async (data) => {
  try {
    const response = await api.post('/api/leads/submit', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
