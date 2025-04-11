// src/team/dto/create-team.dto.ts

import { IsString, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  team_name: string;
}
