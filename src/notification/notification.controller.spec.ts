import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

// Mock DTOs (giả lập dữ liệu đầu vào)
const mockCreateNotificationDto: CreateNotificationDto = {
  discord_channel_id: 'channel123',
  team_id: 'team456',
  user_id: 'user789',
};

const mockUpdateNotificationDto: UpdateNotificationDto = {
  discord_channel_id: 'newChannel',
  team_id: 'newTeam',
  user_id: 'newUser',
};

// Mock NotificationService
const mockNotificationService = {
  getNotifications: jest.fn(),
  createNotification: jest.fn(),
  getNotificationSoftDelete: jest.fn(),
  getNotificationById: jest.fn(),
  updateNotification: jest.fn(),
  softDeleteNotification: jest.fn(),
  deleteNotification: jest.fn(),
};

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Xóa tất cả mock sau mỗi test
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllNotifications', () => {
    it('should return all notifications', async () => {
      const mockNotifications = [
        { id: 'notif123', discord_channel_id: 'channel123' },
      ];
      mockNotificationService.getNotifications.mockResolvedValue(
        mockNotifications,
      );

      const result = await controller.getAllNotifications();

      expect(service.getNotifications).toHaveBeenCalled();
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const createdNotification = {
        id: 'notif123',
        ...mockCreateNotificationDto,
      };
      mockNotificationService.createNotification.mockResolvedValue(
        createdNotification,
      );

      const result = await controller.create(mockCreateNotificationDto);

      expect(service.createNotification).toHaveBeenCalledWith(
        mockCreateNotificationDto,
      );
      expect(result).toEqual(createdNotification);
    });
  });

  describe('getNotificationSoftDelete', () => {
    it('should return all soft-deleted notifications', async () => {
      const mockSoftDeletedNotifications = [
        { id: 'notif456', discord_channel_id: 'channel456' },
      ];
      mockNotificationService.getNotificationSoftDelete.mockResolvedValue(
        mockSoftDeletedNotifications,
      );

      const result = await controller.getNotificationSoftDelete();

      expect(service.getNotificationSoftDelete).toHaveBeenCalled();
      expect(result).toEqual(mockSoftDeletedNotifications);
    });
  });

  describe('getNotificationById', () => {
    it('should return notification by id', async () => {
      const mockNotification = [
        { id: 'notif123', discord_channel_id: 'channel123' },
      ];
      mockNotificationService.getNotificationById.mockResolvedValue(
        mockNotification,
      );

      const result = await controller.getNotificationById('notif123');

      expect(service.getNotificationById).toHaveBeenCalledWith('notif123');
      expect(result).toEqual(mockNotification);
    });
  });

  describe('updateNotification', () => {
    it('should update a notification', async () => {
      const id = 'notif123';
      const updatedNotification = { id, ...mockUpdateNotificationDto };
      mockNotificationService.updateNotification.mockResolvedValue(
        updatedNotification,
      );

      const result = await controller.updateNotification(
        id,
        mockUpdateNotificationDto,
      );

      expect(service.updateNotification).toHaveBeenCalledWith(
        id,
        mockUpdateNotificationDto,
      );
      expect(result).toEqual(updatedNotification);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a notification', async () => {
      const id = 'notif123';
      const softDeletedNotification = { id, deleted_at: new Date() };
      mockNotificationService.softDeleteNotification.mockResolvedValue(
        softDeletedNotification,
      );

      const result = await controller.softDelete(id);

      expect(service.softDeleteNotification).toHaveBeenCalledWith(id);
      expect(result).toEqual(softDeletedNotification);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const id = 'notif123';
      const deletedNotification = { id };
      mockNotificationService.deleteNotification.mockResolvedValue(
        deletedNotification,
      );

      const result = await controller.deleteNotification(id);

      expect(service.deleteNotification).toHaveBeenCalledWith(id);
      expect(result).toEqual(deletedNotification);
    });
  });
});
