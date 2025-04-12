import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCfgStatementDto {
  @IsUUID()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
