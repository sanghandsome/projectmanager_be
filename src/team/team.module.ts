import { forwardRef, Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { UsersModule } from 'src/users/users.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationModule } from 'src/notification/notification.module';
import { MailModule } from 'src/mail/mail.module';
import { WebsocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MailModule,
    WebsocketModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [TeamController],
  providers: [TeamService, PrismaService],
  exports: [TeamService],
})
export class TeamModule {}
