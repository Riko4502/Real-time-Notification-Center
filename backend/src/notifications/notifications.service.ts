import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';

import {
  Notification,
  NotificationSource,
  NotificationType,
} from '@packages/types';

const types: NotificationType[] = ['info', 'warning', 'success', 'danger'];

const messages = [
  'Новый пользователь зарегистрировался на платформе',
  'Загрузка CPU базы данных превышает 85%',
  'Сборка и развертывание в продакшн выполнены успешно',
  'Неудачная попытка входа с нераспознанного IP-адреса',
  'Задержка API Gateway достигла пика в 450 мс',
  'Периодическое резервное копирование системы успешно завершено',
];

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private notifications: Notification[] = [];
  private change$ = new Subject<Notification>();
  private simulatorInterval: NodeJS.Timeout | null = null;
  private messageCounter = 1;

  constructor() {
    // Добавляем начальные уведомления для затравки
    this.addNotification('Система инициализирована', 'info', 'server');
    this.addNotification(
      'Добро пожаловать в демо уведомлений реального времени',
      'success',
      'server',
    );
  }

  onModuleInit() {
    // Запускаем симуляцию обновлений каждые 7 секунд
    this.simulatorInterval = setInterval(() => {
      const randomType = types[Math.floor(Math.random() * types.length)];

      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];

      this.addNotification(
        `${randomMessage} (Серверное уведомление #${this.messageCounter++})`,
        randomType,
        'server',
      );
    }, 7000);
  }

  onModuleDestroy() {
    if (this.simulatorInterval) {
      clearInterval(this.simulatorInterval);
    }
    this.change$.complete();
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  getNotificationsSince(lastId: string): Notification[] {
    const index = this.notifications.findIndex((n) => n.id === lastId);
    if (index === -1) {
      // Если lastId пустой или не найден, возвращаем все уведомления
      return this.notifications;
    }
    return this.notifications.slice(index + 1);
  }

  addNotification(
    message: string,
    type: NotificationType,
    source: NotificationSource,
  ): Notification {
    const notification: Notification = {
      id: Math.random().toString(36).substring(2, 11),
      message,
      timestamp: new Date().toISOString(),
      type,
      source,
    };
    this.notifications.push(notification);
    this.change$.next(notification);
    return notification;
  }

  // SSE-поток
  getEventStream() {
    return this.change$.asObservable();
  }

  // Вспомогательный метод для Long Polling
  async waitForNewNotification(
    lastSeenId: string,
    timeoutMs = 25000,
  ): Promise<Notification[]> {
    // 1. Если уже есть новые уведомления, возвращаем их сразу
    const newNotifications = this.getNotificationsSince(lastSeenId);

    if (newNotifications.length) {
      return newNotifications;
    }

    // 2. Иначе ждем появления нового уведомления или тайм-аута
    return new Promise<Notification[]>((resolve) => {
      let isResolved = false;

      const subscription = this.change$.subscribe((notif) => {
        if (!isResolved) {
          isResolved = true;
          subscription.unsubscribe();
          clearTimeout(timeoutId);
          // Возвращаем пришедшее уведомление
          resolve([notif]);
        }
      });

      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          subscription.unsubscribe();
          resolve([]); // Тайм-аут: возвращаем пустой список
        }
      }, timeoutMs);
    });
  }
}
