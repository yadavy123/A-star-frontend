import api from './api';

export const getQuestions = async (params = {}) => {
  try {
    const response = await api.get('/api/questions', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAdminQuestions = async (params = {}) => {
  try {
    const response = await api.get('/api/admin/questions', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuestionById = async (id) => {
  try {
    const response = await api.get(`/api/questions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuestionBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/questions/slug/${slug}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createQuestion = async (data) => {
  try {
    const response = await api.post('/api/admin/questions', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateQuestion = async (id, data) => {
  try {
    const response = await api.put(`/api/admin/questions/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteQuestion = async (id) => {
  try {
    const response = await api.delete(`/api/admin/questions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approveQuestion = async (id, status) => {
  try {
    const response = await api.patch(`/api/admin/questions/${id}/approve`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const changeQuestionStatus = async (id, status) => {
  try {
    const response = await api.patch(`/api/admin/questions/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
