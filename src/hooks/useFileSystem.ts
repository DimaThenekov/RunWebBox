import { useAppSelector, useAppDispatch } from './redux';
//import { V86 } from 'v86';
import {
  openFile,
  closeTab,
  updateFileContent,
  setActiveTab,
} from '../store/slices/fileSystemSlice';
import { type FileItem } from '../types/fileSystem';

export const useFileSystem = () => {
  //console.log(V86);
  const dispatch = useAppDispatch();
  const { fileSystem, openTabs, activeTab, currentProject } = useAppSelector(
    state => state.fileSystem
  );

  const findFile = (id: string, files: FileItem[]): FileItem | null => {
    for (const file of files) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFile(id, file.children);
        if (found) return found;
      }
    }
    return null;
  };

  const getFile = (id: string): FileItem | null => {
    if (fileSystem.children) {
      return findFile(id, fileSystem.children);
    }
    return null;
  };

  const getFileContent = (id: string): string => {
    const file = getFile(id);
    return file?.content || '';
  };

  const handleOpenFile = (fileId: string) => {
    dispatch(openFile(fileId));
  };

  const handleCloseTab = (fileId: string) => {
    dispatch(closeTab(fileId));
  };

  const handleUpdateFileContent = (fileId: string, content: string) => {
    dispatch(updateFileContent({ fileId, content }));
  };

  const handleSetActiveTab = (fileId: string) => {
    dispatch(setActiveTab(fileId));
  };

  return {
    fileSystem,
    openTabs,
    activeTab,
    currentProject,
    getFile,
    getFileContent,
    openFile: handleOpenFile,
    closeTab: handleCloseTab,
    updateFileContent: handleUpdateFileContent,
    setActiveTab: handleSetActiveTab,
  };
};
