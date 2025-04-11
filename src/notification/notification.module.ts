import { forwardRef, Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { TeamModule } from 'src/team/team.module';
import { MailModule } from 'src/mail/mail.module';
import { WebsocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MailModule,
    WebsocketModule,
    forwardRef(() => TeamModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService],
  exports: [NotificationService],
})
export class NotificationModule {}
