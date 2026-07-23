import { Tag } from 'antd';

import { LOG_BADGE_COLORS } from '@constants/notification';

import type { LogEntry } from '@packages/types';
import './LogItem.css';
import type { FC } from 'react';

interface LogItemProps {
  log: LogEntry;
}

export const LogItem: FC<LogItemProps> = ({ log }) => {
  const color = LOG_BADGE_COLORS[log.protocol] ?? 'default';

  return (
    <div className={`log-line ${log.type}`}>
      <span className="log-time">[{log.timestamp}]</span>
      <Tag color={color} className="log-protocol-tag">
        {log.protocol}
      </Tag>
      <span className="log-text">{log.message}</span>
    </div>
  );
};
