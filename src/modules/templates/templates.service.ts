
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { QueryTemplateDto } from './dto/query-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) { }

  // Create a template
  async create(
    userId: string,
    dto: CreateTemplateDto,
    files?: {
      introVideo?: Express.Multer.File[];
      outroVideo?: Express.Multer.File[];
      overlayLogo?: Express.Multer.File[];
    },
  ) {
    let introUrl = '';
    let outroUrl = '';
    let overlayUrl = '';

    // Upload intro video
    if (files?.introVideo?.[0]) {
      const up = await this.cloudinary.uploadBuffer(
        files.introVideo[0].buffer,
        'templates/intro',
        'video',
      );
      introUrl = up.secure_url;
    }

    // Upload outro video
    if (files?.outroVideo?.[0]) {
      const up = await this.cloudinary.uploadBuffer(
        files.outroVideo[0].buffer,
        'templates/outro',
        'video',
      );
      outroUrl = up.secure_url;
    }

    // Upload overlay logo as image
    if (files?.overlayLogo?.[0]) {
      const up = await this.cloudinary.uploadBuffer(
        files.overlayLogo[0].buffer,
        'templates/logo',
        'image',
      );
      overlayUrl = up.secure_url;
    }

    // Transaction to handle isDefault logic
    const created = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.template.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.template.create({
        data: {
          userId,
          templateName: dto.templateName,
          platform: dto.platform,
          aspectRatio: dto.aspectRatio,
          caption: dto.caption,
          overlayLogo: overlayUrl || '',
          colorTheme: dto.colorTheme,
          introVideo: introUrl || '',
          outroVideo: outroUrl || '',
          isActive: dto.isActive ?? true,
          isDefault: dto.isDefault ?? false,
        },
      });
    });

    return created;
  }

  // List templates for a user
  async list(userId: string, q: QueryTemplateDto) {
    const { page = 1, limit = 10, search, orderBy = 'desc', isDeleted = false } = q;

    const where: any = {
      userId,
      isDeleted, // <-- filter applied from query (true/false)
      ...(search
        ? { templateName: { contains: search, mode: 'insensitive' as const } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.template.findMany({
        where,
        orderBy: { createdAt: orderBy === 'asc' ? 'asc' : 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // Get a single template (ownership check)
  async get(userId: string, id: number) {
    const tpl = await this.prisma.template.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    if (tpl.userId !== userId) throw new ForbiddenException('Forbidden');
    // Check if already deleted
    if (tpl.isDeleted) {
      throw new BadRequestException('Template is already deleted');
    }
    return tpl;
  }

  // Update a template
  async update(
    userId: string,
    id: number,
    dto: UpdateTemplateDto,
    files?: { introVideo?: Express.Multer.File[]; outroVideo?: Express.Multer.File[]; overlayLogo?: Express.Multer.File[] },
  ) {
    const tpl = await this.prisma.template.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    if (tpl.userId !== userId) throw new ForbiddenException('Forbidden');

    // Check if already deleted
    if (tpl.isDeleted) {
      throw new BadRequestException('Template is already deleted');
    }

    let introUrl = tpl.introVideo;
    let outroUrl = tpl.outroVideo;
    let overlayUrl = tpl.overlayLogo;

    if (files?.introVideo?.[0]) {
      const up = await this.cloudinary.uploadBuffer(files.introVideo[0].buffer, 'templates/intro', 'video');
      introUrl = up.secure_url;
    }
    if (files?.outroVideo?.[0]) {
      const up = await this.cloudinary.uploadBuffer(files.outroVideo[0].buffer, 'templates/outro', 'video');
      outroUrl = up.secure_url;
    }
    if (files?.overlayLogo?.[0]) {
      const up = await this.cloudinary.uploadBuffer(files.overlayLogo[0].buffer, 'templates/logo', 'image');
      overlayUrl = up.secure_url;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault === true) {
        await tx.template.updateMany({
          where: { userId, NOT: { id } },
          data: { isDefault: false },
        });
      }

      return tx.template.update({
        where: { id },
        data: {
          templateName: dto.templateName ?? tpl.templateName,
          platform: dto.platform ?? tpl.platform,
          aspectRatio: dto.aspectRatio ?? tpl.aspectRatio,
          caption: dto.caption ?? tpl.caption,
          overlayLogo: overlayUrl,
          colorTheme: dto.colorTheme ?? tpl.colorTheme,
          introVideo: introUrl,
          outroVideo: outroUrl,
          isActive: dto.isActive ?? tpl.isActive,
          isDefault: dto.isDefault ?? tpl.isDefault,
        },
      });
    });

    return updated;
  }

  // Set default template
  async setDefault(userId: string, id: number) {
    const tpl = await this.prisma.template.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    if (tpl.userId !== userId) throw new ForbiddenException('Forbidden');

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.template.updateMany({ where: { userId }, data: { isDefault: false } });
      return tx.template.update({ where: { id }, data: { isDefault: true } });
    });

    return updated;
  }

  // Delete a template (soft delete)
  async remove(userId: string, id: number) {
    const tpl = await this.prisma.template.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    if (tpl.userId !== userId) throw new ForbiddenException('Forbidden');

    // Check if already deleted
    if (tpl.isDeleted) {
      throw new BadRequestException('Template is already deleted');
    }

    await this.prisma.template.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Template deleted successfully' };
  }

}
