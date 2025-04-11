import { IsString, IsOptional } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  team_name?: string;
}
