import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { MakeClipService } from './makeClip.service';


@Module({
  imports: [
    CloudinaryModule,
    MulterModule.register({
      storage: memoryStorage(), // keep files in memory buffer
    }),
  ],
  controllers: [],
  providers: [MakeClipService, PrismaService],
})
export class TemplateModule {}
