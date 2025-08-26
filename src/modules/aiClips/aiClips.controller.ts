import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AiClipsSegmentService } from './aiClips.service';
import { CreateClipSegmentDto } from './dto/create-clip-segments.dto';

@Controller('clip-segments')
export class ClipSegmentsController {
  constructor(private readonly clipSegmentsService: AiClipsSegmentService) {}

  @Post(':clipId')
  async createSegments(
    @Param('clipId') clipId: string,
    @Body('userId') userId: string, // Add userId to body
    @Body() dto: CreateClipSegmentDto,
  ) {
    return this.clipSegmentsService.createSegment(clipId, userId, dto);
  }

  @Get(':clipId')
  async getSegments(@Param('clipId') clipId: string) {
    return this.clipSegmentsService.getSegments(clipId);
  }
}