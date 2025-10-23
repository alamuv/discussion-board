import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as threadsService from '../services/threadsService';

// Async thunks
export const listAllThreads = createAsyncThunk(
  'threads/listAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await threadsService.getAllThreads(page, limit);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch threads');
    }
  }
);

export const getOneThread = createAsyncThunk(
  'threads/getOne',
  async (threadId, { rejectWithValue }) => {
    try {
      const data = await threadsService.getThreadById(threadId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch thread');
    }
  }
);

export const deleteOneThread = createAsyncThunk(
  'threads/deleteOne',
  async (threadId, { rejectWithValue }) => {
    try {
      await threadsService.deleteThread(threadId);
      return threadId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete thread');
    }
  }
);

export const createNewThread = createAsyncThunk(
  'threads/createNew',
  async (threadData, { rejectWithValue }) => {
    try {
      const data = await threadsService.createThread(threadData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create thread');
    }
  }
);

export const updateOneThread = createAsyncThunk(
  'threads/updateOne',
  async ({ threadId, threadData }, { rejectWithValue }) => {
    try {
      const data = await threadsService.updateThread(threadId, threadData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update thread');
    }
  }
);

const initialState = {
  threads: [],
  selectedThread: null,
  loading: false,
  error: null,
  isCreating: false,
  isEditing: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
};

const threadsSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {
    selectThread: (state, action) => {
      state.selectedThread = action.payload;
      state.isCreating = false;
      state.isEditing = false;
    },
    clearSelectedThread: (state) => {
      state.selectedThread = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    startCreatingThread: (state) => {
      state.isCreating = true;
      state.selectedThread = null;
      state.isEditing = false;
    },
    cancelCreatingThread: (state) => {
      state.isCreating = false;
    },
    startEditingThread: (state) => {
      state.isEditing = true;
    },
    cancelEditingThread: (state) => {
      state.isEditing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // List all threads
      .addCase(listAllThreads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listAllThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload.threads || [];
        state.pagination = action.payload.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        };
      })
      .addCase(listAllThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get one thread
      .addCase(getOneThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOneThread.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedThread = action.payload;
      })
      .addCase(getOneThread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete one thread
      .addCase(deleteOneThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOneThread.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = state.threads.filter(
          (thread) => thread.id !== action.payload
        );
        if (state.selectedThread?.id === action.payload) {
          state.selectedThread = null;
        }
      })
      .addCase(deleteOneThread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create new thread
      .addCase(createNewThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewThread.fulfilled, (state, action) => {
        state.loading = false;
        const newThread = action.payload;
        // Add new thread to the top of the threads array
        state.threads.unshift(newThread);
        // Set the newly created thread as selected
        state.selectedThread = newThread;
        // Exit creation mode
        state.isCreating = false;
      })
      .addCase(createNewThread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update one thread
      .addCase(updateOneThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOneThread.fulfilled, (state, action) => {
        state.loading = false;
        const updatedThread = action.payload;
        // Update thread in threads array
        const threadIndex = state.threads.findIndex(
          (thread) => thread.id === updatedThread.id
        );
        if (threadIndex !== -1) {
          state.threads[threadIndex] = updatedThread;
        }
        // Update selected thread
        state.selectedThread = updatedThread;
        // Exit edit mode
        state.isEditing = false;
      })
      .addCase(updateOneThread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectThread, clearSelectedThread, clearError, startCreatingThread, cancelCreatingThread, startEditingThread, cancelEditingThread } = threadsSlice.actions;
export default threadsSlice.reducer;
