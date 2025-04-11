import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDate,
  MinLength,
} from 'class-validator';
import { Sex } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  weID?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEnum(Sex)
  @IsOptional()
  sex?: Sex;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  discordId?: string;

  @IsDate()
  @IsOptional()
  dateOfBirth?: Date;
}
