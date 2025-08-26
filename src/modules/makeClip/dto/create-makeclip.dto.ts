import { IsInt, IsOptional, IsString, IsUrl, IsJSON } from "class-validator";

export class CreateMakeClipDto {
  @IsInt()
  videoSourceInNumber: number;

  @IsString()
  videoSourceInName: string;

  @IsUrl()
  videoUrl: string;

  @IsInt()
  clipCount: number;

  @IsInt()
  perClipDuration: number;

  @IsOptional()
  @IsInt()
  creditUsed?: number;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsString()
  langCode?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  metadata?: object;



  @IsInt()
  templateId: number;
}