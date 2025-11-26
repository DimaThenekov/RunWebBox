import { createRoot } from 'react-dom/client';
import './index.css';
import WBLoader from './webBoxLoader/WBLoader';

import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Импортируем worker'ы как URL с помощью Vite
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// Настройка MonacoEnvironment
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new JsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new CssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new HtmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new TsWorker();
    }
    return new EditorWorker();
  },
};

// Теперь конфигурируем loader
loader.config({ monaco });

createRoot(document.getElementById('root')!).render(<WBLoader></WBLoader>);
