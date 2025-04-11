import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { connect } from 'node:http2';
import { NotificationService } from 'src/notification/notification.service';
import { DiscordService } from 'src/websocket/discord.service';

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {}

  async getAllTeam() {
    const team = await this.prisma.team.findMany({
      where: { deleted_at: null },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            roleId: true,
          },
        },
      },
    });

    const result = team.map((team) => {
      const leader = team.users.find((user) => user.roleId === 3);
      const memberCount = team.users.length;

      return {
        team_name: team.team_name,
        memberCount: memberCount,
        leader_name: leader ? leader.full_name : 'No Leader',
      };
    });

    return result;
  }

  async getUsersInTeam(teamId: string) {
    try {
      const team = await this.prisma.team.findUnique({
        where: {
          id: teamId,
        },
        include: {
          users: {
            select: {
              full_name: true,
              we_id: true,
            },
          },
        },
      });
      if (!team) {
        throw new Error('Team not found');
      }
      return team.users;
    } catch (error) {
      throw new Error(`Failed to fetch users for team: ${error.message}`);
    }
  }

  // async getSoftDeleteTeam(id: string) {
  //   const team = this.prisma.team.findMany({
  //     where: { deleted_at: { not: null } },
  //     include: {
  //       users: {
  //         select: {
  //           id: true,
  //           full_name: true,
  //         },
  //       },
  //     },
  //   });
  // }

  async getTeamById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: { id: true, team_name: true },
    });

    if (!team) {
      throw new NotFoundException(`Nhóm với id ${id} không tồn tại`);
    }

    return team;
  }

  async createTeam(data: CreateTeamDto) {
    return this.prisma.team.create({ data });
  }

  async addUserToTeam(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Không tìm thấy nhóm này');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.prisma.team.update({
      where: { id: teamId },
      data: {
        users: {
          connect: {
            id: userId,
          },
        },
      },
    });
    const message = 'Người dùng đươc thêm vào nhóm thành côgn';
    this.notificationService.messageAddUser(userId, teamId);
    if (user.discord_id) {
      await this.discordService.sendMessage(user.discord_id, message, 'user');
    }
    await this.discordService.sendMessage(
      '1349327338558586922',
      message,
      'channel',
    );
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: userId,
    });
    return message;
  }

  async updateTeam(id: string, data: UpdateTeamDto) {
    this.prisma.team.update({ where: { id }, data });
  }

  async removeUserToTeam(teamId: string, userId: string) {
    const team = this.prisma.team.findUnique({
      where: { id: teamId },
      include: { users: true },
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    // const userInTeam = team.users.find((user) => user.id === userId);
    await this.prisma.team.update({
      where: { id: teamId },
      data: {
        users: {
          disconnect: {
            id: userId,
          },
        },
      },
    });
    const message = 'Người dùng đã được xóa khỏi nhóm';
    this.notificationService.messageDeleteUser(userId, teamId);
    if (user.discord_id) {
      await this.discordService.sendMessage(user.discord_id, message, 'user');
    }

    await this.discordService.sendMessage(
      '1349327338558586922',
      message,
      'channel',
    );
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: userId,
    });
    return message;
  }

  async softDelete(id: string) {
    await this.prisma.team.update({
      where: { id: id },
      data: { deleted_at: new Date() },
    });
    return { message: 'Team đã được xóa thành công' };
  }

  async remove(id: string) {
    await this.prisma.team.delete({ where: { id: id } });
    return { message: 'Đã xóa team vĩnh viễn' };
  }
}
