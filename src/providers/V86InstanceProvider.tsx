import React, { useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import V86, { type V86Starter, type V86Config } from 'v86';
import {
  addVM,
  updateVMStatus,
  removeVM,
  type VMMetadata,
} from '../store/slices/vmSlice';

import {
  V86InstanceContext,
  type V86InstanceContextType,
} from '../contexts/V86InstanceContext';

export const V86InstanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const v86Instances = useRef<Map<string, V86Starter>>(new Map());
  const dispatch = useDispatch();
  const vms = useSelector((state: RootState) => state.vm.vms);

  const createVM = useCallback(
    (id: string, config: V86Config) => {
      // Удаляем существующую VM если есть
      if (v86Instances.current.has(id)) {
        const existingVM = v86Instances.current.get(id);
        existingVM?.destroy();
        v86Instances.current.delete(id);
      }

      // Создаем новую VM
      const newVM = new V86(config);
      v86Instances.current.set(id, newVM);

      // Добавляем метаданные в Redux
      const metadata: VMMetadata = {
        id,
        state: 'running',
        createdAt: new Date().toISOString(),
      };
      dispatch(addVM(metadata));

      // Синхронизация состояния VM с Redux
      newVM.add_listener('state-change', (newState: VMMetadata['state']) => {
        dispatch(updateVMStatus({ id, status: newState }));
      });

      return newVM;
    },
    [dispatch]
  );

  const getVM = useCallback((id: string) => {
    return v86Instances.current.get(id);
  }, []);

  const getVMMetadata = useCallback(
    (id: string) => {
      return vms.find(vm => vm.id === id);
    },
    [vms]
  );

  const destroyVM = useCallback(
    (id: string) => {
      const vm = v86Instances.current.get(id);
      if (vm) {
        vm.stop().then(() => {
          vm.destroy();
        });
        v86Instances.current.delete(id);
        dispatch(removeVM(id));
      }
    },
    [dispatch]
  );

  const getAllVMs = useCallback(() => {
    return v86Instances.current;
  }, []);

  const getAllVMMetadata = useCallback(() => {
    return vms;
  }, [vms]);

  const contextValue: V86InstanceContextType = {
    createVM,
    getVM,
    getVMMetadata,
    destroyVM,
    getAllVMs,
    getAllVMMetadata,
  };

  return (
    <V86InstanceContext.Provider value={contextValue}>
      {children}
    </V86InstanceContext.Provider>
  );
};
