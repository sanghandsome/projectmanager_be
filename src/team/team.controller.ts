import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  findAll() {
    return this.teamService.getAllTeam();
  }

  @Get(':id')
  getUserByTeam(@Param('id') id: string) {
    return this.teamService.getUsersInTeam(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() body: CreateTeamDto) {
    return this.teamService.createTeam(body);
  }

  @Patch('delete/:team_id')
  remove(@Param('team_id') team_id: string) {
    this.teamService.softDelete(team_id);
  }

  @Patch('/addUser/:team_id')
  addUser(
    @Param('team_id') team_id: string,
    @Body() body: { user_id: string },
  ) {
    console.log(team_id);
    return this.teamService.addUserToTeam(team_id, body.user_id);
  }

  @Post('/remove/:team_id')
  removeUser(
    @Param('team_id') team_id: string,
    @Body() body: { user_id: string },
  ) {
    return this.teamService.removeUserToTeam(team_id, body.user_id);
  }
}
