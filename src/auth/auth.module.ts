import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { MailModule } from 'src/mail/mail.module';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MailModule,
    WebsocketModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    forwardRef(() => NotificationModule),
  ],
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
