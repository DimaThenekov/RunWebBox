import { useContext } from 'react';
import { V86InstanceContext } from '../contexts/V86InstanceContext';

export default () => {
  const context = useContext(V86InstanceContext);
  if (context === undefined) {
    throw new Error('useV86 must be used within a V86InstanceProvider');
  }
  return context;
};
