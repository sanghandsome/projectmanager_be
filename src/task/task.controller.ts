import { Controller, Get, Param } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
  @Get('user/:idUser')
  getTaskByUser(@Param('idUser') id: string) {
    return this.taskService.getTaskByUser(id);
  }

  @Get('team/:idTeam')
  getTaskByTeam(@Param('idTeam') id: string) {
    return this.taskService.getTaskByTeam(id);
  }
}
