import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule.forRoot()], // Load biến môi trường từ .env
  providers: [MailService],
  exports: [MailService], // Xuất MailService để dùng ở module khác
})
export class MailModule {}
