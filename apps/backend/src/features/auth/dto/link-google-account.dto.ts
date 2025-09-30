import { IsString } from 'class-validator';

export class LinkGoogleAccountDto {
  @IsString()
  googleId!: string;
}
