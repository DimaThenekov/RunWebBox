import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import useV86 from '../hooks/useV86';
import { type RootState } from '../store/store';

interface TerminalOutput {
  vmId: string;
  content: string[];
}

const Terminal: React.FC = () => {
  const [activeVmId, setActiveVmId] = useState<string | null>(null);
  const [terminalOutputs, setTerminalOutputs] = useState<TerminalOutput[]>([]);
  const [inputCommand, setInputCommand] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const { createVM, destroyVM, getVM } = useV86();
  const vms = useSelector((state: RootState) => state.vm.vms);

  // Получить вывод для активной VM
  const getActiveOutput = !activeVmId
    ? ['$ No VM selected. Create or select a VM to start.']
    : terminalOutputs.find(output => output.vmId === activeVmId)?.content || [
        '$ VM terminal ready...',
      ];

  // Добавить вывод в терминал конкретной VM
  const addOutput = (vmId: string, message: string) => {
    setTerminalOutputs(prev => {
      const existing = prev.find(output => output.vmId === vmId);
      if (existing) {
        return prev.map(output =>
          output.vmId === vmId
            ? { ...output, content: [...output.content, message] }
            : output
        );
      } else {
        return [...prev, { vmId, content: [message] }];
      }
    });
  };

  // Прокрутка к низу терминала
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutputs]);

  // Автоматически выбираем первую VM при создании
  useEffect(() => {
    if (vms.length > 0 && !activeVmId) {
      setActiveVmId(vms[0].id);
    } else if (vms.length === 0) {
      setActiveVmId(null);
    }
  }, [vms, activeVmId]);

  // Обработчик ввода команд
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVmId || !inputCommand.trim()) return;

    // Добавляем команду в вывод
    addOutput(activeVmId, `$ ${inputCommand}`);

    // Отправляем команду в VM
    getVM(activeVmId)!.serial0_send(inputCommand + '\n');
    setInputCommand('');
  };

  // Функция для создания тестовой VM
  const handleCreateTestVM = () => {
    const vmId = `test-vm-${Date.now()}`;

    addOutput(vmId, `$ Creating test VM: ${vmId}`);
    setActiveVmId(vmId);

    try {
      const config = {
        wasm_path: '/v86/v86.wasm',
        memory_size: 512 * 1024 * 1024,
        vga_memory_size: 8 * 1024 * 1024,
        bios: { url: '/v86/bios/seabios.bin' },
        vga_bios: { url: '/v86/bios/vgabios.bin' },
        filesystem: {
          baseurl: '/v86/image/alpine-rootfs-flat',
          basefs: '/v86/image/alpine-fs.json',
        },
        net_device: {
          relay_url: 'fetch',
          type: 'virtio',
          router_ip: '192.168.86.1',
          vm_ip: '192.168.86.200',
        },
        disable_speaker: true,
        autostart: true,
        bzimage_initrd_from_filesystem: true,
        cmdline:
          'rw root=host9p rootfstype=9p rootflags=trans=virtio,cache=loose modules=virtio_pci tsc=reliable',
      };

      createVM(vmId, config);
      addOutput(vmId, `✓ VM ${vmId} created successfully`);
      addOutput(vmId, `$ VM state: creating -> running`);
      let t = 0;
      let text = '';
      getVM(vmId)!.add_listener('serial0-output-byte', (byte: number) => {
        const char = String.fromCharCode(byte);
        if (char === '\r') {
          return;
        }
        text += char;
        if (t) clearTimeout(t);
        t = setTimeout(() => {
          addOutput(vmId, text);
          t = 0;
          text = '';
        }, 100);
      });
    } catch (error) {
      addOutput(vmId, `✗ Failed to create VM: ${error}`);
    }
  };

  // Функция для удаления VM
  const handleDestroyVM = (vmId: string) => {
    addOutput(vmId, `$ Destroying VM: ${vmId}`);
    destroyVM(vmId);

    // Удаляем вывод терминала
    setTerminalOutputs(prev => prev.filter(output => output.vmId !== vmId));

    // Если удаляем активную VM, выбираем другую
    if (activeVmId === vmId) {
      const otherVms = vms.filter(vm => vm.id !== vmId);
      setActiveVmId(otherVms.length > 0 ? otherVms[0].id : null);
    }

    addOutput(vmId, `✓ VM ${vmId} destroyed`);
  };

  // Функция для отображения информации о всех VM
  const displayVMInfo = () => {
    //const activeOutput = getActiveOutput();
    const info = [
      '$ === Virtual Machines Information ===',
      ...vms.map(
        vm =>
          `$ VM: ${vm.id}\n` +
          `$   State: ${vm.state}\n` +
          `$   Created: ${new Date(vm.createdAt).toLocaleTimeString()}\n` +
          `$   Updated: ${vm.updatedAt ? new Date(vm.updatedAt).toLocaleTimeString() : 'N/A'}`
      ),
      '$ ===================================',
    ];

    if (activeVmId) {
      setTerminalOutputs(prev =>
        prev.map(output =>
          output.vmId === activeVmId
            ? { ...output, content: [...output.content, ...info] }
            : output
        )
      );
    }
  };

  // Функция для очистки терминала активной VM
  const clearTerminal = () => {
    if (activeVmId) {
      setTerminalOutputs(prev =>
        prev.map(output =>
          output.vmId === activeVmId
            ? {
                ...output,
                content: [
                  '$ Terminal cleared',
                  '$ Ready to execute commands...',
                ],
              }
            : output
        )
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок и кнопки управления */}
      <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-700 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium">Terminal</h3>
          {/* Селектор активной VM */}
          {vms.length > 0 && (
            <select
              value={activeVmId || ''}
              onChange={e => setActiveVmId(e.target.value)}
              className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-white"
            >
              {vms.map(vm => (
                <option key={vm.id} value={vm.id}>
                  {vm.id} ({vm.state})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreateTestVM}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
          >
            Create Test VM
          </button>
          <button
            onClick={displayVMInfo}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          >
            Show VM Info
          </button>
          <button
            onClick={clearTerminal}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Область вывода терминала */}
      <div className="flex-1 bg-black p-4 font-mono text-sm text-green-400 overflow-auto">
        {getActiveOutput.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap break-words">
            {line}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Поле ввода команды */}
      {activeVmId && (
        <form
          onSubmit={handleCommandSubmit}
          className="border-t border-zinc-700"
        >
          <div className="flex items-center bg-zinc-900 px-4 py-2">
            <span className="text-green-400 mr-2">$</span>
            <input
              type="text"
              value={inputCommand}
              onChange={e => setInputCommand(e.target.value)}
              placeholder="Type command and press Enter..."
              className="flex-1 bg-transparent text-white outline-none placeholder-zinc-500"
              autoFocus
            />
          </div>
        </form>
      )}

      {/* Список активных VM */}
      {vms.length > 0 && (
        <div className="border-t border-zinc-700 bg-zinc-900 p-4">
          <div className="text-cyan-400 mb-2 font-medium">
            Active Virtual Machines:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {vms.map(vm => (
              <div key={vm.id} className="bg-zinc-800 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium truncate">
                    {vm.id}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      vm.state === 'running'
                        ? 'bg-green-600'
                        : vm.state === 'paused'
                          ? 'bg-yellow-600'
                          : vm.state === 'stopped'
                            ? 'bg-gray-600'
                            : 'bg-red-600'
                    }`}
                  >
                    {vm.state}
                  </span>
                </div>
                <div className="text-zinc-400 text-xs mb-2">
                  Created: {new Date(vm.createdAt).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveVmId(vm.id)}
                    className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                      activeVmId === vm.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    {activeVmId === vm.id ? 'Active' : 'Select'}
                  </button>
                  <button
                    onClick={() => handleDestroyVM(vm.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                  >
                    Destroy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Terminal;
