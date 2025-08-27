import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateClipSegmentDto } from "./dto/create-clip-segments.dto";

@Injectable()
export class AiClipsSegmentService {
  constructor(private prisma: PrismaService) {}

  async createSegment(clipId: string, userId: string, dto: CreateClipSegmentDto) {
    const clip = await this.prisma.makeClip.findFirst({
      where: { id: clipId, userId, isDeleted: false },
    });

    if (!clip) throw new BadRequestException('Clip not found');

    const segmentsData = dto.clips.map(segment => ({
      clipId,
      title: segment.title,
      // use segment.creditUsed if exists, otherwise fallback to parent dto.creditUsed, default 0
      creditUsed: Number(segment.creditUsed ?? dto.creditUsed ?? 0),
      viralScore: segment.viralScore,
      relatedTopic: segment.relatedTopic,
      transcript: segment.transcript,
      videoUrl: segment.videoUrl,
      clipEditorUrl: segment.clipEditorUrl,
      videoMsDuration: segment.videoMsDuration,
      videoId: segment.videoId,
      viralReason: segment.viralReason,
      description: segment.description || null,
      confidence: null,
    }));

    const createdSegments = await this.prisma.clipSegment.createMany({
      data: segmentsData,
    });

    const totalCredits = segmentsData.reduce((sum, seg) => sum + seg.creditUsed, 0);

    await this.prisma.makeClip.update({
      where: { id: clipId },
      data: {
        status: dto.status === 'completed' ? 'COMPLETED' : 'PROCESSING',
        creditUsed: { increment: totalCredits },
      },
    });

    const segments = await this.prisma.clipSegment.findMany({ where: { clipId } });

    return {
      status: 'success',
      creditsUsed: totalCredits,
      segmentsCreated: createdSegments.count,
      segments,
    };
  }

  async getSegments(clipId: string, userId: string) {
    // Return only segments of clips that belong to this user
    const clip = await this.prisma.makeClip.findFirst({
      where: { id: clipId, userId, isDeleted: false },
    });

    if (!clip) throw new BadRequestException('Clip not found');

    return this.prisma.clipSegment.findMany({
      where: { clipId },
    });
  }
}
