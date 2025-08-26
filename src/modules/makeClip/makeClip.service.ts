import { Injectable } from "@nestjs/common";
import { CloudinaryService } from "src/common/cloudinary/cloudinary.service";
import { PrismaService } from "src/prisma/prisma.service";

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


}