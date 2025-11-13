import { type V86Starter } from 'v86';

export interface VMMetadata {
  id: string;
  state: 'creating' | 'running' | 'paused' | 'stopped' | 'error';
  createdAt: string;
  updatedAt?: string;
  error?: string;
}

export interface VMInstance {
  id: string;
  instance: V86Starter;
  metadata: VMMetadata;
  outputListeners: Set<(output: string) => void>;
}