import { useState, useEffect, useRef, useCallback } from 'react';

import { NotificationsApi } from '../api/notifications.api';

import type {
  Notification,
  LogEntry,
  ProtocolMode,
  ConnectionStatus,
  LogProtocol,
  LogType,
  NotificationType,
} from '@packages/types';
import type { Socket } from 'socket.io-client';

export function useNotifications() {
  const [mode, setMode] = useState<ProtocolMode>('short-polling');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [latency, setLatency] = useState<number | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sseRef = useRef<EventSource | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Функция для добавления записи в лог
  const addLog = useCallback((protocol: LogProtocol, type: LogType, message: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      protocol,
      type,
      message,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 100));
  }, []);

  // Функция для замера задержки
  const measureLatency = useCallback((startTime: number) => {
    const duration = Date.now() - startTime;
    setLatency(duration);
  }, []);

  // Очистка активных соединений при переключении
  const cleanupConnections = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setStatus('disconnected');
    setLatency(null);
  }, []);

  // 1. SHORT POLLING
  const startShortPolling = useCallback(() => {
    cleanupConnections();
    setStatus('connecting');
    addLog('SHORT', 'info', 'Запуск коротких опросов (интервал 5 сек)...');

    const fetchNotifications = async () => {
      const startTime = Date.now();
      addLog('SHORT', 'info', 'GET /api/notifications/short-polling - Запрос данных...');
      try {
        const data = await NotificationsApi.getShortPolling();

        measureLatency(startTime);

        setStatus('connected');
        setNotifications(data);

        addLog('SHORT', 'success', `Данные успешно получены. Всего уведомлений: ${data.length}`);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setStatus('disconnected');
        addLog('SHORT', 'error', `Ошибка запроса: ${errorMessage}`);
      }
    };

    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 5000);
  }, [cleanupConnections, addLog, measureLatency]);

  // 2. LONG POLLING
  const startLongPolling = useCallback(() => {
    cleanupConnections();
    setStatus('connecting');
    addLog('LONG', 'info', 'Запуск цикла длинных опросов...');

    let lastSeenId = '';
    let isFirstReq = true;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const runLongPoll = async () => {
      if (abortController.signal.aborted) return;

      addLog(
        'LONG',
        'info',
        `GET /api/notifications/long-polling?lastSeenId=${lastSeenId} - Ожидание обновлений...`,
      );

      if (isFirstReq) {
        setStatus('connecting');
      }

      const startTime = Date.now();
      try {
        const newNotifications = await NotificationsApi.getLongPolling(
          lastSeenId,
          abortController.signal,
        );

        measureLatency(startTime);
        setStatus('connected');
        isFirstReq = false;

        if (newNotifications?.length) {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const filteredNew = newNotifications.filter((n) => !existingIds.has(n.id));
            return [...prev, ...filteredNew];
          });

          lastSeenId = newNotifications[newNotifications.length - 1].id;
          addLog(
            'LONG',
            'success',
            `Получено ${newNotifications.length} новых уведомлений: "${newNotifications[0].message}"`,
          );
        } else {
          addLog(
            'LONG',
            'info',
            'Тайм-аут длинного опроса (нет новых уведомлений). Повторный опрос...',
          );
        }

        runLongPoll();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          addLog('LONG', 'info', 'Соединение длинного опроса прервано.');
          return;
        }

        const errorMessage = err instanceof Error ? err.message : String(err);
        setStatus('disconnected');
        isFirstReq = true;
        addLog('LONG', 'error', `Ошибка длинного опроса: ${errorMessage}. Повтор через 3 сек...`);
        setTimeout(() => {
          if (!abortController.signal.aborted) {
            runLongPoll();
          }
        }, 3000);
      }
    };

    runLongPoll();
  }, [cleanupConnections, addLog, measureLatency]);

  // 3. SSE
  const startSSE = useCallback(() => {
    cleanupConnections();
    setStatus('connecting');
    addLog('SSE', 'info', 'Подключение к потоку SSE (GET /api/notifications/sse)...');

    const eventSource = NotificationsApi.createSseStream();
    sseRef.current = eventSource;

    eventSource.onopen = () => {
      setStatus('connected');
      addLog('SSE', 'success', 'Установлено постоянное однонаправленное соединение SSE.');
    };

    eventSource.onmessage = (event) => {
      try {
        const newNotif: Notification = JSON.parse(event.data);
        const eventLatency = Date.now() - new Date(newNotif.timestamp).getTime();
        setLatency(eventLatency > 0 ? eventLatency : 0);

        setNotifications((prev) => {
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [...prev, newNotif];
        });
        addLog('SSE', 'success', `Получено уведомление: "${newNotif.message}"`);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        addLog('SSE', 'warning', `Ошибка обработки данных события: ${errorMessage}`);
      }
    };

    eventSource.onerror = (err) => {
      setStatus('disconnected');
      addLog('SSE', 'error', 'Соединение SSE разорвано. Ожидание авто-переподключения...');
      console.error('SSE Error:', err);
    };
  }, [cleanupConnections, addLog]);

  // 4. WEBSOCKETS
  const startWebSockets = useCallback(() => {
    cleanupConnections();
    setStatus('connecting');
    addLog('WS', 'info', 'Подключение к WebSocket-серверу Socket.io...');

    const socket = NotificationsApi.connectWebSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('connected');
      addLog('WS', 'success', `Соединение установлено! ID сокета: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      setStatus('disconnected');
      addLog('WS', 'warning', `WebSocket отключен: ${reason}`);
    });

    socket.on('connect_error', (err) => {
      setStatus('disconnected');
      addLog('WS', 'error', `Ошибка подключения WebSocket: ${err.message}`);
    });

    socket.on('init', (initialData: Notification[]) => {
      setNotifications(initialData);
      addLog(
        'WS',
        'info',
        `Загружен список из ${initialData.length} уведомлений с бэкенда по WebSocket.`,
      );
    });

    socket.on('notification', (newNotif: Notification) => {
      const socketLatency = Date.now() - new Date(newNotif.timestamp).getTime();
      setLatency(socketLatency > 0 ? socketLatency : 0);

      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        return [...prev, newNotif];
      });
      addLog(
        'WS',
        'success',
        `Событие WebSockets: "${newNotif.message}" (Источник: ${newNotif.source === 'client' ? 'Клиент' : 'Сервер'})`,
      );
    });
  }, [cleanupConnections, addLog]);

  useEffect(() => {
    const protocolHandlers: Record<ProtocolMode, () => void> = {
      'short-polling': startShortPolling,
      'long-polling': startLongPolling,
      sse: startSSE,
      websockets: startWebSockets,
    };

    protocolHandlers[mode]?.();
    return () => cleanupConnections();
  }, [mode, startShortPolling, startLongPolling, startSSE, startWebSockets, cleanupConnections]);

  const sendCustomNotification = useCallback(
    (message: string, type: NotificationType) => {
      if (mode !== 'websockets' || !socketRef.current || !socketRef.current.connected) {
        addLog(
          'SYSTEM',
          'warning',
          'Для отправки событий требуется активное WebSocket-подключение.',
        );
        return;
      }

      addLog('WS', 'info', `Отправка события 'create-notification': "${message}"`);
      socketRef.current.emit('create-notification', {
        message,
        type,
      });
    },
    [mode, addLog],
  );

  const clearNotifications = useCallback(() => setNotifications([]), []);
  const clearLogs = useCallback(() => setLogs([]), []);

  return {
    mode,
    setMode,
    status,
    notifications,
    logs,
    latency,
    sendCustomNotification,
    clearNotifications,
    clearLogs,
  };
}
