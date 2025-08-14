'use client';

import { useApiKeyService } from '_/hooks/useApiKeyService';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { DeviceFlowSSEEvent } from '@/shared/types/api-key';
import { Button } from '@/shared/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';
import CopiableProvider from './CopiableProvider';

interface DeviceFlowStatusProps {
  onSuccess?: () => void;
}

export default function DeviceFlowStatus({ onSuccess }: DeviceFlowStatusProps) {
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'success'>('idle');
  const [deviceCode, setDeviceCode] = useState<string>('');
  const [verificationUri, setVerificationUri] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');

  const apiKeyService = useApiKeyService();

  const startDeviceFlow = () => {
    setStatus('authorizing');
    const es = apiKeyService.startDeviceFlow();
    const messageHandler = (e: MessageEvent) => {
      try {
        const evt: DeviceFlowSSEEvent = JSON.parse(e.data);
        if (evt.type === 'initiated' || evt.type === 'pending') {
          setDeviceCode(evt.userCode ?? '');
          setVerificationUri(evt.verificationUri ?? 'https://github.com/login/device');
        } else if (evt.type === 'success') {
          setStatus('success');
          setAccessToken(evt.accessToken ?? '');
          onSuccess?.();
          es.close();
        } else if (evt.type === 'error' || evt.type === 'expired') {
          setStatus('idle');
          toast.error('Failed to authorize with GitHub', { description: evt.message });
          es.close();
        }
      } catch {
        console.error('Failed to parse device flow SSE event:', e.data);
      }
    };

    es.addEventListener('initiated', messageHandler);
    es.addEventListener('pending', messageHandler);
    es.addEventListener('success', messageHandler);
    es.addEventListener('error', messageHandler);
  };

  return (
    <Card className="border-t">
      {status === 'idle' && (
        <>
          <CardHeader>
            <CardTitle className="text-md">Authorize with GitHub</CardTitle>
            <CardDescription>Generate a new API key by authorizing your account with GitHub.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={startDeviceFlow}>
              Authorize with GitHub
            </Button>
          </CardContent>
        </>
      )}

      {status === 'authorizing' && (
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Visit{' '}
            <a
              href={verificationUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline"
            >
              {verificationUri} <ExternalLink className="size-3" />
            </a>{' '}
            and enter the code below.
          </p>
          <div className="flex items-center justify-center gap-2">
            <CopiableProvider textToCopy={deviceCode}>
              <div className="inline-block rounded-md bg-muted px-3 py-1 font-mono text-2xl">
                {deviceCode || '— — — —'}
              </div>
            </CopiableProvider>
          </div>
          <div className="mt-2 flex justify-center items-center gap-3">
            <Loader2 className="size-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Waiting for authorization...</p>
          </div>
        </CardContent>
      )}

      {status === 'success' && (
        <CardContent className="text-center space-y-1">
          <p className="text-lg font-semibold text-green-600">Authorization Successful!</p>
          <p className="text-sm text-muted-foreground">Your new API key has been added to your list.</p>
          <div className="flex items-center justify-center gap-2">
            <CopiableProvider textToCopy={accessToken}>
              <div className="inline-block rounded-md bg-muted px-3 py-1 font-mono text-sm">{accessToken}</div>
            </CopiableProvider>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
