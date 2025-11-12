import React from 'react';

const Terminal: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-700">
        <h3 className="font-medium">Terminal</h3>
      </div>
      <div className="flex-1 bg-black p-2 font-mono text-sm text-green-400 overflow-auto">
        <div>$ Welcome to RunWebBox Terminal</div>
        <div>$ Ready to execute commands...</div>
      </div>
    </div>
  );
};

export default Terminal;
