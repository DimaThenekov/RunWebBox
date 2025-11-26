// providers/V86InstanceProvider.tsx
import React, { useRef, useCallback, useState, useMemo } from 'react';
import V86, { type V86Options } from 'v86';
import {
  V86InstanceContext,
  type V86InstanceContextType,
} from '../contexts/V86InstanceContext';
import { type VMMetadata, type VMInstance } from '../types/vm';

const cache = new Map<string, Uint8Array | null>();

export const V86InstanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const vmInstances = useRef<Map<string, VMInstance>>(new Map());
  const [vmMetadata, setVMMetadata] = useState<Map<string, VMMetadata>>(
    new Map()
  );

  // Обновление метаданных VM
  const updateVMMetadata = useCallback(
    (id: string, updates: Partial<VMMetadata>) => {
      setVMMetadata(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(id);

        if (existing) {
          newMap.set(id, {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
          });
        }

        return newMap;
      });
    },
    []
  );

  // Создание VM
  const createVM = useCallback(
    (id: string, config: V86Options) => {
      // Удаляем существующую VM если есть
      if (vmInstances.current.has(id)) {
        const existing = vmInstances.current.get(id);
        existing?.instance.destroy();
        vmInstances.current.delete(id);
      }

      // Создаем новую VM
      /* eslint-disable */
      // @ts-ignore: Unreachable code error
      const newVM = new V86(config);
      /* eslint-enable */

      const metadata: VMMetadata = {
        id,
        state: 'creating',
        createdAt: new Date().toISOString(),
      };

      const vmInstance: VMInstance = {
        id,
        instance: newVM,
        metadata,
        outputListeners: new Set(),
      };

      vmInstances.current.set(id, vmInstance);
      setVMMetadata(prev => new Map(prev.set(id, metadata)));

      // Обработчик вывода терминала
      let outputBuffer = '';
      let outputTimeout: number | null = null;

      newVM.add_listener('serial0-output-byte', (byte: number) => {
        const char = String.fromCharCode(byte);
        if (char === '\r') return;

        outputBuffer += char;

        if (outputTimeout) clearTimeout(outputTimeout);
        outputTimeout = setTimeout(() => {
          const instance = vmInstances.current.get(id);
          if (instance) {
            instance.outputListeners.forEach(listener =>
              listener(outputBuffer)
            );
          }
          outputBuffer = '';
          outputTimeout = null;
        }, 50);
      });

      function f() {
        if (newVM.fs9p) {
          console.log('INJECT', newVM.fs9p);
          newVM.fs9p.storage.load_from_server = async function (
            filePath: string
          ) {
            try {
              if (cache.get(filePath)) return cache.get(filePath);
              if (cache.get(filePath) === null) {
                while (cache.get(filePath) === null) {
                  await new Promise(r => setTimeout(r));
                }
                return cache.get(filePath);
              }
              cache.set(filePath, null);
              const url = newVM.fs9p.storage.baseurl + filePath;
              const response = await fetch(url);

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const arrayBuffer = await response.arrayBuffer();

              let data;
              if (url.endsWith('.zst')) {
                const responseArray = new Uint8Array(arrayBuffer);
                data = new Uint8Array(
                  newVM.zstd_decompress(
                    +url.match(/-(\d+)./)![1],
                    responseArray
                  )
                );
              } else {
                data = new Uint8Array(arrayBuffer);
              }
              cache.set(filePath, data);
              return data;
            } catch (error) {
              console.error(`Ошибка загрузки ${filePath}:`, error);
              return new Uint8Array();
            }
          };
        } else setTimeout(f);
      }
      f();

      newVM.add_listener('emulator-loaded', () => {
        updateVMMetadata(id, { state: 'running' });
      });

      newVM.add_listener('emulator-stopped', () => {
        updateVMMetadata(id, { state: 'stopped' });
      });

      newVM.add_listener('emulator-paused', () => {
        updateVMMetadata(id, { state: 'paused' });
      });

      newVM.add_listener('error', (error: Error) => {
        updateVMMetadata(id, {
          state: 'error',
          error: error?.message || String(error),
        });
      });

      return newVM;
    },
    [updateVMMetadata]
  );

  // Получение VM
  const getVM = useCallback((id: string) => {
    return vmInstances.current.get(id)?.instance;
  }, []);

  // Уничтожение VM
  const destroyVM = useCallback((id: string) => {
    const instance = vmInstances.current.get(id);
    if (instance) {
      instance.instance.destroy();
      instance.outputListeners.clear();
      vmInstances.current.delete(id);

      setVMMetadata(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  }, []);

  // Получение метаданных
  const getVMMetadata = useCallback(
    (id: string) => {
      return vmMetadata.get(id);
    },
    [vmMetadata]
  );

  const getAllVMMetadata = useCallback(() => {
    return Array.from(vmMetadata.values());
  }, [vmMetadata]);

  const getAllVMIds = useCallback(() => {
    return Array.from(vmMetadata.keys());
  }, [vmMetadata]);

  // Управление слушателями вывода
  const addOutputListener = useCallback(
    (vmId: string, listener: (output: string) => void) => {
      const instance = vmInstances.current.get(vmId);
      if (instance) {
        instance.outputListeners.add(listener);
      }
    },
    []
  );

  const removeOutputListener = useCallback(
    (vmId: string, listener: (output: string) => void) => {
      const instance = vmInstances.current.get(vmId);
      if (instance) {
        instance.outputListeners.delete(listener);
      }
    },
    []
  );

  // Отправка команды в VM
  const sendCommand = useCallback((vmId: string, command: string) => {
    const instance = vmInstances.current.get(vmId);
    if (instance) {
      instance.instance.serial0_send(command + '\n');
    }
  }, []);

  const contextValue: V86InstanceContextType = useMemo(
    () => ({
      createVM,
      getVM,
      destroyVM,
      getVMMetadata,
      getAllVMMetadata,
      getAllVMIds,
      addOutputListener,
      removeOutputListener,
      sendCommand,
    }),
    [
      createVM,
      getVM,
      destroyVM,
      getVMMetadata,
      getAllVMMetadata,
      getAllVMIds,
      addOutputListener,
      removeOutputListener,
      sendCommand,
    ]
  );

  return (
    <V86InstanceContext.Provider value={contextValue}>
      {children}
    </V86InstanceContext.Provider>
  );
};
