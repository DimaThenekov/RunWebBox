// components/LeftSidebar.tsx
import React from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import type { FileItem } from '../types/fileSystem';

const LeftSidebar: React.FC = () => {
  const { fileSystem, openFile } = useFileSystem();

  const renderFileTree = (files: FileItem[], level = 0) => {
    return files.map(file => (
      <div key={file.id} className="select-none">
        <div
          className={`flex items-center px-2 py-1 hover:bg-zinc-700 cursor-pointer ${
            level > 0 ? `pl-${level * 4 + 2}` : ''
          }`}
          onClick={() => file.type === 'file' && openFile(file.id)}
        >
          <span className="mr-2">
            {file.type === 'folder' ? '📁' : getFileIcon(file.name)}
          </span>
          <span>{file.name}</span>
        </div>
        {file.type === 'folder' && file.children && (
          <div className="ml-2">{renderFileTree(file.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()!.toLowerCase();
    const icons: { [key: string]: string } = {
      js: '📄',
      ts: '📄',
      jsx: '⚛️',
      tsx: '⚛️',
      html: '🌐',
      css: '🎨',
      json: '📋',
      md: '📝',
    };
    return icons[ext] || '📄';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 border-b border-zinc-700">
        <h2 className="font-semibold">Files</h2>
      </div>
      <div className="p-2">{fileSystem && renderFileTree([fileSystem])}</div>
    </div>
  );
};

export default LeftSidebar;
