import { Card, Flex, Radio } from 'antd';

import type { ProtocolMode } from '@packages/types';
import './ProtocolOption.css';
import type { FC } from 'react';

interface ProtocolOptionProps {
  value: ProtocolMode;
  currentMode: ProtocolMode;
  title: string;
  description: string;
  onSelect: (value: ProtocolMode) => void;
}

export const ProtocolOption: FC<ProtocolOptionProps> = ({
  value,
  currentMode,
  title,
  description,
  onSelect,
}) => {
  const isActive = currentMode === value;

  return (
    <Card
      hoverable
      size="small"
      className={`protocol-option-card ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(value)}
    >
      <Flex gap="0.75rem" align="flex-start">
        <Radio checked={isActive} value={value} />
        <Flex vertical>
          <span className="option-title">{title}</span>
          <span className="option-desc">{description}</span>
        </Flex>
      </Flex>
    </Card>
  );
};
