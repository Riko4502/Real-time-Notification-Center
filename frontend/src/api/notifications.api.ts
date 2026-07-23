import { io, Socket } from 'socket.io-client';

import { API_BASE_URL } from './config';

import type { Notification } from '@packages/types';

/**
 * Базовая обертка над fetch с подстановкой API_BASE_URL и обработкой ошибок
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, options);

  if (response.status === 204 || response.status === 304) {
    return [] as unknown as T;
  }

  if (!response.ok) {
    throw new Error(`Код HTTP ${response.status}`);
  }

  return response.json();
}

export const NotificationsApi = {
  // Запрос списка уведомлений для Short Polling
  getShortPolling: (): Promise<Notification[]> => {
    return apiFetch<Notification[]>('/api/notifications/short-polling');
  },

  // Запрос для Long Polling с опциональным указанием последнего ID и отменой запроса
  getLongPolling: (lastSeenId: string, signal?: AbortSignal): Promise<Notification[]> => {
    const query = lastSeenId ? `?lastSeenId=${encodeURIComponent(lastSeenId)}` : '';
    return apiFetch<Notification[]>(`/api/notifications/long-polling${query}`, { signal });
  },

  // Создание подписки на поток Server-Sent Events (SSE)
  createSseStream: (): EventSource => {
    return new EventSource(`${API_BASE_URL}/api/notifications/sse`);
  },

  // Инициализация WebSocket-подключения (Socket.io)
  connectWebSocket: (): Socket => {
    return io(API_BASE_URL || undefined, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });
  },
};
