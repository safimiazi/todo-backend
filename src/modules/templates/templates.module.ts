import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { TemplateController } from './templates.controller';
import { TemplateService } from './templates.service';

@Module({
  imports: [
    CloudinaryModule,
    MulterModule.register({
      storage: memoryStorage(), // keep files in memory buffer
    }),
  ],
  controllers: [TemplateController],
  providers: [TemplateService, PrismaService],
})
export class TemplateModule {}
