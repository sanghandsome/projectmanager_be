import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { TeamService } from 'src/team/team.service';
import { MailService } from 'src/mail/mail.service';
import { TaskService } from 'src/task/task.service';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly teamService: TeamService,
    private readonly mailService: MailService,
    private readonly taskService: TaskService,
  ) {}

  async createNotification(data: {
    message: string;
    team_id: string | null;
    user_id: string | null;
  }) {
    return this.prisma.notification.create({ data });
  }

  async getNotifications() {
    return this.prisma.notification.findMany({
      where: { deleted_at: null },
      select: {
        message: true,
        team: {
          select: {
            id: true,
            team_name: true,
          },
        },
        user: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
      orderBy: [{ created_at: 'desc' }, { updated_at: 'desc' }],
    });
  }

  async getNotificationSoftDelete() {
    return this.prisma.notification.findMany({
      where: { deleted_at: { not: null } },
      select: {
        message: true,
        team_id: true,
        user_id: true,
      },
      orderBy: [{ created_at: 'desc' }, { updated_at: 'desc' }],
    });
  }

  async getNotificationById(id: string) {
    return this.prisma.notification.findMany({
      where: {
        id,
      },
    });
  }

  async updateNotification(
    id: string,
    data: {
      message: string;
      team_id: string;
      user_id: string;
    },
  ) {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  async softDeleteNotification(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async deleteNotification(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  //Thông báo về email người dùng được thêm vào nhóm
  async messageAddUser(userID: string, teamID: string) {
    const user = await this.userService.getUserById(userID);
    const team = await this.teamService.getTeamById(teamID);
    await this.mailService.sendUserAddedNotification(
      user.email,
      user.full_name,
      team.team_name,
    );
  }

  //Thông báo về email người dùng bị xóa khỏi nhóm
  async messageDeleteUser(userID: string, teamID: string) {
    const user = await this.userService.getUserById(userID);
    const team = await this.teamService.getTeamById(teamID);
    await this.mailService.sendUserDeletedNotification(
      user.email,
      user.full_name,
      team.team_name,
    );
  }

  //Thông báo Task mới

  //Thông báo về email người dùng được giao việc
  async messageSendTaskToAssigned(userID: string, taskID: string) {
    const task = await this.taskService.getTaskByID(taskID);
    const user = await this.userService.getUserById(userID);
    await this.mailService.sendTaskAssignedNotification(
      user.email,
      user.full_name,
      task.task_name,
    );
  }

  //Thông báo người dùng sắp đến thời gian ban giao công việc
  async messageSendTaskDeadline(userID: string, taskID: string) {
    const task = await this.taskService.getTaskByID(taskID);
    const user = await this.userService.getUserById(userID);
    await this.mailService.sendTaskDeadlineReminder(
      user.email,
      user.full_name,
      task.task_name,
      task.date_end,
    );
  }

  //Thông báo đến giờ bàn giao công việc
  async messageSendHandOver(userID: string, taskID: string) {
    const task = await this.taskService.getTaskByID(taskID);
    const user = await this.userService.getUserById(userID);
    await this.mailService.sendTaskHandOverReminder(
      user.email,
      user.full_name,
      task.task_name,
      task.date_end,
    );
  }

  //Thông báo đến leader người dùng này đa hoàn thành công việc
  async sendTaskCompletionNotificationToLeader(
    leaderID: string,
    taskID: string,
    userID: string,
  ) {
    const task = await this.taskService.getTaskByID(taskID);
    const leader = await this.userService.getUserById(leaderID);
    const user = await this.userService.getUserById(userID);
    await this.mailService.sendTaskCompletionNotificationToLeader(
      leader.email,
      user.full_name,
      task.task_name,
    );
  }

  async messagePasswordChangeNotification(userId: string) {
    const user = await this.userService.getUserById(userId);
    await this.mailService.sendPasswordChangeNotification(user.email);
  }

  async messageWelcomeNotification(userId: string) {
    const user = await this.userService.getUserById(userId);
    await this.mailService.sendWelcomeNotification(user.email);
  }

  async messageUpdateNotification(userId: string) {
    const user = await this.userService.getUserById(userId);
    await this.mailService.sendProfileUpdateNotification(user.email);
  }
}
