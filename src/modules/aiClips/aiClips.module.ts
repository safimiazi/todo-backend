import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { ClipSegmentsController } from './aiClips.controller';
import { AiClipsSegmentService } from './aiClips.service';
// Import AuthModule for JWT

@Module({
  imports: [AuthModule], // Include AuthModule for JWT strategy
  controllers: [ClipSegmentsController],
  providers: [AiClipsSegmentService, PrismaService],
})
export class ClipSegmentsModule {}