import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [WebsocketModule, forwardRef(() => NotificationModule)],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
