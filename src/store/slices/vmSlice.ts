import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type V86Config } from 'v86';

export interface VMMetadata {
  id: string;
  state: 'creating' | 'running' | 'paused' | 'stopped' | 'error';
  createdAt: string;
  updatedAt?: string;
  config: V86Config;
  error?: string;
}

interface VMState {
  vms: VMMetadata[];
}

const initialState: VMState = {
  vms: [],
};

const vmSlice = createSlice({
  name: 'vm',
  initialState,
  reducers: {
    addVM: (state, action: PayloadAction<VMMetadata>) => {
      state.vms.push(action.payload);
    },
    updateVMStatus: (
      state,
      action: PayloadAction<{ id: string; status: VMMetadata['state'] }>
    ) => {
      const vm = state.vms.find(vm => vm.id === action.payload.id);
      if (vm) {
        vm.state = action.payload.status;
        vm.updatedAt = new Date().toISOString();
      }
    },
    updateVM: (state, action: PayloadAction<VMMetadata>) => {
      const index = state.vms.findIndex(vm => vm.id === action.payload.id);
      if (index !== -1) {
        state.vms[index] = action.payload;
      }
    },
    removeVM: (state, action: PayloadAction<string>) => {
      state.vms = state.vms.filter(vm => vm.id !== action.payload);
    },
    setVMError: (
      state,
      action: PayloadAction<{ id: string; error: string }>
    ) => {
      const vm = state.vms.find(vm => vm.id === action.payload.id);
      if (vm) {
        vm.state = 'error';
        vm.error = action.payload.error;
        vm.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const { addVM, updateVMStatus, updateVM, removeVM, setVMError } =
  vmSlice.actions;

export default vmSlice.reducer;
