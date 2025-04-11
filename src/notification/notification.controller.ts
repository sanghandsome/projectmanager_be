import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationServer: NotificationService) {}

  @Get()
  getAllNotifications() {
    return this.notificationServer.getNotifications();
  }

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() body: CreateNotificationDto) {
    return this.notificationServer.createNotification(body);
  }

  @Get('/delete')
  getNotificationSoftDelete() {
    return this.notificationServer.getNotificationSoftDelete();
  }

  @Get(':id')
  getNotificationById(@Param('id') id: string) {
    return this.notificationServer.getNotificationById(id);
  }

  @Patch('update/:id')
  @UsePipes(new ValidationPipe())
  updateNotification(
    @Param('id') id: string,
    @Body() body: UpdateNotificationDto,
  ) {
    return this.notificationServer.updateNotification(id, body);
  }

  @Patch('delete/:id')
  softDelete(@Param('id') id: string) {
    return this.notificationServer.softDeleteNotification(id);
  }

  @Delete(':id')
  deleteNotification(@Param('id') id: string) {
    return this.notificationServer.deleteNotification(id);
  }
}
