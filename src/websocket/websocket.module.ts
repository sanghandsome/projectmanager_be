// src/websocket/websocket.module.ts
import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { DiscordService } from './discord.service';

@Module({
  providers: [WebsocketGateway, DiscordService],
  exports: [WebsocketGateway, DiscordService],
})
export class WebsocketModule {}
