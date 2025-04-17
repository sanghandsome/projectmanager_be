import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Prisma } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';
import { TeamService } from 'src/team/team.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}
  async getTaskByID(idTask: string) {
    const task = await this.prisma.task.findUnique({ where: { id: idTask } });
    if (!task) {
      throw new NotFoundException('Không tìm thấy task');
    }
    return task;
  }
  async getTaskByUser(idUser: string) {
    const taskByUser = await this.prisma.user.findUnique({
      where: { id: idUser },
      select: {
        full_name: true, // lấy tên user
        tasks: {
          select: {
            task_name: true,
            description: true,
            date_start: true,
            date_end: true,
            cfg_statement: {
              select: {
                status: true,
              },
            },
            assignee: {
              select: {
                full_name: true,
              },
            },
            reporter: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });

    if (!taskByUser) {
      throw new Error('User not found');
    }

    return taskByUser;
  }
  async getTaskByTeam(idTeam: string) {
    const taskByTeam = this.prisma.team.findUnique({
      where: { id: idTeam },
      select: {
        team_name: true,
        tasks: {
          select: {
            task_name: true,
            description: true,
            date_start: true,
            date_end: true,
            cfg_statement: {
              select: {
                status: true,
              },
            },
            assignee: {
              select: {
                full_name: true,
              },
            },
            reporter: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });
    return taskByTeam;
  }

  async createTaskByUser(idUser: string, data: CreateTaskDto) {
    const dataFull: Prisma.TaskCreateInput = {
      ...data,
      reporter: {
        connect: { id: idUser },
      },
    };
    this.prisma.task.create({ data: dataFull });
    const message = 'Tạo Task Thành Công';
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: idUser,
    });
  }

  async createTaskByTeam(
    idLeader: string,
    data: CreateTaskDto,
    idTeam: string,
  ) {
    let message;
    const dataFull: Prisma.TaskCreateInput = {
      ...data,
      reporter: {
        connect: { id: idLeader },
      },
      teams: {
        connect: { id: idTeam },
      },
    };
    const leader = await this.prisma.user.findUnique({
      where: { id: idLeader },
    });
    if (!leader) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kiểm tra Leader có role_id = 2 (Leader)
    if (leader.role_id !== 2) {
      message = 'Tạo Task thất bại: Người dùng không phải Leader';
      await this.notificationService.createNotification({
        message,
        team_id: null,
        user_id: idLeader,
      });
      throw new ForbiddenException(message);
    }
    const team = await this.prisma.team.findUnique({
      where: { id: idTeam },
      include: {
        users: {
          where: { id: idLeader },
          select: { id: true },
        },
      },
    });
    if (!team) {
      throw new NotFoundException('Không tìm thấy Team');
    }
    if (team.users.length === 0) {
      message = 'Tạo Task thất bại: Leader không thuộc Team';
      await this.notificationService.createNotification({
        message,
        team_id: null,
        user_id: idLeader,
      });
      throw new ForbiddenException(message);
    }
    this.prisma.task.create({ data: dataFull });
    message = 'Tạo Task Thành Công';
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: idLeader,
    });
  }

  async updateTask(idUser: string, idTask: string, data: UpdateTaskDto) {
    let message;
    const task = await this.prisma.task.findUnique({ where: { id: idTask } });
    if (!task || task.reporter_id !== idUser) {
      throw new ForbiddenException('Không có quyền chỉnh sửa task');
    }
    this.prisma.task.update({ where: { id: idTask }, data });
    message = 'Cập Nhật Task Thành Công';
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: idUser,
    });
    if (data.assignee_id) {
      message = 'Bạn được giao 1 task mới';
      this.notificationService.createNotification({
        message: message,
        team_id: null,
        user_id: data.assignee_id,
      });
      this.notificationService.messageSendTaskToAssigned(
        data.assignee_id,
        idTask,
      );
    }
  }

  async updateStatement(idUser: string, idState: string, idTask) {
    let message;
    const task = await this.prisma.task.findUnique({ where: { id: idTask } });
    if (!task || task.reporter_id !== idUser || task.assignee_id != idUser) {
      throw new ForbiddenException('Không có quyền chỉnh sửa task');
    }
    this.prisma.task.update({
      where: { id: idTask },
      data: { statement: idState },
    });
    message = 'Cập nhật trạng thái công việc thành công';
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: idUser,
    });
  }

  async softDelete(idUser: string, idTask: string) {
    let message;
    const task = await this.prisma.task.findUnique({ where: { id: idTask } });
    if (!task || task.reporter_id !== idUser) {
      throw new ForbiddenException('Không có quyền chỉnh sửa task');
    }
    this.prisma.task.update({
      where: { id: idTask },
      data: { delete_at: new Date() },
    });
    message = 'Bạn đa xóa Task Thành Công';
    this.notificationService.createNotification({
      message: message,
      team_id: null,
      user_id: idUser,
    });
  }

  async remove(idTask) {}
}
