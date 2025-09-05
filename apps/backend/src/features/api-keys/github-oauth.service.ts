import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  catchError,
  firstValueFrom,
  interval,
  map,
  Observable,
  of,
  Subject,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { CopilotMeta, DeviceFlowSSEEvent } from '@/shared/types/api-key';

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

interface GithubCopilotTokenApiResponse {
  token: string;
  expires_at: string;
  limited_user_quotas: {
    chat: number;
    completions: number;
  } | null;
  limited_user_reset_date: number | null;
}

@Injectable()
export class GithubOauthService {
  private readonly logger = new Logger(GithubOauthService.name);
  private readonly config: any;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get<any>('github');
  }

  async fetchCopilotMeta(key: string): Promise<CopilotMeta> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.config.copilot_internal.tokenApiUrl, {
          headers: {
            Authorization: `token ${key}`,
          },
        }),
      );

      return this.tokenApiResponseToMeta(response.data);
    } catch (error) {
      throw new Error(`Failed to get token details: ${error.message}`);
    }
  }

  executeDeviceFlowWithPolling(): Observable<DeviceFlowSSEEvent> {
    return this.initiateDeviceFlow().pipe(switchMap(this.pollDeviceAuthorization));
  }

  private pollDeviceAuthorization = (initEvent: DeviceFlowSSEEvent): Observable<DeviceFlowSSEEvent> => {
    const deviceCode = initEvent.deviceCode;

    const stopPolling$ = new Subject();
    const polling$ = interval(5500).pipe(
      takeUntil(stopPolling$),
      switchMap(() => this.verifyDeviceFlow(deviceCode)),
      map((pollingEvent) => ({ ...initEvent, ...pollingEvent })),
      tap((event) => event.type === 'success' && stopPolling$.next(void 0)),
    );

    return polling$.pipe(
      startWith(initEvent),
      catchError((error) => {
        this.logger.error(`Polling device authorization error:`, error.message);
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

  private tokenApiResponseToMeta = (response: GithubCopilotTokenApiResponse): CopilotMeta => {
    const { token, expires_at, limited_user_quotas, limited_user_reset_date } = response;

    const chatQuota = limited_user_quotas?.chat ?? null;
    const completionsQuota = limited_user_quotas?.completions ?? null;
    const resetTime =
      limited_user_reset_date !== null && limited_user_reset_date !== undefined ? limited_user_reset_date * 1000 : null;
    const expiresAt = expires_at ? new Date(expires_at).getTime() : Date.now() + 60 * 60 * 1000;

    return { token, expiresAt, resetTime, chatQuota, completionsQuota };
  };
}
