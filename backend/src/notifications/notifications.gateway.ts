import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { NotificationType, isNotificationType } from '@packages/types';

import { NotificationsService } from './notifications.service';

const allowedOrigin = process.env.FRONTEND_URL || '*';

@WebSocketGateway({
  cors: {
    origin: allowedOrigin,
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationsService: NotificationsService) {}

  onModuleInit() {
    // Автоматически транслируем все новые уведомления всем подключенным клиентам.
    this.notificationsService.getEventStream().subscribe((notification) => {
      if (this.server) {
        this.server.emit('notification', notification);
      }
    });
  }

  handleConnection(client: Socket) {
    console.log(`WebSocket client connected: ${client.id}`);
    // Отправляем начальный список уведомлений только что подключенному клиенту.
    client.emit('init', this.notificationsService.getNotifications());
  }

  handleDisconnect(client: Socket) {
    console.log(`WebSocket client disconnected: ${client.id}`);
  }

  // Позволяет клиенту генерировать уведомления со строгой валидацией
  @SubscribeMessage('create-notification')
  handleCreateNotification(
    @MessageBody() data?: { message?: string; type?: NotificationType },
  ): void {
    if (!data || typeof data !== 'object') {
      return;
    }

    const rawMessage =
      typeof data.message === 'string' ? data.message.trim() : '';

    const message =
      rawMessage.slice(0, 300) || 'Пользовательское событие с фронтенда';

    const type: NotificationType = isNotificationType(data.type)
      ? data.type
      : 'info';

    this.notificationsService.addNotification(message, type, 'client');
  }
}
