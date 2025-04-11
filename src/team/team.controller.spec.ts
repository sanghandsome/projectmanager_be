import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';

describe('TeamController', () => {
  let controller: TeamController;
  let service: TeamService;

  // Mock TeamService
  const mockTeamService = {
    getAllTeam: jest.fn(),
    getUsersInTeam: jest.fn(),
    createTeam: jest.fn(),
    softDelete: jest.fn(),
    addUserToTeam: jest.fn(),
    removeUserToTeam: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        {
          provide: TeamService,
          useValue: mockTeamService,
        },
      ],
    }).compile();

    controller = module.get<TeamController>(TeamController);
    service = module.get(TeamService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Xóa tất cả mock sau mỗi test
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all teams', async () => {
      const mockTeams = [
        { team_name: 'Team A', memberCount: 2, leader_name: 'Leader' },
      ];
      mockTeamService.getAllTeam.mockResolvedValue(mockTeams);

      const result = await controller.findAll();

      expect(service.getAllTeam).toHaveBeenCalled();
      expect(result).toEqual(mockTeams);
    });
  });

  describe('getUserByTeam', () => {
    it('should return users in team', async () => {
      const teamId = 'team123';
      const mockUsers = [{ full_name: 'User1', we_id: 'we1' }];
      mockTeamService.getUsersInTeam.mockResolvedValue(mockUsers);

      const result = await controller.getUserByTeam(teamId);

      expect(service.getUsersInTeam).toHaveBeenCalledWith(teamId);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('create', () => {
    it('should create a new team', async () => {
      const createTeamDto: CreateTeamDto = { team_name: 'New Team' };
      const createdTeam = { id: 'team123', ...createTeamDto };
      mockTeamService.createTeam.mockResolvedValue(createdTeam);

      const result = await controller.create(createTeamDto);

      expect(service.createTeam).toHaveBeenCalledWith(createTeamDto);
      expect(result).toEqual(createdTeam);
    });
  });

  describe('remove', () => {
    it('should soft delete a team', async () => {
      const teamId = 'team123';
      mockTeamService.softDelete.mockResolvedValue({
        message: 'Team đã được xóa thành công',
      });

      await controller.remove(teamId);

      expect(service.softDelete).toHaveBeenCalledWith(teamId);
    });
  });

  describe('addUser', () => {
    it('should add user to team', async () => {
      const teamId = 'team123';
      const userId = 'user456';
      const mockResult = {
        message: 'Người dùng đươc thêm vào nhóm thành côgn',
      };
      mockTeamService.addUserToTeam.mockResolvedValue(mockResult);

      const result = await controller.addUser(teamId, { user_id: userId });

      expect(service.addUserToTeam).toHaveBeenCalledWith(teamId, userId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeUser', () => {
    it('should remove user from team', async () => {
      const teamId = 'team123';
      const userId = 'user456';
      const mockResult = { message: 'Người dùng đã được xóa khỏi nhóm' };
      mockTeamService.removeUserToTeam.mockResolvedValue(mockResult);

      const result = await controller.removeUser(teamId, { user_id: userId });

      expect(service.removeUserToTeam).toHaveBeenCalledWith(teamId, userId);
      expect(result).toEqual(mockResult);
    });
  });
});
