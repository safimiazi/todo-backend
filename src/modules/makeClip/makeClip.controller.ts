import { BadRequestException, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { MakeClipService } from "./makeClip.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Roles } from "../auth/decorators/roles.decorator";

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
}