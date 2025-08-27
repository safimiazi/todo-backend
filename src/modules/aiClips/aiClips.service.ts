import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateClipSegmentDto } from "./dto/create-clip-segments.dto";

@Injectable()
export class AiClipsSegmentService {

  constructor(private prisma: PrismaService) {}

  async createSegment(clipId: string, userId: string, dto: CreateClipSegmentDto) {
    // 1️⃣ Find the clip, make sure it belongs to the user and is not deleted
    const clip = await this.prisma.makeClip.findFirst({
      where: { id: clipId, userId, isDeleted: false },
    });

    if (!clip) throw new BadRequestException('Clip not found');

    // 2️⃣ Create segments using credit values from request body
    const segmentsData = dto.clips.map(segment => ({
      clipId,
      title: segment.title,
      creditUsed: segment.creditUsed || 0, // take from body
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

    // 3️⃣ Sum credits directly from request body for updating clip
    const totalCredits = dto.clips.reduce((sum, seg) => sum + (seg.creditUsed || 0), 0);

    // 4️⃣ Update clip status and total credits used
    await this.prisma.makeClip.update({
      where: { id: clipId },
      data: {
        status: dto.status === 'completed' ? 'COMPLETED' : 'PROCESSING',
        creditUsed: { increment: totalCredits },
      },
    });

    // 5️⃣ Fetch created segments to return
    const segments = await this.prisma.clipSegment.findMany({
      where: { clipId },
    });

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
