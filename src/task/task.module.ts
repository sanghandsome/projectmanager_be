import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [forwardRef(() => NotificationModule)],
  providers: [TaskService, PrismaService],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
