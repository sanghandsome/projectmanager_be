import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

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

  @Post('create/:idUser')
  createTask(@Param('idUser') id: string, @Body() data: CreateTaskDto) {
    return this.taskService.createTaskByUser(id, data);
  }

  @Post('create/team/:idLeader/:idTeam')
  createTaskByTeam(
    @Param('idLeader') id: string,
    @Param('idTeam') idTeam: string,
    @Body() data: CreateTaskDto,
  ) {
    return this.taskService.createTaskByTeam(id, data, idTeam);
  }

  @Patch('update/:idUser/:idTask')
  updateTask(
    @Param('idUser') id: string,
    @Param('idTask') idTask: string,
    @Body() data: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(id, idTask, data);
  }

  @Patch('update/statement/:idUser/:idTask')
  updateStatement(
    @Param('idUser') id: string,
    @Param('idTask') idTask: string,
    @Body() data: UpdateTaskDto,
  ) {
    return this.taskService.updateStatement(id, idTask, data);
  }

  @Patch('soft-delete/:idUser/:idTask')
  softDelete(@Param('idUser') id: string, @Param('idTask') idTask: string) {
    return this.taskService.softDelete(id, idTask);
  }
}
