import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryMakeClipDto {
  @IsOptional() 
  @IsString() 
  search?: string; // matches MakeClipName

  @IsOptional() 
  @Type(() => Number) 
  @IsInt() @Min(1) 
  page?: number = 1;

  @IsOptional() 
  @Type(() => Number) 
  @IsInt()
  @Min(1) 
  limit?: number = 10;

  @IsOptional()
  @Type(() => String)
  @IsString()
  orderBy?: 'asc' | 'desc' = 'desc'; // default to 'desc'


  @IsOptional()
  @Type(() => String)
  @IsString()
  isDeleted?: 'true' | 'false' = 'false'; // default to 'false'
  
}
