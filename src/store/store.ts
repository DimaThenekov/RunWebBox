import { configureStore } from '@reduxjs/toolkit';
import fileSystemReducer from './slices/fileSystemSlice';
import vmReducer from './slices/vmSlice';

export const store = configureStore({
  reducer: {
    vm: vmReducer,
    fileSystem: fileSystemReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
