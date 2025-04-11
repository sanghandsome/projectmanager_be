import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Patch,
  HttpException,
  UsePipes,
  ValidationPipe,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { changePassword } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() body: { email: string; password: string }) {
    return this.authService.signIn(body.email, body.password);
  }

  @Patch('changePassword/:id')
  @UsePipes(new ValidationPipe())
  changePassword(@Param('id') id: string, @Body() body: changePassword) {
    return this.authService.changePassword(id, body);
  }

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    if (!email) {
      throw new HttpException('Email là bắt buộc', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.authService.sendOtp(email);
      return result; // { message: 'OTP đã được gửi vào email của bạn!' }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Lỗi khi gửi OTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!email || !otp || !newPassword) {
      throw new HttpException(
        'Email, OTP và mật khẩu mới là bắt buộc',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.authService.verifyOtp(email, otp, newPassword);
      return result; // { message: 'Mật khẩu đã được đặt lại thành công!' }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Lỗi khi xác thực OTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
