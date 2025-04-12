import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsDate()
  @Type(() => Date)
  date_start: Date;

  @IsDate()
  @Type(() => Date)
  date_end: Date;

  @IsString()
  @IsNotEmpty()
  task_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  statement?: string;

  @IsOptional()
  @IsString()
  assignee_id?: string;
}
