import api from './api';

// Get all threads with pagination support
export const getAllThreads = async (page = 1, limit = 10) => {
  const response = await api.get('/api/threads', {
    params: { page, limit },
  });
  return response.data;
};

// Get a single thread by ID
export const getThreadById = async (threadId) => {
  const response = await api.get(`/api/threads/${threadId}`);
  return response.data;
};

// Delete a thread by ID
export const deleteThread = async (threadId) => {
  const response = await api.delete(`/api/threads/${threadId}`);
  return response.data;
};

// Create a new thread
export const createThread = async (threadData) => {
  const response = await api.post('/api/threads', threadData);
  return response.data;
};

// Update a thread
export const updateThread = async (threadId, threadData) => {
  const response = await api.put(`/api/threads/${threadId}`, threadData);
  return response.data;
};

