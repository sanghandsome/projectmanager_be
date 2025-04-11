import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Sex } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  we_id: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsEnum(Sex)
  @IsNotEmpty()
  sex: Sex;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  discord_id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date_of_birth?: Date;
}
