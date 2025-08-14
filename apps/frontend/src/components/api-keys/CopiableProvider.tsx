'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui/components/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/components/tooltip';

interface CopiableProviderProps {
  children: React.ReactNode;
  textToCopy: string;
}

export default function CopiableProvider({ children, textToCopy }: CopiableProviderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch {
      // no-op
    }
  };

  return (
    <>
      {children}
      <TooltipProvider disableHoverableContent>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1"
              aria-label={copied ? 'Copied' : 'Copy text'}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{copied ? 'Copied!' : 'Copy text'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
