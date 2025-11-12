import React from 'react';
import Editor from '@monaco-editor/react';
import { useFileSystem } from '../hooks/useFileSystem';

const EditorArea: React.FC = () => {
  const { activeTab, getFileContent, updateFileContent, getFile } =
    useFileSystem();

  if (!activeTab) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        Select a file to edit
      </div>
    );
  }

  const file = getFile(activeTab);
  const content = getFileContent(activeTab);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateFileContent(activeTab, value);
    }
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()!.toLowerCase();
    const languages: { [key: string]: string } = {
      js: 'javascript',
      ts: 'typescript',
      jsx: 'javascript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      php: 'php',
    };
    return languages[ext] || 'plaintext';
  };

  return (
    <div className="h-full">
      <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700">
        <h3 className="font-medium">{file?.name}</h3>
      </div>
      <Editor
        height="calc(100% - 33px)"
        language={file ? getLanguage(file.name) : 'plaintext'}
        value={content}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default EditorArea;
