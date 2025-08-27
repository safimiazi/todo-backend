import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CloudinaryService } from "src/common/cloudinary/cloudinary.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMakeClipDto } from "./dto/create-makeclip.dto";
import { UpdateMakeClipDto } from "./dto/update-makeclip.dto";
import { QueryMakeClipDto } from "./dto/query-makecllip.dto";

@Injectable()

export class MakeClipService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {

  }


  // Create a template
  async uploadVideoFile(

    file?: Express.Multer.File[]

  ) {
    let videoUrl = '';


    // Upload intro video
    if (file?.[0]) {
      const up = await this.cloudinary.uploadBuffer(
        file[0].buffer,
        'makeclip/videoUrl',
        'video',
      );
      videoUrl = up.secure_url;
    }



    return videoUrl;
  }
  async uploadFile(

    file?: Express.Multer.File[]

  ) {
    let fileUrl = '';


    // Upload intro video
    if (file?.[0]) {
      const up = await this.cloudinary.uploadBuffer(
        file[0].buffer,
        'makeclip/fileUrl',
        'image',
      );
      fileUrl = up.secure_url;
    }



    return fileUrl;
  }


async create(dto: CreateMakeClipDto, userId: string) {
  // check if template exists
  const template = await this.prisma.template.findUnique({
    where: { id: dto.templateId },
  });
  if (!template) {
    throw new NotFoundException(`Template with id ${dto.templateId} not found`);
  }

  return this.prisma.makeClip.create({
    data: {
      videoSourceInNumber: dto.videoSourceInNumber,
      videoSourceInName: dto.videoSourceInName,
      videoUrl: dto.videoUrl,
      clipCount: dto.clipCount,
      perClipDuration: dto.perClipDuration,
      creditUsed: dto.creditUsed ?? 0,
      duration: dto.duration ?? 0,
      langCode: dto.langCode,
      prompt: dto.prompt,
      metadata: dto.metadata,
      userId: userId,
      templateId: dto.templateId,
      isDeleted: false,
    },
  });
}




  // List templates for a user
  async list(userId: string, q: QueryMakeClipDto) {
    const { page = 1, limit = 10, search, orderBy = 'desc', isDeleted = false } = q;

    const where: any = {
      userId,
      isDeleted: isDeleted === 'true' ? true : false,
      ...(search
        ? { prompt: { contains: search, mode: 'insensitive' as const } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.makeClip.findMany({
        where,
        include: { user: true, template: true },
        orderBy: { createdAt: orderBy === 'asc' ? 'asc' : 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.makeClip.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const clip = await this.prisma.makeClip.findUnique({
      where: { id },
      include: { user: true, template: true },
    });
    if (!clip) throw new NotFoundException(`MakeClip not found`);
    return clip;
  }

  async update(id: string, dto: UpdateMakeClipDto) {
    await this.findOne(id); // ensures existence
    return this.prisma.makeClip.update({
      where: { id },
      data: dto,
    });
  }

  // Delete a template (soft delete)
  async remove(userId: string, id: string) {
    const clp = await this.prisma.makeClip.findUnique({ where: { id } });
    if (!clp) throw new NotFoundException('Clip not found');
    if (clp.userId !== userId) throw new ForbiddenException('Forbidden');

    // Check if already deleted
    if (clp.isDeleted) {
      throw new BadRequestException('Clip is already deleted');
    }

    await this.prisma.makeClip.update({
      where: { id },
      data: { isDeleted: true },
    });

    return
  }


}