import { useState, useEffect, useCallback, useRef } from 'react';
import { useFileSystem } from './useFileSystem';
import type { FileItem } from '../types/fileSystem';

interface FetchRequest {
  url: string;
  path: string;
  method: string;
}

interface FetchResponse {
  response: string;
  status?: number;
  headers?: {
    contentType: string;
  };
  error?: string;
}

export const useServiceWorker = () => {
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { fileSystem } = useFileSystem();
  const messageChannelRef = useRef<MessageChannel | null>(null);

  // Функция для поиска файла в древовидной структуре
  const findFileByPath = useCallback(
    (path: string, files: FileItem[]): FileItem | null => {
      for (const file of files) {
        if (file.type === 'file') {
          const filePath = `/${file.name}`;
          if (filePath === path) {
            return file;
          }
        } else if (file.type === 'folder' && file.children) {
          const found = findFileByPath(
            path.replace(/[\\/]?[^\\/]*/, ''),
            file.children
          );
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  // Обработчик запросов от Service Worker
  const handleFetchRequest = useCallback(
    (request: FetchRequest): FetchResponse => {
      try {
        let filePath = request.path;

        // Нормализуем путь
        if (filePath === '/') {
          filePath = '/index.html';
        }

        // Ищем файл в файловой системе
        const file = fileSystem.children
          ? findFileByPath(filePath, fileSystem.children)
          : null;

        if (file && file.content !== undefined) {
          return {
            response: file.content,
            status: 200,
            headers: {
              contentType: getContentType(file.name),
            },
          };
        }

        // Если файл не найден, создаем автоматический index.html
        if (filePath === '/index.html' && fileSystem.children) {
          const autoIndex = generateAutoIndex(fileSystem.children);
          return {
            response: autoIndex,
            status: 200,
            headers: {
              contentType: 'text/html',
            },
          };
        }

        return {
          response: 'File not found',
          status: 404,
          headers: {
            contentType: 'text/plain',
          },
        };
      } catch (error) {
        console.error('Error handling fetch request:', error);
        return {
          response: 'Internal Server Error',
          status: 500,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    [fileSystem, findFileByPath]
  );

  // Регистрация Service Worker
  useEffect(() => {
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          if (
            !registrations.length ||
            registrations[0].active?.state != 'activated'
          ) {
            await new Promise(r => setTimeout(r, 100));
            return await registerSW();
          }
          const registration = registrations[0];
          console.log(registration);
          setTimeout(() => console.log(registration), 10000);
          setSwRegistration(registration);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerSW();
  }, []);

  // Настройка канала сообщений
  useEffect(() => {
    if (!swRegistration?.active) return;

    const setupMessageChannel = async () => {
      // Создаем новый канал
      const channel = new MessageChannel();
      messageChannelRef.current = channel;

      // Обработчик входящих сообщений от Service Worker
      channel.port1.onmessage = event => {
        const { type, payload, requestId } = event.data;

        if (type === 'FETCH_REQUEST') {
          const response = handleFetchRequest(payload);

          // Отправляем ответ обратно
          channel.port1.postMessage({
            type: 'FETCH_RESPONSE',
            requestId,
            payload: response,
          });
        }

        if (type === 'CLIENT_REGISTERED') {
          setIsReady(true);
        }

        if (type === 'CLIENT_NOT_FOUND') {
          // setIsReady(true);
        }
      };

      // Запускаем канал
      channel.port1.start();

      // Регистрируем клиент в Service Worker
      swRegistration.active!.postMessage(
        {
          type: 'REGISTER_CLIENT',
        },
        [channel.port2]
      );
    };

    setupMessageChannel();

    return () => {
      if (messageChannelRef.current) {
        messageChannelRef.current.port1.close();
        messageChannelRef.current = null;
      }
    };
  }, [swRegistration, isReady, handleFetchRequest]);

  return {
    isReady,
    swRegistration,
  };
};

// Вспомогательные функции остаются без изменений
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const types: { [key: string]: string } = {
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    jsx: 'application/javascript',
    ts: 'application/typescript',
    tsx: 'application/typescript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    txt: 'text/plain',
    md: 'text/markdown',
  };

  return types[ext] || 'text/plain';
}

function generateAutoIndex(files: FileItem[]): string {
  const fileList = generateFileList(files);

  return `
<!DOCTYPE html>
<html>
<head>
    <title>Project Preview</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .file-list {
            list-style: none;
            padding: 0;
        }
        .file-list li {
            margin: 5px 0;
            padding: 8px;
            background: #f5f5f5;
            border-radius: 4px;
        }
        .file-list a {
            color: #0066cc;
            text-decoration: none;
            font-family: monospace;
        }
        .file-list a:hover {
            text-decoration: underline;
        }
        .folder {
            color: #666;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Project Files</h1>
        <p>Select a file to view:</p>
        <ul class="file-list">
            ${fileList}
        </ul>
    </div>
</body>
</html>`;
}

function generateFileList(files: FileItem[], path = ''): string {
  return files
    .map(file => {
      const currentPath = path ? `${path}/${file.name}` : file.name;

      if (file.type === 'file') {
        return `<li><a href="/${currentPath}">${currentPath}</a></li>`;
      } else if (file.type === 'folder' && file.children) {
        return `
        <li class="folder">📁 ${currentPath}/</li>
        ${generateFileList(file.children, currentPath)}
      `;
      }
      return '';
    })
    .join('');
}
