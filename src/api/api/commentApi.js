import api from './api';

export const getAllComments = async (params = {}) => {
  try {
    const response = await api.get('/admin/api/comments/all', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPendingComments = async (params = {}) => {
  try {
    const response = await api.get('/admin/api/comments/pending', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approveComment = async (id) => {
  try {
    const response = await api.post(`/admin/api/comments/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteComment = async (id) => {
  try {
    const response = await api.delete(`/admin/api/comments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateComment = async (id, data) => {
  try {
    const response = await api.put(`/admin/api/comments/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
