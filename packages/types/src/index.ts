export type NotificationType = 'info' | 'warning' | 'success' | 'danger';
export type NotificationSource = 'server' | 'client';
export type LogType = 'info' | 'success' | 'warning' | 'error' | 'danger';

export type ProtocolMode = 'short-polling' | 'long-polling' | 'sse' | 'websockets';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
export type LogProtocol = 'SHORT' | 'LONG' | 'SSE' | 'WS' | 'SYSTEM';

export type NotificationFilterType = 'all' | NotificationType;
export type NotificationFilterSource = 'all' | NotificationSource;

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  source: NotificationSource;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  protocol: LogProtocol;
  type: LogType;
  message: string;
}

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: 'info', label: 'Инфо' },
  { value: 'success', label: 'Успех' },
  { value: 'warning', label: 'Предупреждение' },
  { value: 'danger', label: 'Ошибка' },
];

export * from './guards/notification.guard';
