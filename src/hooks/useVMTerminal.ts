import { useState, useEffect, useCallback } from 'react';
import useV86 from './useV86';

export const useVMTerminal = (vmId: string | null) => {
  const [output, setOutput] = useState<string[]>([]);
  const { addOutputListener, removeOutputListener } = useV86();

  const addOutput = useCallback((text: string) => {
    setOutput(prev => [...prev, text]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  useEffect(() => {
    if (!vmId) {
      setOutput(['$ No VM selected']);
      return;
    }

    // Добавляем слушатель вывода
    addOutputListener(vmId, addOutput);

    // Очистка при размонтировании
    return () => {
      removeOutputListener(vmId, addOutput);
    };
  }, [vmId, addOutputListener, removeOutputListener, addOutput]);

  return {
    output,
    addOutput,
    clearOutput,
  };
};
