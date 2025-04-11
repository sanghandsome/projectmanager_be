// src/websocket/websocket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DiscordService } from './discord.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly discordService: DiscordService) {}

  @SubscribeMessage('passwordChanged')
  async handlePasswordChange(
    @MessageBody() data: { userId: string; channelId: string },
  ) {
    const { userId, channelId } = data;
    const message = `Mật khẩu của người dùng ${userId} đã bị thay đổi`;

    try {
      await this.discordService.sendNotification(channelId, message);
      this.server.emit('notification', {
        success: true,
        message: 'Thông báo đã được gửi thành công đến Discord',
        userId,
      });
    } catch (error) {
      this.server.emit('notification', {
        success: false,
        message: 'Lỗi khi gửi thông báo đến Discord',
        error: error.message,
      });
    }
  }
}
