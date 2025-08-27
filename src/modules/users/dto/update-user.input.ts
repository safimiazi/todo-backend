import { IsEmail, IsString, IsOptional, MinLength, IsBoolean, IsDate, IsJSON } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  role?: string; // or you can use an enum validator if you have UserRole enum

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsDate()
  emailVerifiedAt?: Date;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  youtubeChannelId?: string;

  @IsOptional()
  @IsString()
  emailVerificiationToken?: string;

  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @IsOptional()
  @IsDate()
  passwordResetExpires?: Date;

  @IsOptional()
  @IsJSON()
  preferences?: Record<string, any>;


}
