import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import allConfig from 'config';
import { catchError, firstValueFrom, interval, map, Observable, of, startWith, switchMap } from 'rxjs';
import { DeviceFlowSSEEvent } from './dto/device-flow-sse-event.dto';

interface GithubDeviceFlowResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface GithubOAuthResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

@Injectable()
export class GithubOauthService {
  private readonly config = allConfig.get<any>('github');

  constructor(private readonly httpService: HttpService) {}

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

  executeDeviceFlowWithPolling(): Observable<DeviceFlowSSEEvent> {
    return this.initiateDeviceFlow().pipe(switchMap(this.pollDeviceAuthorization));
  }

  private pollDeviceAuthorization = (initEvent: DeviceFlowSSEEvent): Observable<DeviceFlowSSEEvent> => {
    const deviceCode = initEvent.deviceCode;

    const polling$ = interval(5500).pipe(switchMap(() => this.verifyDeviceFlow(deviceCode)));

    return polling$.pipe(
      startWith(initEvent),
      catchError((error) => {
        return of({
          type: 'error' as const,
          message: `Failed to poll device authorization: ${error.message}`,
        });
      }),
    );
  };

  private initiateDeviceFlow(): Observable<DeviceFlowSSEEvent> {
    return this.httpService
      .post(
        this.config.deviceCodeApiUrl,
        {
          client_id: this.config.copilot.clientId,
          scope: 'read:user',
        },
        {
          headers: this.config.headers,
        },
      )
      .pipe(
        map((response) => response.data),
        map(this.deviceFlowResponseToEvent),
      );
  }

  private verifyDeviceFlow(deviceCode: string): Observable<DeviceFlowSSEEvent> {
    return this.httpService
      .post(
        this.config.oauthApiUrl,
        {
          client_id: this.config.copilot.clientId,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        },
        {
          headers: this.config.headers,
        },
      )
      .pipe(
        map((response) => response.data),
        map(this.oauthResponseToEvent),
      );
  }

  private deviceFlowResponseToEvent = (response: GithubDeviceFlowResponse): DeviceFlowSSEEvent => {
    return {
      type: 'initiated' as const,
      message: 'Device flow initiated. Please visit the verification URL.',
      deviceCode: response.device_code,
      userCode: response.user_code,
      verificationUri: response.verification_uri,
      expiresAt: Date.now() + response.expires_in * 1000,
    };
  };

  private oauthResponseToEvent = (response: GithubOAuthResponse): DeviceFlowSSEEvent => {
    if (response.error) {
      if (response.error === 'authorization_pending') {
        // Still in process, continue polling.
        return {
          type: 'pending' as const,
          message: 'Waiting for user authorization...',
        };
      } else {
        return {
          type: 'error' as const,
          message: `Error: ${response.error_description || response.error}`,
        };
      }
    }
    // Success case
    return {
      type: 'success' as const,
      message: 'Authorization successful!',
      accessToken: response.access_token,
    };
  };
}
