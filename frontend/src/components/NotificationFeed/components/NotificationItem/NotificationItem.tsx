import { Alert, Tag } from 'antd';

import type { NotificationSource, NotificationType } from '@packages/types';
import './NotificationItem.css';
import type { FC } from 'react';

interface NotificationItemProps {
  message: string;
  timestamp: string;
  type: NotificationType;
  source: NotificationSource;
}

const getAlertType = (type: NotificationType): 'info' | 'warning' | 'success' | 'error' => {
  if (type === 'danger') return 'error';
  return type;
};

export const NotificationItem: FC<NotificationItemProps> = ({
  message,
  timestamp,
  type,
  source,
}) => {
  const alertType = getAlertType(type);
  const isClient = source === 'client';

  return (
    <div className="notif-card-wrapper">
      <Alert
        type={alertType}
        showIcon
        title={<span className="notif-message-text">{message}</span>}
        description={
          <div className="notif-meta-row">
            <span className="notif-time-text">{new Date(timestamp).toLocaleTimeString()}</span>
            <Tag color={isClient ? 'processing' : 'purple'} className="notif-source-tag">
              {isClient ? 'клиент' : 'сервер'}
            </Tag>
          </div>
        }
        className="notif-alert-item"
      />
    </div>
  );
};
