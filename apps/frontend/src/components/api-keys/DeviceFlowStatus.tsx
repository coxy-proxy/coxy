'use client';

import { useApiKeyService } from '_/hooks/useApiKeyService';
import { Check, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { DeviceFlowSSEEvent } from '@/shared/types/api-key';
import { Button } from '@/shared/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/components/tooltip';

interface DeviceFlowStatusProps {
  onSuccess?: () => void;
}

export default function DeviceFlowStatus({ onSuccess }: DeviceFlowStatusProps) {
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'success'>('idle');
  const [deviceCode, setDeviceCode] = useState<string>('');
  const [verificationUri, setVerificationUri] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(deviceCode || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch {
      // no-op
    }
  };

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
          toast.success('GitHub authorization successful', {
            description: 'A new API key has been added to your list.',
          });
          onSuccess?.();
          es.close();
        } else if (evt.type === 'error' || evt.type === 'expired') {
          setStatus('idle');
          es.close();
        }
      } catch {
        console.error('Failed to parse device flow SSE event:', e.data);
      }
    };

    es.addEventListener('initiated', messageHandler);
    es.addEventListener('pending', messageHandler);
    es.addEventListener('success', messageHandler);

    es.onerror = () => {
      setStatus('idle');
      es.close();
    };
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
            <div className="inline-block rounded-md bg-muted px-3 py-1 font-mono text-2xl">
              {deviceCode || '— — — —'}
            </div>
            <TooltipProvider disableHoverableContent>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-1"
                    aria-label={copied ? 'Copied' : 'Copy code'}
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{copied ? 'Copied!' : 'Copy code'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        </CardContent>
      )}
    </Card>
  );
}
