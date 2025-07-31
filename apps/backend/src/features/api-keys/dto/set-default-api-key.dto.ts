import { IsNotEmpty, IsString } from 'class-validator';

export class SetDefaultApiKeyDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
