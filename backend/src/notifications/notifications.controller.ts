import { Controller, Get, Query, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Notification } from '@packages/types';

import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 1. Эндпоинт для Short Polling (Короткие опросы)
  // Возвращает все текущие уведомления. Клиент обращается сюда каждые 5 секунд.
  @Get('short-polling')
  getShortPolling(): Notification[] {
    return this.notificationsService.getNotifications();
  }

  // 2. Эндпоинт для Long Polling (Длинные опросы)
  // Удерживает соединение открытым до появления нового уведомления или тайм-аута.
  @Get('long-polling')
  async getLongPolling(
    @Query('lastSeenId') lastSeenId?: string,
  ): Promise<Notification[]> {
    // Ожидаем максимум 20 секунд во избежание таймаутов прокси/шлюзов.
    const newNotifications =
      await this.notificationsService.waitForNewNotification(
        lastSeenId || '',
        20000,
      );
    return newNotifications;
  }

  // 3. Эндпоинт для Server-Sent Events (SSE)
  // Создает постоянный однонаправленный поток данных от сервера к клиенту.
  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.notificationsService.getEventStream().pipe(
      map(
        (notification) =>
          ({
            data: notification,
          }) as MessageEvent,
      ),
    );
  }
}
