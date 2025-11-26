import React, { lazy, Suspense, useState, useEffect, StrictMode } from 'react';
import { loadWebBox } from './loader';
import type { LoadProgress } from './types';

const LazyComponent = lazy(() => import('../App'));

const WBLoader: React.FC = () => {
  const [progress, setProgress] = useState<{
    message: string;
    percent: number;
  }>({
    message: 'Loading...',
    percent: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadWebBox(new URL(window.location.href), (p: LoadProgress) => {
      setProgress(p);
    }).then(() => {
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Загрузка</h1>
            <p className="text-gray-600">{progress.message}</p>
          </div>

          {/* Прогресс в процентах */}
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-blue-600 tabular-nums">
              {progress.percent.toFixed(2)}%
            </span>
          </div>

          {/* Полоска загрузки */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full"
              style={{ width: `${progress.percent.toFixed(2)}%` }}
            ></div>
          </div>

          {/* Дополнительная информация */}
          <div className="text-center">
            <div className="inline-flex items-center text-sm text-gray-500">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Пожалуйста, подождите...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StrictMode>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка компонента...</p>
            </div>
          </div>
        }
      >
        <LazyComponent />
      </Suspense>
    </StrictMode>
  );
};

export default WBLoader;
