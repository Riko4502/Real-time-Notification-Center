import { PROTOCOL_OPTIONS } from '@constants/protocol';

import { ProtocolOption } from './components';

import type { ProtocolMode } from '@packages/types';
import type { FC } from 'react';

import './ProtocolSelector.css';

interface ProtocolSelectorProps {
  currentMode: ProtocolMode;
  onSelectMode: (mode: ProtocolMode) => void;
}

export const ProtocolSelector: FC<ProtocolSelectorProps> = ({ currentMode, onSelectMode }) => {
  return (
    <div className="protocol-selector-group">
      <h3>Выберите протокол</h3>
      {PROTOCOL_OPTIONS.map((proto) => (
        <ProtocolOption
          key={proto.value}
          value={proto.value}
          currentMode={currentMode}
          title={proto.title}
          description={proto.description}
          onSelect={onSelectMode}
        />
      ))}
    </div>
  );
};
