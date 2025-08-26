import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UnauthorizedException,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { MakeClipService } from "./makeClip.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateMakeClipDto } from './dto/create-makeclip.dto';
import { successResponse } from 'src/common/response/response.util';
import { QueryMakeClipDto } from './dto/query-makecllip.dto';
import { UpdateMakeClipDto } from './dto/update-makeclip.dto';

@Controller('makeclip')
@UseGuards(JwtAuthGuard, RolesGuard)

export class MakeClipController {
    constructor(private readonly makeClipService: MakeClipService) { }
    @Post('upload-video')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'videoFile', maxCount: 1 }
            ],
            { limits: { fileSize: 1024 * 1024 * 200 } }
        )
    )
    @Roles('ADMIN', 'USER')
    async uploadVideoFile(
        @UploadedFiles()
        files: { videoFile: Express.Multer.File[] }
    ) {

        // Check if file exists
        if (!files?.videoFile || files.videoFile.length === 0) {
            throw new BadRequestException('No video file uploaded. Please provide a file.');
        }
        const videoUrl = await this.makeClipService.uploadVideoFile(files.videoFile);
        return { videoUrl };
    }


    // ✅ Create new clip
    @Post('create')
    @Roles('ADMIN', 'USER')
    async create(@Req() req, @Body() dto: CreateMakeClipDto) {
        const userId = req.user?.userId;
        console.log("user", userId);
        console.log("dto", dto)
        if (!userId) throw new UnauthorizedException('No user ID found in request');
        const data = await this.makeClipService.create({ ...dto, userId });
        return successResponse(data, 'Clip created');
    }

    // ✅ List all clips for user
    @Get('list')
    @Roles('ADMIN', 'USER')
    async list(@Req() req, @Query() q: QueryMakeClipDto) {
        const userId = req.user?.userId;
        const data = await this.makeClipService.list(userId, q);
        return successResponse(data, 'Clips fetched');
    }

    // ✅ Get single clip by ID
    @Get(':id')
    @Roles('ADMIN', 'USER')
    async getOne(@Param('id') id: string) {
        const data = await this.makeClipService.findOne(id);
        return successResponse(data, 'Clip fetched');
    }

    // ✅ Update clip
    @Patch(':id')
    @Roles('ADMIN', 'USER')
    async update(@Param('id') id: string, @Body() dto: UpdateMakeClipDto) {
        const data = await this.makeClipService.update(id, dto);
        return successResponse(data, 'Clip updated');
    }

    // ✅ Delete clip (soft delete)
    @Delete(':id')
    @Roles('ADMIN', 'USER')
    async remove(@Req() req, @Param('id') id: string) {
        const userId = req.user?.userId;
        const data = await this.makeClipService.remove(userId, id);
        return successResponse(data, 'Clip deleted');
    }
}