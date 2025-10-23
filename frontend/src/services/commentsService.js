import api from './api';

// Get all comments for a thread (returns tree structure)
export const getCommentsByThreadId = async (threadId, page = 1, limit = 10) => {
  const response = await api.get(`/api/threads/${threadId}/comments`, {
    params: { page, limit },
  });
  return response.data;
};

// Create a new comment or reply
export const createComment = async (threadId, commentData) => {
  const response = await api.post(`/api/threads/${threadId}/comments`, commentData);
  return response.data;
};

// Update a comment
export const updateComment = async (commentId, content) => {
  const response = await api.put(`/api/comments/${commentId}`, { content });
  return response.data;
};

// Delete a comment (soft delete)
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/api/comments/${commentId}`);
  return response.data;
};

