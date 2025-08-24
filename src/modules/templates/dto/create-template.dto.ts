import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString() templateName: string;
  @IsString() platform: string; // e.g. 'youtube' | 'tiktok' | etc.
  @IsString() aspectRatio: string; // e.g. '9:16', '16:9'
  @IsString() caption: string;
  @IsString() overlayLogo: string; // keep as text (or URL)
  @IsString() colorTheme: string;

  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
