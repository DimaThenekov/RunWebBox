import { createContext } from 'react';
import { type V86Starter, type V86Config } from 'v86';
import { type VMMetadata } from '../types/vm';

export interface V86InstanceContextType {
  createVM: (id: string, config: V86Config) => V86Starter;
  getVM: (id: string) => V86Starter | undefined;
  destroyVM: (id: string) => void;
  
  getVMMetadata: (id: string) => VMMetadata | undefined;
  getAllVMMetadata: () => VMMetadata[];
  getAllVMIds: () => string[];
  
  addOutputListener: (vmId: string, listener: (output: string) => void) => void;
  removeOutputListener: (vmId: string, listener: (output: string) => void) => void;
  sendCommand: (vmId: string, command: string) => void;
}

export const V86InstanceContext = createContext<V86InstanceContextType | undefined>(undefined);