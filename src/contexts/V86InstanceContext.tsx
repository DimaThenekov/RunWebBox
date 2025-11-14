import { createContext } from 'react';
import { type V86, type V86Options } from 'v86';
import { type VMMetadata } from '../types/vm';

export interface V86InstanceContextType {
  createVM: (id: string, config: V86Options) => V86;
  getVM: (id: string) => V86 | undefined;
  destroyVM: (id: string) => void;

  getVMMetadata: (id: string) => VMMetadata | undefined;
  getAllVMMetadata: () => VMMetadata[];
  getAllVMIds: () => string[];

  addOutputListener: (vmId: string, listener: (output: string) => void) => void;
  removeOutputListener: (
    vmId: string,
    listener: (output: string) => void
  ) => void;
  sendCommand: (vmId: string, command: string) => void;
}

export const V86InstanceContext = createContext<
  V86InstanceContextType | undefined
>(undefined);
