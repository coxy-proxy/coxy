export class LoginResponseDto {
  user!: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    avatar: string | null;
    authProvider: 'EMAIL' | 'GOOGLE' | 'BOTH';
    isGoogleLinked?: boolean;
  };
  accessToken!: string;
  refreshToken!: string;
}
