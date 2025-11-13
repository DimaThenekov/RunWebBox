import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import LeftSidebar from './components/LeftSidebar';
import EditorArea from './components/EditorArea';
import BrowserPreview from './components/BrowserPreview';
import Terminal from './components/Terminal';
import TabManager from './components/TabManager';
import { V86InstanceProvider } from './providers/V86InstanceProvider';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <V86InstanceProvider>
        <div className="h-screen flex flex-col bg-zinc-900 text-white">
          <div className="flex-1 overflow-hidden">
            <PanelGroup direction="horizontal" className="h-full">
              <Panel defaultSize={20} minSize={15} className="bg-zinc-900">
                <LeftSidebar />
              </Panel>

              <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-zinc-700 transition-colors" />

              <Panel defaultSize={40} minSize={30}>
                <PanelGroup direction="vertical" className="h-full">
                  <Panel
                    defaultSize={70}
                    minSize={40}
                    className="flex flex-col"
                  >
                    <TabManager />
                    <div className="flex-1 overflow-auto">
                      <EditorArea />
                    </div>
                  </Panel>

                  <PanelResizeHandle className="h-1 bg-zinc-800 hover:bg-zinc-700 transition-colors" />

                  <Panel defaultSize={30} minSize={20} className="bg-black">
                    <Terminal />
                  </Panel>
                </PanelGroup>
              </Panel>

              <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-zinc-700 transition-colors" />
              <Panel defaultSize={40} minSize={30} className="bg-zinc-900">
                <BrowserPreview />
              </Panel>
            </PanelGroup>
          </div>
        </div>
      </V86InstanceProvider>
    </Provider>
  );
};

export default App;
