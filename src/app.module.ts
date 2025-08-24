import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TemplateModule } from './modules/templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,          
      envFilePath: '.env',     
    }),
    AuthModule,
    TemplateModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
