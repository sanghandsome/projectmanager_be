// discord.service.ts
import { Injectable } from '@nestjs/common';
import { Client, TextChannel } from 'discord.js';

@Injectable()
export class DiscordService {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    });

    this.client.login(process.env.DISCORD_BOT_TOKEN).catch((error) => {
      console.error('Lỗi khi đăng nhập bot Discord:', error);
    });

    this.client.on('ready', () => {
      console.log('Bot đã sẵn sàng!');
    });
  }

  async sendNotification(channelId: string, message: string): Promise<void> {
    try {
      console.log('Gửi thông báo đến kênh:', channelId, 'nội dung:', message);
      const channel = this.client.channels.cache.get(channelId) as TextChannel;

      if (!channel) {
        throw new Error(
          `Kênh với ID ${channelId} không tồn tại hoặc bot không có quyền`,
        );
      }

      await channel.send(message);
      console.log('Thông báo đã được gửi thành công!');
    } catch (error) {
      console.error('Lỗi khi gửi thông báo:', error);
      throw error;
    }
  }

  async sendDirectMessage(
    discordUserId: string,
    message: string,
  ): Promise<void> {
    try {
      console.log(
        'Gửi tin nhắn DM đến người dùng:',
        discordUserId,
        'nội dung:',
        message,
      );
      const user = await this.client.users.fetch(discordUserId);

      if (!user) {
        throw new Error(`Không tìm thấy người dùng với ID ${discordUserId}`);
      }

      await user.send(message);
      console.log('Tin nhắn DM đã được gửi thành công!');
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn DM:', error);
      throw error;
    }
  }

  async sendMessage(
    targetId: string,
    message: string,
    targetType: 'channel' | 'user',
  ): Promise<void> {
    try {
      console.log(
        `Gửi ${targetType === 'channel' ? 'thông báo đến kênh' : 'tin nhắn DM đến người dùng'}:`,
        targetId,
        'nội dung:',
        message,
      );

      if (targetType === 'channel') {
        const channel = this.client.channels.cache.get(targetId) as TextChannel;

        if (!channel) {
          throw new Error(
            `Kênh với ID ${targetId} không tồn tại hoặc bot không có quyền`,
          );
        }

        await channel.send(message);
        console.log('Thông báo đã được gửi thành công đến kênh!');
      } else {
        // targetType === 'user'
        const user = await this.client.users.fetch(targetId);

        if (!user) {
          throw new Error(`Không tìm thấy người dùng với ID ${targetId}`);
        }

        await user.send(message);
        console.log('Tin nhắn DM đã được gửi thành công!');
      }
    } catch (error) {
      console.error(
        `Lỗi khi gửi ${targetType === 'channel' ? 'thông báo đến kênh' : 'tin nhắn DM'}:`,
        error,
      );
      throw error;
    }
  }
}
