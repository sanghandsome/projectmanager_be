import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCfgStatementDto } from './dto/create-cfg-statement.dto';
import { UpdateCfgStatementDto } from './dto/update-cfg-statement.dto';

@Injectable()
export class CfgStatementService {
  constructor(private readonly prisma: PrismaService) {}
  async getStatementById(id: string) {
    return this.prisma.cfgStatement.findUnique({
      where: { id: id },
      select: { status: true, description: true },
    });
  }

  async createStatement(data: CreateCfgStatementDto) {
    this.prisma.cfgStatement.create({ data });
    const message = 'Thanh cong';
    return message;
  }

  async updateStatement(data: UpdateCfgStatementDto) {
    this.prisma.cfgStatement.update({ where: { id: data.id }, data });
    const message = 'Thanh cong';
    return message;
  }

  async softStatement(id: string) {}

  async remove(id: string) {
    this.prisma.cfgStatement.delete({ where: { id: id } });
    const message = 'Thanh cong';
    return message;
  }
}
