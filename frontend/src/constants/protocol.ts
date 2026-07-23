export const PROTOCOL_OPTIONS = [
  {
    value: 'short-polling',
    title: 'Short Polling (Короткие опросы)',
    description: 'Регулярно запрашивает список уведомлений каждые 5 сек. Обычные HTTP-запросы.',
  },
  {
    value: 'long-polling',
    title: 'Long Polling (Длинные опросы)',
    description:
      'Сервер держит запрос открытым, пока не появится новое уведомление. Повторяется по кругу.',
  },
  {
    value: 'sse',
    title: 'SSE (Server-Sent Events)',
    description: 'Постоянный однонаправленный канал стриминга событий от сервера к клиенту.',
  },
  {
    value: 'websockets',
    title: 'WebSockets (Socket.io)',
    description:
      'Полнодуплексный двусторонний канал реального времени. Мгновенный обмен сообщениями.',
  },
] as const;
