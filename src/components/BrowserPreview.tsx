import React, { useRef, useState, useEffect } from 'react';
import { useServiceWorker } from '../hooks/useServiceWorker';

const BrowserPreview: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isReady } = useServiceWorker();
  const [isLoading, setIsLoading] = useState(true);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      // Принудительное обновление с уникальным параметром чтобы избежать кеширования
      iframeRef.current.src = `/?t=${Date.now()}`;
    }
  };

  // Автоматически перезагружаем iframe когда Service Worker готов
  useEffect(() => {
    if (isReady && iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = `/?t=${Date.now()}`;
    }
  }, [isReady]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700 flex justify-between items-center">
        <h3 className="font-medium">Browser Preview</h3>
        <div className="flex space-x-2">
          <button
            className="px-2 py-1 bg-zinc-700 rounded text-sm hover:bg-zinc-600 disabled:opacity-50"
            onClick={handleRefresh}
            disabled={!isReady || isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white relative">
        {!isReady ? (
          <div className="h-full flex items-center justify-center text-zinc-500">
            Initializing preview environment...
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                <div className="text-zinc-500">Loading preview...</div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src="/"
              className="w-full h-full border-0"
              title="Browser Preview"
              onLoad={() => {
                setIsLoading(false);
              }}
              sandbox="allow-scripts allow-same-origin"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BrowserPreview;
