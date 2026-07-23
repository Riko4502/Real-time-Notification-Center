import {
  type ConnectionStatus,
  type ProtocolMode,
  type NotificationType,
  type LogProtocol,
  NOTIFICATION_TYPE_OPTIONS,
} from '@packages/types';

export interface StatusConfig {
  status: 'success' | 'processing' | 'error';
  text: string;
}

export const STATUS_MAP: Record<ConnectionStatus, StatusConfig> = {
  connected: { status: 'success', text: 'Подключено' },
  connecting: { status: 'processing', text: 'Подключение...' },
  disconnected: { status: 'error', text: 'Отключено' },
};

export const PROTOCOL_LABELS: Record<ProtocolMode, string> = {
  'short-polling': 'Short Polling',
  'long-polling': 'Long Polling',
  sse: 'SSE',
  websockets: 'WebSockets',
};

export interface AlertConfig {
  type: NotificationType;
  iconColor: string;
}

export const NOTIFICATION_ALERT_MAP: Record<NotificationType, AlertConfig> = {
  success: { type: 'success', iconColor: '#10b981' },
  warning: { type: 'warning', iconColor: '#f59e0b' },
  danger: { type: 'danger', iconColor: '#ef4444' },
  info: { type: 'info', iconColor: '#6366f1' },
};

export const LOG_BADGE_COLORS: Record<LogProtocol, string> = {
  SHORT: 'processing',
  LONG: 'purple',
  SSE: 'orange',
  WS: 'cyan',
  SYSTEM: 'default',
};

export const SOURCE_OPTIONS = [
  { value: 'all', label: 'Все источники' },
  { value: 'server', label: 'Сервер' },
  { value: 'client', label: 'Клиент' },
];

export const TYPE_SELECT_OPTIONS = [
  { value: 'all', label: 'Все типы' },
  ...NOTIFICATION_TYPE_OPTIONS,
];
