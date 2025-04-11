import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Sex } from '@prisma/client';
import { changePassword } from '../auth/dto/change-password.dto';

// @UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @Get()
  findAllUsers() {
    return this.usersService.getUsers();
  }

  @Get('/delete')
  findAllUsersDelete() {
    return this.usersService.getUserSoftDelete();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch('update/:id')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(id, body);
  }

  @Patch('delete/:id')
  softDelete(@Param('id') id: string) {
    return this.usersService.softDeleteUser(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
