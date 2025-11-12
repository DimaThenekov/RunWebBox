import React from 'react';

const BrowserPreview: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700 flex justify-between items-center">
        <h3 className="font-medium">Browser Preview</h3>
        <div className="flex space-x-2">
          <button className="px-2 py-1 bg-zinc-700 rounded text-sm hover:bg-zinc-600">
            Refresh
          </button>
        </div>
      </div>
      <div className="flex-1 bg-white">
        <iframe
          src="about:blank"
          className="w-full h-full border-0"
          title="Browser Preview"
        />
      </div>
    </div>
  );
};

export default BrowserPreview;
