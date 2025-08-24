import {  ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

  // Create
  async create(
    userId: string,
    dto: CreateTemplateDto,
    files?: { introVideo?: Express.Multer.File[]; outroVideo?: Express.Multer.File[] },
  ) {
    // Upload first (so if upload fails, nothing is written)
    let introUrl = '';
    let outroUrl = '';

    if (files?.introVideo?.[0]) {
      const up = await this.cloudinary.uploadBuffer(files.introVideo[0].buffer, 'templates/intro', 'video');
      introUrl = up.secure_url;
    }
    if (files?.outroVideo?.[0]) {
      const up = await this.cloudinary.uploadBuffer(files.outroVideo[0].buffer, 'templates/outro', 'video');
      outroUrl = up.secure_url;
    }

    // If isDefault true, unset others for this user inside a transaction
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
          overlayLog: dto.overlayLog,
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

  // List (own templates)
  async list(userId: string, q: QueryTemplateDto) {
    const { page = 1, limit = 10, search } = q;
    const where = {
      userId,
      ...(search ? { templateName: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.template.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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

  // Get one (ownership)
  async get(userId: string, id: number) {
    const tpl = await this.prisma.template.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    if (tpl.userId !== userId) throw new ForbiddenException('Forbidden');
    return tpl;
  }

  // Update
  async update(
    userId: string,
    id: number,
    dto: UpdateTemplateDto,
    files?: { introVideo?: Express.Multer.File[]; outroVideo?: Express.Multer.File[] },
  ) {
    const tpl = await this.prisma.template.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    if (tpl.userId !== userId) throw new ForbiddenException('Forbidden');

    let introUrl = tpl.introVideo;
    let outroUrl = tpl.outroVideo;

    if (files?.introVideo?.[0]) {
      const up = await this.cloudinary.uploadBuffer(files.introVideo[0].buffer, 'templates/intro', 'video');
      introUrl = up.secure_url;
    }
    if (files?.outroVideo?.[0]) {
      const up = await this.cloudinary.uploadBuffer(files.outroVideo[0].buffer, 'templates/outro', 'video');
      outroUrl = up.secure_url;
    }

    // If isDefault toggled true, unset others
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
          overlayLog: dto.overlayLog ?? tpl.overlayLog,
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

  // Set default explicitly
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

  // Delete
  async remove(userId: string, id: number) {
    const tpl = await this.prisma.template.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    if (tpl.userId !== userId) throw new ForbiddenException('Forbidden');

    await this.prisma.template.delete({ where: { id } });
    return { deleted: true };
  }
}
