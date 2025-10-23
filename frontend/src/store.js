import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import threadsReducer from './slices/threadsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    threads: threadsReducer,
  },
});

export default store;

