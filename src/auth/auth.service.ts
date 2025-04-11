import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { DiscordService } from 'src/websocket/discord.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private readonly discordService: DiscordService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}
  async signIn(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng!');
    }
    const accessToken = this.generateAccessToken(user.id),
      refreshToken = await this.generateRefreshToken(user.id);
    const payload = { sub: user.id, email: user.email };
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: { refresh_token: refreshToken },
    });
    const { password, refresh_token, ...safeUser } = user;
    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }

  async generateAccessToken(id: string) {
    return this.jwtService.sign(
      { id },
      {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE'),
      },
    );
  }

  async generateRefreshToken(id: String) {
    return this.jwtService.sign(
      { id },
      {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRE'),
      },
    );
  }

  async sendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email } });
    if (!user) throw new NotFoundException('Email không tồn tại');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp, otp_expires_at: expiresAt },
    });

    await this.mailService.sendOtp(email, otp);

    return { message: 'OTP đã được gửi vào email của bạn!' };
  }

  async verifyOtp(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.otp !== otp)
      throw new UnauthorizedException('OTP không hợp lệ!');

    if (!user.otp_expires_at || new Date() > user.otp_expires_at)
      throw new UnauthorizedException('OTP đã hết hạn!');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, otp: null, otp_expires_at: null },
    });
    const message = 'Mật khẩu đã được đặt lại thành công!';
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: user.id,
    });
    return message;
  }

  async changePassword(
    id: string,
    data: { newPassword: string; oldPassword: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!user || !(await bcrypt.compare(data.oldPassword, user.password))) {
      throw new ConflictException('Nhập Mật Khẩu Cũ Không Chính Xác');
    }
    const hashedPassword = await bcrypt.hash(data.newPassword, this.saltRounds);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true,
        user_name: true,
        email: true,
        full_name: true,
      },
    });
    const message = `Mật khẩu của người dùng ${user.full_name} đã bị thay đổi`;
    if (user.discord_id) {
      await this.discordService.sendMessage(user.discord_id, message, 'user');
    }
    this.notificationService.messagePasswordChangeNotification(id);
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: id,
    });
    return message;
  }
}
