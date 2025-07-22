import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import allConfig from 'config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GithubOauthService {
  private readonly config = allConfig.get<any>('github');

  constructor(private readonly httpService: HttpService) {}

  async initiateDeviceFlow(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.config.deviceCodeApiUrl,
          {
            client_id: this.config.copilot.clientId,
            scope: 'copilot',
          },
          {
            headers: this.config.headers,
          },
        ),
      );

      return {
        device_code: response.data.device_code,
        user_code: response.data.user_code,
        verification_uri: response.data.verification_uri,
        expires_in: response.data.expires_in,
        interval: response.data.interval,
      };
    } catch (error) {
      throw new Error(
        `Failed to initiate GitHub device flow: ${error.message}`,
      );
    }
  }

  async verifyDeviceFlow(deviceCode: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.config.oauthApiUrl,
          {
            client_id: this.config.copilot.clientId,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          },
          {
            headers: this.config.headers,
          },
        ),
      );

      if (response.data.error) {
        return {
          error: response.data.error,
          error_description: response.data.error_description,
        };
      }

      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        scope: response.data.scope,
      };
    } catch (error) {
      throw new Error(`Failed to verify GitHub device flow: ${error.message}`);
    }
  }

  async getCopilotTokenDetails(accessToken: string): Promise<any> {
    try {
      // TODO: Implement GitHub Copilot internal API call to get token details
      // This would be used to validate the token and get user information
      const response = await firstValueFrom(
        this.httpService.get(this.config.copilot.tokenApiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...this.config.copilot.headers,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get token details: ${error.message}`);
    }
  }
}
