import api from './api';

export const getCollections = async () => {
  const response = await api.get('/collections/');
  return response.data;
};

export const createCollection = async (data: { name: string, description?: string }) => {
  const response = await api.post('/collections/', data);
  return response.data;
};

export const deleteCollection = async (id: string) => {
  const response = await api.delete(`/collections/${id}`);
  return response.data;
};
