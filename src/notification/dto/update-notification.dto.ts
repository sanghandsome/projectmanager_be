import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  team_id: string;

  @IsString()
  @IsOptional()
  user_id: string;
}
