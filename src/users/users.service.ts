import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { NotificationService } from 'src/notification/notification.service';
import { DiscordService } from 'src/websocket/discord.service';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly discordService: DiscordService,
  ) {}

  async createUser(data: CreateUserDto) {
    const emailExists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    const hashedData: Prisma.UserCreateInput = {
      ...data,
      password: hashedPassword,
    };
    const newUser = await this.prisma.user.create({
      data: hashedData,
      select: {
        id: true,
        user_name: true,
        email: true,
        full_name: true,
      },
    });
    const message = 'Chào mừng bạn đến với WehaGroup';
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: newUser.id,
    });
    this.notificationService.messageWelcomeNotification(newUser.id);
    return message;
  }

  async getUsers() {
    return this.prisma.user.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        user_name: true,
        we_id: true,
        full_name: true,
        sex: true,
        email: true,
        phone: true,
        discord_id: true,
        date_of_birth: true,
      },
      orderBy: [{ created_at: 'desc' }, { updated_at: 'desc' }],
    });
  }

  async getUserSoftDelete() {
    return this.prisma.user.findMany({
      where: { deleted_at: { not: null } },
      select: {
        id: true,
        user_name: true,
        we_id: true,
        full_name: true,
        sex: true,
        email: true,
        phone: true,
        discord_id: true,
        date_of_birth: true,
      },
      orderBy: {
        deleted_at: 'desc',
      },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        user_name: true,
        we_id: true,
        full_name: true,
        sex: true,
        email: true,
        phone: true,
        discord_id: true,
        date_of_birth: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Người dùng ${id}  không tồn tại`);
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserDto) {
    await this.getUserById(id);

    const hashedData = {
      ...data,
      password: data.password
        ? await bcrypt.hash(data.password, this.saltRounds)
        : undefined,
    };
    const updateUser = this.prisma.user.update({
      where: { id },
      data: hashedData,
      select: {
        id: true,
        user_name: true,
        email: true,
        full_name: true,
        discord_id: true,
      },
    });
    const message = 'Cập nhật thông tin thành công';
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: id,
    });
    this.notificationService.messageUpdateNotification(id);
    return message;
  }

  async softDeleteUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async deleteUser(id: string) {
    await this.getUserById(id);

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        user_name: true,
        email: true,
      },
    });
  }
}
