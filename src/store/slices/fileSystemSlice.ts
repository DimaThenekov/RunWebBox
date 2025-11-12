import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileItem[];
}

interface FileSystemState {
  fileSystem: FileItem;
  openTabs: string[];
  activeTab: string | null;
  currentProject: string;
}

const initialFileSystem: FileItem = {
  id: 'root',
  name: 'project',
  type: 'folder',
  children: [
    {
      id: 'index.html',
      name: 'index.html',
      type: 'file',
      content:
        '<!DOCTYPE html>\n<html>\n<head>\n    <title>My App</title>\n</head>\n<body>\n    <h1>Hello RunWebBox!</h1>\n</body>\n</html>',
    },
    {
      id: 'app.js',
      name: 'app.js',
      type: 'file',
      content: 'console.log("Hello from RunWebBox!");',
    },
    {
      id: 'styles',
      name: 'styles',
      type: 'folder',
      children: [
        {
          id: 'style.css',
          name: 'style.css',
          type: 'file',
          content: 'body { font-family: Arial, sans-serif; }',
        },
      ],
    },
  ],
};

const initialState: FileSystemState = {
  fileSystem: initialFileSystem,
  openTabs: [],
  activeTab: null,
  currentProject: 'demo-project',
};

const fileSystemSlice = createSlice({
  name: 'fileSystem',
  initialState,
  reducers: {
    openFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;

      // Добавляем вкладку, если её еще нет
      if (!state.openTabs.includes(fileId)) {
        state.openTabs.push(fileId);
      }

      // Устанавливаем активную вкладку
      state.activeTab = fileId;
    },

    closeTab: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      state.openTabs = state.openTabs.filter(tabId => tabId !== fileId);

      // Если закрыли активную вкладку, выбираем следующую
      if (state.activeTab === fileId) {
        state.activeTab =
          state.openTabs.length > 0
            ? state.openTabs[state.openTabs.length - 1]
            : null;
      }
    },

    updateFileContent: (
      state,
      action: PayloadAction<{ fileId: string; content: string }>
    ) => {
      const { fileId, content } = action.payload;

      const updateFileInTree = (files: FileItem[]): FileItem[] => {
        return files.map(file => {
          if (file.id === fileId) {
            return { ...file, content };
          }
          if (file.children) {
            return { ...file, children: updateFileInTree(file.children) };
          }
          return file;
        });
      };

      if (state.fileSystem.children) {
        state.fileSystem.children = updateFileInTree(state.fileSystem.children);
      }
    },

    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },

    addFile: (
      state,
      action: PayloadAction<{ parentId: string; file: FileItem }>
    ) => {
      const { parentId, file } = action.payload;

      const addFileToTree = (files: FileItem[]): FileItem[] => {
        return files.map(item => {
          if (item.id === parentId && item.type === 'folder') {
            return {
              ...item,
              children: [...(item.children || []), file],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addFileToTree(item.children),
            };
          }
          return item;
        });
      };

      if (state.fileSystem.children) {
        state.fileSystem.children = addFileToTree(state.fileSystem.children);
      }
    },

    deleteFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;

      const removeFileFromTree = (files: FileItem[]): FileItem[] => {
        return files.filter(file => {
          if (file.id === fileId) return false;
          if (file.children) {
            file.children = removeFileFromTree(file.children);
          }
          return true;
        });
      };

      if (state.fileSystem.children) {
        state.fileSystem.children = removeFileFromTree(
          state.fileSystem.children
        );
      }

      // Закрываем вкладку если она открыта
      state.openTabs = state.openTabs.filter(tabId => tabId !== fileId);
      if (state.activeTab === fileId) {
        state.activeTab =
          state.openTabs.length > 0
            ? state.openTabs[state.openTabs.length - 1]
            : null;
      }
    },

    renameFile: (
      state,
      action: PayloadAction<{ fileId: string; newName: string }>
    ) => {
      const { fileId, newName } = action.payload;

      const renameFileInTree = (files: FileItem[]): FileItem[] => {
        return files.map(file => {
          if (file.id === fileId) {
            return { ...file, name: newName };
          }
          if (file.children) {
            return { ...file, children: renameFileInTree(file.children) };
          }
          return file;
        });
      };

      if (state.fileSystem.children) {
        state.fileSystem.children = renameFileInTree(state.fileSystem.children);
      }
    },
  },
});

export const {
  openFile,
  closeTab,
  updateFileContent,
  setActiveTab,
  addFile,
  deleteFile,
  renameFile,
} = fileSystemSlice.actions;

export default fileSystemSlice.reducer;
