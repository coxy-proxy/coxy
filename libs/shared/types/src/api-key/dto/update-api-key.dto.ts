import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
