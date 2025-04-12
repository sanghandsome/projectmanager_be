import { Module } from '@nestjs/common';
import { CfgStatementController } from './cfg-statement.controller';
import { CfgStatementService } from './cfg-statement.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CfgStatementController],
  providers: [CfgStatementService, PrismaService],
})
export class CfgStatementModule {}
