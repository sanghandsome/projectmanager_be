import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCfgStatementDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  description?: string;
}
