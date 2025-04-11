// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';

// describe('AuthService', () => {
//   let service: AuthService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [AuthService],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config = {
      JWT_ACCESS_TOKEN_SECRET: 'access_secret',
      JWT_ACCESS_TOKEN_EXPIRE: '1h',
      JWT_REFRESH_TOKEN_SECRET: 'refresh_secret',
      JWT_REFRESH_TOKEN_EXPIRE: '7d',
    };
    return config[key];
  }),
};

const mockMailService = {
  sendOtp: jest.fn(),
};

const mockWebsocketGateway = {
  server: {
    emit: jest.fn(),
  },
};
describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrismaService;
  let jwtService: typeof mockJwtService;
  let configService: typeof mockConfigService;
  let mailService: typeof mockMailService;
  let websocketGateway: typeof mockWebsocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
        { provide: WebsocketGateway, useValue: mockWebsocketGateway },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    mailService = module.get(MailService);
    websocketGateway = module.get(WebsocketGateway);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Xóa tất cả mock sau mỗi test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in successfully and return tokens', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = {
        id: 'user123',
        email,
        password: await bcrypt.hash(password, 10),
        refresh_token: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...user,
        refresh_token: refreshToken,
      });

      const result = await service.signIn(email, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { refresh_token: refreshToken },
      });
      expect(result).toEqual({
        user: expect.objectContaining({ id: user.id, email: user.email }),
        accessToken,
        refreshToken,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateAccessToken', () => {
    it('should generate access token', async () => {
      const id = 'user123';
      const token = 'access_token';
      (jwtService.sign as jest.Mock).mockReturnValue(token);

      const result = await service.generateAccessToken(id);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { id },
        {
          secret: 'access_secret',
          expiresIn: '1h',
        },
      );
      expect(result).toBe(token);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token', async () => {
      const id = 'user123';
      const token = 'refresh_token';
      (jwtService.sign as jest.Mock).mockReturnValue(token);

      const result = await service.generateRefreshToken(id);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { id },
        {
          secret: 'refresh_secret',
          expiresIn: '7d',
        },
      );
      expect(result).toBe(token);
    });
  });

  describe('sendOtp', () => {
    it('should send OTP and return success message', async () => {
      const email = 'test@example.com';
      const user = { id: 'user123', email };
      const otp = '123456';
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...user,
        otp,
        otp_expires_at: expiresAt,
      });
      mailService.sendOtp.mockResolvedValue(undefined);

      const result = await service.sendOtp(email);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { otp, otp_expires_at: expect.any(Date) },
      });
      expect(mailService.sendOtp).toHaveBeenCalledWith(email, otp);
      expect(result).toEqual({ message: 'OTP đã được gửi vào email của bạn!' });
    });

    it('should throw NotFoundException if email not found', async () => {
      const email = 'nonexistent@example.com';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.sendOtp(email)).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and reset password', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const newPassword = 'newpassword123';
      const user = {
        id: 'user123',
        email,
        otp,
        otp_expires_at: new Date(Date.now() + 60000),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.verifyOtp(email, otp, newPassword);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { password: 'hashed_password', otp: null, otp_expires_at: null },
      });
      expect(result).toEqual({
        message: 'Mật khẩu đã được đặt lại thành công!',
      });
    });

    it('should throw UnauthorizedException for invalid OTP', async () => {
      const email = 'test@example.com';
      const otp = 'wrongotp';
      const newPassword = 'newpassword123';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        otp: '123456',
      });

      await expect(service.verifyOtp(email, otp, newPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if OTP expired', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const newPassword = 'newpassword123';
      const user = {
        id: 'user123',
        email,
        otp,
        otp_expires_at: new Date(Date.now() - 60000),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      await expect(service.verifyOtp(email, otp, newPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const id = 'user123';
      const data = {
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      };
      const user = { id, password: await bcrypt.hash(data.oldPassword, 10) };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id,
        user_name: 'username',
        email: 'test@example.com',
        full_name: 'Test User',
      });

      const result = await service.changePassword(id, data);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        data.oldPassword,
        user.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(data.newPassword, 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id },
        data: { password: 'new_hashed_password' },
        select: {
          id: true,
          user_name: true,
          email: true,
          full_name: true,
        },
      });
      expect(websocketGateway.server.emit).toHaveBeenCalledWith(
        'passwordChanged',
        { id },
      );
      expect(result).toEqual({ message: 'Mật khẩu đã được đổi thành công!' });
    });

    it('should throw ConflictException for incorrect old password', async () => {
      const id = 'user123';
      const data = {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };
      const user = { id, password: 'hashed_password' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(id, data)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
