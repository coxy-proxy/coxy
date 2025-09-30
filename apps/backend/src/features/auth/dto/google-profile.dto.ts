import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleProfileDto {
  @IsString()
  googleId!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
