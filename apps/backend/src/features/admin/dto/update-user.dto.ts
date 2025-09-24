import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEnum(['USER', 'ADMIN'] as any)
  role?: 'USER' | 'ADMIN';
}
