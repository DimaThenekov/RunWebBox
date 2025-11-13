import { createContext } from 'react';
import { type V86Starter, type V86Config } from 'v86';
import { type VMMetadata } from '../store/slices/vmSlice';

export interface V86InstanceContextType {
  createVM: (id: string, config: V86Config) => V86Starter;
  getVM: (id: string) => V86Starter | undefined;
  getVMMetadata: (id: string) => VMMetadata | undefined;
  destroyVM: (id: string) => void;
  getAllVMs: () => Map<string, V86Starter>;
  getAllVMMetadata: () => VMMetadata[];
}

export const V86InstanceContext = createContext<
  V86InstanceContextType | undefined
>(undefined);
