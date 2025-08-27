import { IsString, IsArray, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ClipSegmentDto {
  @IsString()
  viralScore: string;

  @IsArray()
  relatedTopic: string[];

  @IsString()
  transcript: string;

  @IsString()
  videoUrl: string;

  @IsString()
  clipEditorUrl: string;

  @IsInt()
  videoMsDuration: number;

  @IsInt()
  videoId: number;

  @IsString()
  title: string;

  @IsString()
  viralReason: string;

  @IsString() @IsOptional()
  description?: string;

  @IsInt()
  @Type(() => Number)
  creditUsed: number;
}

export class CreateClipSegmentDto {
  @IsString()
  status: string;

  @IsInt()
  clip_number: number;

  @IsArray()
  clips: ClipSegmentDto[];


}
