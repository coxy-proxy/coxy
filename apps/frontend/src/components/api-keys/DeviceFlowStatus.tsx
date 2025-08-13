'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';

export default function DeviceFlowStatus() {
  const [status, setStatus] = useState('idle');

  const startDeviceFlow = () => {
    setStatus('authorizing');
    // Mocking the flow
    setTimeout(() => {
      setStatus('success');
    }, 5000);
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
          <div className="inline-block rounded-md bg-muted px-3 py-2 font-mono text-2xl">ABCD-1234</div>
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
