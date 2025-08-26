import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TemplateModule } from './modules/templates/templates.module';
import { ClipSegmentsModule } from './modules/aiClips/aiClips.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,          
      envFilePath: '.env',     
    }),
    AuthModule,
    TemplateModule,
    ClipSegmentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
