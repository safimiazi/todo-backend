import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req,
  UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { successResponse } from 'src/common/response/response.util';
import { TemplateService } from './templates.service';
import { QueryTemplateDto } from './dto/query-template.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)

export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'introVideo', maxCount: 1 },
        { name: 'outroVideo', maxCount: 1 },
      ],
      { limits: { fileSize: 1024 * 1024 * 200 } }, // 200MB
    ),
  )
  @Roles('ADMIN', 'USER') // 👈 explicitly bole dilam
  async create(
    @Req() req,
    @Body() dto: CreateTemplateDto,
    @UploadedFiles()
    files: { introVideo?: Express.Multer.File[]; outroVideo?: Express.Multer.File[] },
  ) {
    const userId = req.user?.id; // ensure AuthGuard sets req.user
    const data = await this.templateService.create(userId, dto, files);
    return successResponse(data, 'Template created');
  }

  @Get()
  async list(@Req() req, @Query() q: QueryTemplateDto) {
    const userId = req.user?.id;
    const data = await this.templateService.list(userId, q);
    return successResponse(data, 'Templates fetched');
  }

  @Get(':id')
  async getOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user?.id;
    const data = await this.templateService.get(userId, id);
    return successResponse(data, 'Template fetched');
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'introVideo', maxCount: 1 },
        { name: 'outroVideo', maxCount: 1 },
      ],
      { limits: { fileSize: 1024 * 1024 * 200 } },
    ),
  )
  async update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateDto,
    @UploadedFiles()
    files: { introVideo?: Express.Multer.File[]; outroVideo?: Express.Multer.File[] },
  ) {
    const userId = req.user?.id;
    const data = await this.templateService.update(userId, id, dto, files);
    return successResponse(data, 'Template updated');
  }

  @Patch(':id/default')
  async setDefault(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user?.id;
    const data = await this.templateService.setDefault(userId, id);
    return successResponse(data, 'Default template set');
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user?.id;
    const data = await this.templateService.remove(userId, id);
    return successResponse(data, 'Template deleted');
  }
}
