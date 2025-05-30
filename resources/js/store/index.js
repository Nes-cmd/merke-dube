import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import languageReducer from './slices/languageSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    language: languageReducer,
  },
}); 