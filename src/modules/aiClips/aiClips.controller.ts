import { Controller, UseGuards, Post, Req, Get, Body, Param, BadRequestException } from '@nestjs/common';
import { AiClipsSegmentService } from './aiClips.service';
import { CreateClipSegmentDto } from './dto/create-clip-segments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from "../auth/decorators/roles.decorator";
@Controller('clip-segments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClipSegmentsController {
  constructor(private readonly clipSegmentsService: AiClipsSegmentService) { }

  @Post(':clipId')
  @Roles('ADMIN', 'USER')
  async createSegments(
    @Param('clipId') clipId: string,
    // @GetUser('userId') userId: string, 
    @Req() req,
    @Body() dto: CreateClipSegmentDto,

  ) {
    const userId = req.user?.userId;


    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.clipSegmentsService.createSegment(clipId, userId, dto);
  }





  @Get(':clipId')
  async getSegments(
    @Param('clipId') clipId: string,
    @Req() req,
  ) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.clipSegmentsService.getSegments(clipId, userId);
  }
}

