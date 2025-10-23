import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import threadsReducer from './slices/threadsSlice';
import commentsReducer from './slices/commentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    threads: threadsReducer,
    comments: commentsReducer,
  },
});

export default store;

