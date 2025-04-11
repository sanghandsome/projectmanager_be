import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { Team } from 'discord.js';

const mockPrismaService = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification and return the result', async () => {
      const notificationData = {
        discord_channel_id: 'channel 123',
        team_id: '018fbc34-8b7a-7ccd-8463-2e7d0d3be201',
        user_id: '018fbc34-8b7a-7ccd-8463-2e7d0d3be101',
      };
      const createdNotification = { id: 'notifi123', ...notificationData };
      (prisma.notification.create as jest.Mock).mockReturnValue(
        createdNotification,
      );
      const result = await service.createNotification(notificationData);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: notificationData,
      });
      expect(result).toEqual(createdNotification);
    });
  });

  describe('getNotifications', () => {
    it('should return all active notification', async () => {
      const notifications = [
        {
          discord_channel_id: 'channel123',
          team: { id: 'team123', team_name: 'qc' },
          user: { id: 'user123', full_name: 'bbb' },
        },
      ];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(
        notifications,
      );

      const result = await service.getNotifications();

      expect(prisma.notification.findMany).toHaveBeenLastCalledWith({
        where: { deleted_at: null },
        select: {
          discord_channel_id: true,
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
      console.log(result);
      expect(result).toEqual(notifications);
    });
  });

  describe('getNotificationSoftDelete', () => {
    it('test softDelete', async () => {
      const notifications = [
        {
          discord_channel_id: 'channel123',
          team: { id: 'team123', team_name: 'qc' },
          user: { id: 'user123', full_name: 'bbb' },
        },
      ];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(
        notifications,
      );
      const result = await service.getNotificationSoftDelete();
      expect(prisma.notification.findMany).toHaveBeenLastCalledWith({
        where: { deleted_at: { not: null } },
        select: {
          discord_channel_id: true,
          team_id: true,
          user_id: true,
        },
        orderBy: [{ created_at: 'desc' }, { updated_at: 'desc' }],
      });

      expect(result).toEqual(notifications);
    });
  });

  describe('getNotificationById', () => {
    it('test lay kenh thong bao theo id', async () => {
      const notification = {
        id: 'noti123',
        discord_channel_id: 'channel123',
      };
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(
        notification,
      );
      const result = await service.getNotificationById(notification.id);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { id: 'noti123' },
      });
      expect(result).toEqual(notification);
    });
  });

  describe('updateNotification', () => {
    it('test update notification', async () => {
      const id = 'noti123';
      const updateData = {
        discord_channel_id: 'channel 123',
        team_id: '018fbc34-8b7a-7ccd-8463-2e7d0d3be201',
        user_id: '018fbc34-8b7a-7ccd-8463-2e7d0d3be101',
      };
      const updateNotification = { id, ...updateData };

      (prisma.notification.update as jest.Mock).mockResolvedValue(
        updateNotification,
      );

      const result = await service.updateNotification(id, updateData);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'noti123' },
        data: updateData,
      });

      expect(result).toEqual(updateNotification);
    });
  });

  describe('softDeleteNotification', () => {
    it('test softDelete', async () => {
      const id = 'noti123';
      const softDeleteNotification = { id, deleted_at: new Date() };
      (prisma.notification.update as jest.Mock).mockResolvedValue(
        softDeleteNotification,
      );

      const result = await service.softDeleteNotification(id);
      expect(prisma.notification.update).toHaveBeenLastCalledWith({
        where: { id: 'noti123' },
        data: { deleted_at: new Date() },
      });
      expect(result).toEqual(softDeleteNotification);
    });
  });

  describe('deleteNotification', () => {
    it('test delete', async () => {
      const id = 'noti123';
      const deletedNotification = { id };
      (prisma.notification.delete as jest.Mock).mockResolvedValue(
        deletedNotification,
      );

      const result = await service.deleteNotification(id);
      expect(prisma.notification.delete).toHaveBeenLastCalledWith({
        where: { id: 'noti123' },
      });
      expect(result).toEqual(deletedNotification);
    });
  });
});
