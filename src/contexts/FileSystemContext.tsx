import { createContext, useContext, type ReactNode } from 'react';
import type { FileItem } from '../types/fileSystem';

export interface FileSystemContextType {
  fileSystem: FileItem | null;
  openTabs: string[];
  getFile: (id: string) => FileItem | null;
  getFileContent: (id: string) => string;
  updateFileContent: (id: string, content: string) => void;
  closeTab: (id: string) => void;
  currentProject: string;
}

export const FileSystemContext = createContext<
  FileSystemContextType | undefined
>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

export interface FileSystemProviderProps {
  children: ReactNode;
}
