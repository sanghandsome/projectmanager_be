import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

describe('TeamService', () => {
  let service: TeamService;
  let prisma: typeof mockPrismaService;

  // Mock PrismaService
  const mockPrismaService = {
    team: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Xóa tất cả mock sau mỗi test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTeam', () => {
    it('should return all teams with leader and member count', async () => {
      const mockTeams = [
        {
          team_name: 'Team A',
          users: [
            { id: 'user1', full_name: 'Leader', roleId: 3 },
            { id: 'user2', full_name: 'Member', roleId: 1 },
          ],
        },
      ];

      const expectedResult = [
        {
          team_name: 'Team A',
          memberCount: 2,
          leader_name: 'Leader',
        },
      ];

      (prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams);

      const result = await service.getAllTeam();

      expect(prisma.team.findMany).toHaveBeenCalledWith({
        where: { deleted_at: null },
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
              roleId: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUsersInTeam', () => {
    it('should return users in team', async () => {
      const teamId = 'team123';
      const mockTeam = {
        users: [
          { full_name: 'User1', we_id: 'we1' },
          { full_name: 'User2', we_id: 'we2' },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      const result = await service.getUsersInTeam(teamId);

      expect(prisma.team.findUnique).toHaveBeenCalledWith({
        where: { id: teamId },
        include: {
          users: {
            select: { full_name: true, we_id: true },
          },
        },
      });
      expect(result).toEqual(mockTeam.users);
    });

    it('should throw NotFoundException if team not found', async () => {
      const teamId = 'nonexistent';
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getUsersInTeam(teamId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // describe('getSoftDeleteTeam', () => {
  //   it('should return all soft-deleted teams', async () => {
  //     const
  //     const mockSoftDeletedTeams = [
  //       {
  //         team_name: 'Deleted Team',
  //         users: [{ id: 'user1', full_name: 'User' }],
  //       },
  //     ];

  //     (prisma.team.findMany as jest.Mock).mockResolvedValue(mockSoftDeletedTeams);

  //     const result = await service.getSoftDeleteTeam();

  //     expect(prisma.team.findMany).toHaveBeenCalledWith({
  //       where: { deleted_at: { not: null } },
  //       include: {
  //         users: {
  //           select: { id: true, full_name: true },
  //         },
  //       },
  //     });
  //     expect(result).toEqual(mockSoftDeletedTeams);
  //   });
  // });

  describe('createTeam', () => {
    it('should create a new team', async () => {
      const createTeamDto: CreateTeamDto = { team_name: 'New Team' };
      const createdTeam = { id: 'team123', ...createTeamDto };

      (prisma.team.create as jest.Mock).mockResolvedValue(createdTeam);

      const result = await service.createTeam(createTeamDto);

      expect(prisma.team.create).toHaveBeenCalledWith({ data: createTeamDto });
      expect(result).toEqual(createdTeam);
    });
  });

  describe('addUserToTeam', () => {
    it('should add user to team', async () => {
      const teamId = 'team123';
      const userId = 'user456';
      const mockTeam = { id: teamId };
      const mockUser = { id: userId };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.addUserToTeam(teamId, userId);

      expect(prisma.team.findUnique).toHaveBeenCalledWith({
        where: { id: teamId },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { id: teamId },
        data: { users: { connect: { id: userId } } },
      });
      expect(result).toEqual({
        message: 'Người dùng đươc thêm vào nhóm thành côgn',
      });
    });

    it('should throw NotFoundException if team not found', async () => {
      const teamId = 'nonexistent';
      const userId = 'user456';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.addUserToTeam(teamId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const teamId = 'team123';
      const userId = 'nonexistent';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue({ id: teamId });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.addUserToTeam(teamId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTeam', () => {
    it('should update a team', async () => {
      const id = 'team123';
      const updateTeamDto: UpdateTeamDto = { team_name: 'Updated Team' };

      await service.updateTeam(id, updateTeamDto);

      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { id },
        data: updateTeamDto,
      });
    });
  });

  describe('removeUserToTeam', () => {
    it('should remove user from team', async () => {
      const teamId = 'team123';
      const userId = 'user456';
      const mockTeam = { id: teamId, users: [] };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      const result = await service.removeUserToTeam(teamId, userId);

      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { id: teamId },
        data: { users: { disconnect: { id: userId } } },
      });
      expect(result).toEqual({ message: 'Người dùng đã được xóa khỏi nhóm' });
    });
  });

  describe('softDelete', () => {
    it('should soft delete a team', async () => {
      const id = 'team123';
      const softDeletedTeam = { id, deleted_at: new Date() };

      (prisma.team.update as jest.Mock).mockResolvedValue(softDeletedTeam);

      const result = await service.softDelete(id);

      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { id },
        data: { deleted_at: expect.any(Date) },
      });
      expect(result).toEqual({ message: 'Team đã được xóa thành công' });
    });
  });

  describe('remove', () => {
    it('should permanently delete a team', async () => {
      const id = 'team123';
      const deletedTeam = { id };

      (prisma.team.delete as jest.Mock).mockResolvedValue(deletedTeam);

      const result = await service.remove(id);

      expect(prisma.team.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual({ message: 'Đã xóa team vĩnh viễn' });
    });
  });
});
