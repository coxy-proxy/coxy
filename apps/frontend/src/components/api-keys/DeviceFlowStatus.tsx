'use client';

import { Check, Copy, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/components/tooltip';

export default function DeviceFlowStatus() {
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'success'>('idle');
  const deviceCode = 'ABCD-1234';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(deviceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch {
      // no-op
    }
  };

  const startDeviceFlow = () => {
    setStatus('authorizing');
    // Mocking the flow
    setTimeout(() => {
      setStatus('success');
    }, 50000);
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
            <a href="#" className="underline">
              github.com/login/device
            </a>{' '}
            and enter the code below.
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="inline-block rounded-md bg-muted px-3 py-1 font-mono text-2xl">{deviceCode}</div>
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
