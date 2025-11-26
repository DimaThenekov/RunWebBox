import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FileItem } from '../../types/fileSystem';

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
      id: 'webbox.json',
      name: 'webbox.json',
      type: 'file',
      content: '{}',
    },
    {
      id: 'index.html',
      name: 'index.html',
      type: 'file',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Counter Clicker</title>
    <link rel="stylesheet" href="styles/style.css">
</head>
<body>
    <div class="container">
        <h1>Counter Clicker</h1>
        
        <div class="counter-display">
            <span id="counter-value">0</span>
        </div>
        
        <div class="buttons">
            <button id="increment-btn" class="btn btn-primary">+</button>
            <button id="decrement-btn" class="btn btn-secondary">-</button>
            <button id="reset-btn" class="btn btn-danger">Reset</button>
        </div>
        
        <div class="location-info">
            <h3>Location Information</h3>
            <div id="location-display">
                <p><strong>URL:</strong> <span id="current-url"></span></p>
                <p><strong>Path:</strong> <span id="current-path"></span></p>
                <p><strong>Host:</strong> <span id="current-host"></span></p>
                <p><strong>Protocol:</strong> <span id="current-protocol"></span></p>
            </div>
        </div>
        
        <div class="counter-history">
            <h3>Counter History</h3>
            <div id="history-list"></div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>`,
    },
    {
      id: 'app.js',
      name: 'app.js',
      type: 'file',
      content: `class Counter {
    constructor() {
        this.count = 0;
        this.history = [];
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.bindEvents();
        this.updateDisplay();
        this.displayLocation();
    }

    bindEvents() {
        document.getElementById('increment-btn').addEventListener('click', () => {
            this.increment();
        });

        document.getElementById('decrement-btn').addEventListener('click', () => {
            this.decrement();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '+' || e.key === '=') {
                this.increment();
            } else if (e.key === '-' || e.key === '_') {
                this.decrement();
            } else if (e.key === 'r' || e.key === 'R') {
                this.reset();
            }
        });
    }

    increment() {
        this.count++;
        this.addToHistory('increment');
        this.updateDisplay();
        this.saveToLocalStorage();
    }

    decrement() {
        this.count--;
        this.addToHistory('decrement');
        this.updateDisplay();
        this.saveToLocalStorage();
    }

    reset() {
        this.addToHistory('reset', this.count);
        this.count = 0;
        this.updateDisplay();
        this.saveToLocalStorage();
    }

    addToHistory(action, previousValue = null) {
        const timestamp = new Date().toLocaleTimeString();
        let description = '';
        
        switch(action) {
            case 'increment':
                description = \`Increased to \${this.count}\`;
                break;
            case 'decrement':
                description = \`Decreased to \${this.count}\`;
                break;
            case 'reset':
                description = \`Reset from \${previousValue} to 0\`;
                break;
        }

        this.history.unshift({
            action,
            description,
            timestamp,
            value: this.count
        });

        // Keep only last 10 history items
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }

        this.updateHistoryDisplay();
    }

    updateDisplay() {
        const counterElement = document.getElementById('counter-value');
        counterElement.textContent = this.count;
        
        // Add animation
        counterElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            counterElement.style.transform = 'scale(1)';
        }, 150);
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item ' +  item.action;
            historyItem.innerHTML = \`
                <strong>\${item.timestamp}</strong>: \${item.description}
            \`;
            historyList.appendChild(historyItem);
        });
    }

    displayLocation() {
        document.getElementById('current-url').textContent = window.location.href;
        document.getElementById('current-path').textContent = window.location.pathname;
        document.getElementById('current-host').textContent = window.location.host;
        document.getElementById('current-protocol').textContent = window.location.protocol;
    }

    saveToLocalStorage() {
        const data = {
            count: this.count,
            history: this.history
        };
        localStorage.setItem('counterApp', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('counterApp');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.count = data.count || 0;
                this.history = data.history || [];
                this.updateHistoryDisplay();
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }
}

// Initialize the counter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Counter();
});

// Additional location information that updates in real-time
window.addEventListener('popstate', () => {
    document.getElementById('current-url').textContent = window.location.href;
    document.getElementById('current-path').textContent = window.location.pathname;
});`,
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
          content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 2.5em;
}

.counter-display {
    text-align: center;
    margin: 30px 0;
}

#counter-value {
    font-size: 4em;
    font-weight: bold;
    color: #667eea;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin: 30px 0;
}

.btn {
    padding: 12px 24px;
    font-size: 1.2em;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: bold;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn-primary {
    background-color: #4CAF50;
    color: white;
}

.btn-secondary {
    background-color: #2196F3;
    color: white;
}

.btn-danger {
    background-color: #f44336;
    color: white;
}

.location-info, .counter-history {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    border-left: 4px solid #667eea;
}

.location-info h3, .counter-history h3 {
    color: #333;
    margin-bottom: 15px;
}

#location-display p {
    margin: 8px 0;
    font-size: 0.95em;
}

#location-display strong {
    color: #555;
    min-width: 80px;
    display: inline-block;
}

#history-list {
    max-height: 150px;
    overflow-y: auto;
}

.history-item {
    padding: 8px 12px;
    margin: 5px 0;
    background: white;
    border-radius: 5px;
    border-left: 3px solid #4CAF50;
    font-size: 0.9em;
}

.history-item.decrement {
    border-left-color: #f44336;
}

.history-item.reset {
    border-left-color: #ff9800;
}

/* Responsive design */
@media (max-width: 600px) {
    .container {
        padding: 20px;
        margin: 10px;
    }
    
    h1 {
        font-size: 2em;
    }
    
    #counter-value {
        font-size: 3em;
    }
    
    .buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .btn {
        width: 100%;
        max-width: 200px;
    }
}`,
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
