import { LoadingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Badge, Tag, Space, Spin } from 'antd';

import { STATUS_MAP, PROTOCOL_LABELS } from '@constants/notification';

import type { ConnectionStatus, ProtocolMode } from '@packages/types';
import type { FC } from 'react';

import './StatusBadge.css';

interface StatusBadgeProps {
  mode: ProtocolMode;
  status: ConnectionStatus;
  latency: number | null;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ mode, status, latency }) => {
  const badgeInfo = STATUS_MAP[status] ?? { status: 'error', text: 'Отключено' };
  const protocolLabel = PROTOCOL_LABELS[mode] ?? mode;
  const isConnecting = status === 'connecting';

  return (
    <div className="status-badge-container">
      <Space size="small" className="status-badge-space">
        <Space size="middle">
          {isConnecting ? (
            <Spin indicator={<LoadingOutlined spin className="status-loader-spin" />} />
          ) : (
            <Badge status={badgeInfo.status} />
          )}
          <span className="status-text">
            {protocolLabel}: <strong>{badgeInfo.text}</strong>
          </span>
        </Space>
        {latency !== null && (
          <Tag icon={<ThunderboltOutlined />} color="cyan">
            {latency} мс
          </Tag>
        )}
      </Space>
    </div>
  );
};
