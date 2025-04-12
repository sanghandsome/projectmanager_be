import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './mail/mail.module';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { WebsocketModule } from './websocket/websocket.module';
import { TeamModule } from './team/team.module';
import { DiscordService } from './websocket/discord.service';
import { TaskModule } from './task/task.module';
import { CfgStatementModule } from './cfg-statement/cfg-statement.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    NotificationModule,
    TeamModule,
    WebsocketModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST, // SMTP Server
        port: Number(process.env.MAIL_PORT),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"Support" <nguyendanhsanghandsome@gmail.com>', // Email gửi
      },
    }),
    MailModule,
    TaskModule,
    CfgStatementModule,
  ],
  // controllers: [AppController],
  providers: [DiscordService],
})
export class AppModule {}
