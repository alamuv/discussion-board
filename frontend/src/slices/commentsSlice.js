import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as commentsService from '../services/commentsService';

// Async thunks
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ threadId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const data = await commentsService.getCommentsByThreadId(threadId, page, limit);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch comments');
    }
  }
);

export const createNewComment = createAsyncThunk(
  'comments/createNew',
  async ({ threadId, content, parentId }, { rejectWithValue }) => {
    try {
      const data = await commentsService.createComment(threadId, {
        content,
        parentId: parentId || null,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create comment');
    }
  }
);

export const updateOneComment = createAsyncThunk(
  'comments/updateOne',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const data = await commentsService.updateComment(commentId, content);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update comment');
    }
  }
);

export const deleteOneComment = createAsyncThunk(
  'comments/deleteOne',
  async (commentId, { rejectWithValue }) => {
    try {
      await commentsService.deleteComment(commentId);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete comment');
    }
  }
);

const initialState = {
  comments: [], // Tree structure: top-level comments with nested replies
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments || [];
        state.pagination = action.payload.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create new comment
      .addCase(createNewComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewComment.fulfilled, (state, action) => {
        state.loading = false;
        const newComment = action.payload;
        
        // If it's a top-level comment (no parentId), add to root
        if (!newComment.parentId) {
          state.comments.unshift({
            ...newComment,
            replies: [],
          });
        }
        // If it's a reply, find parent and add to its replies
        else {
          const findAndAddReply = (comments) => {
            for (const comment of comments) {
              if (comment.id === newComment.parentId) {
                comment.replies.unshift({
                  ...newComment,
                  replies: [],
                });
                return true;
              }
              if (findAndAddReply(comment.replies)) {
                return true;
              }
            }
            return false;
          };
          findAndAddReply(state.comments);
        }
      })
      .addCase(createNewComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update comment
      .addCase(updateOneComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOneComment.fulfilled, (state, action) => {
        state.loading = false;
        const updatedComment = action.payload;
        
        const findAndUpdate = (comments) => {
          for (const comment of comments) {
            if (comment.id === updatedComment.id) {
              comment.content = updatedComment.content;
              return true;
            }
            if (findAndUpdate(comment.replies)) {
              return true;
            }
          }
          return false;
        };
        findAndUpdate(state.comments);
      })
      .addCase(updateOneComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete comment
      .addCase(deleteOneComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOneComment.fulfilled, (state, action) => {
        state.loading = false;
        const deletedCommentId = action.payload;
        
        const findAndDelete = (comments) => {
          return comments.filter((comment) => {
            if (comment.id === deletedCommentId) {
              return false;
            }
            comment.replies = findAndDelete(comment.replies);
            return true;
          });
        };
        state.comments = findAndDelete(state.comments);
      })
      .addCase(deleteOneComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearComments, clearError } = commentsSlice.actions;
export default commentsSlice.reducer;

