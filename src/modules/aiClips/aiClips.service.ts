import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateClipSegmentDto } from "./dto/create-clip-segments.dto";
import { title } from "process";




@Injectable()
export class AiClipsSegmentService {

    constructor(private prisma: PrismaService) {}

    async createSegment(clipId: string, userId: string, dto: CreateClipSegmentDto ) {
        const clip = await this.prisma.makeClip.findFirst({where:{ id: clipId, userId}});
            console.log("is there any user Id available?",userId);
        if(!clip ) throw new BadRequestException('Clip not found');
       
        const segments = dto.clips.map(segment => ( {
            clipId,
            title: segment.title,
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
        }))

        const createdSegments = await this.prisma.clipSegment.createMany({
            data: segments
        })

        await this.prisma.makeClip.update({
            where: {id: clipId},
            data: { status: dto.status === 'done' ? 'COMPLETED' : 'PROCESSING'},

        });

        return {status: 'success', segmentsCreated: createdSegments.count};
    }

    async getSegments(clipId: string, userId: any) {
        
        return this.prisma.clipSegment.findMany({
            where: {clipId},
        })
    }
}