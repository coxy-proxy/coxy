'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/ui/lib/utils';

interface ScrollShadowViewportProps {
  className?: string; // classes for the scrollable viewport container
  contentClassName?: string; // classes for the inner width-constrained content wrapper
  children: React.ReactNode;
  // Triggers an auto scroll to bottom when any dependency changes (e.g., [messages, isLoading])
  autoScrollOn?: any[];
}

// Refactored: static IntersectionObserver + stable sentinels
export function ScrollShadowViewport({
  className,
  contentClassName,
  children,
  autoScrollOn = [],
}: ScrollShadowViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  // Shadows state
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  // Stable sentinel refs (DOM nodes never conditionally rendered or re-keyed)
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  // Create a static IO once when the viewportRef is available; avoids rAF
  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === topSentinelRef.current) {
            setShowTopShadow(!entry.isIntersecting);
          } else if (entry.target === bottomSentinelRef.current) {
            setShowBottomShadow(!entry.isIntersecting);
          }
        }
      },
      {
        root,
        threshold: 0.01,
        rootMargin: '0px',
      },
    );

    if (topSentinelRef.current) io.observe(topSentinelRef.current);
    if (bottomSentinelRef.current) io.observe(bottomSentinelRef.current);

    return () => io.disconnect();
  }, []);

  // Always auto-scroll to bottom when dependencies change (keeps prior behavior)
  useEffect(() => {
    const v = viewportRef.current;
    if (!v) return;
    v.scrollTop = v.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, autoScrollOn);

  return (
    <div ref={viewportRef} className={cn('relative overflow-y-auto', className)}>
      {/* Top shadow */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none sticky top-0 z-10 h-16 -mt-16 transition-opacity duration-200',
          'bg-gradient-to-b from-background to-transparent',
          showTopShadow ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Content */}
      <div className={cn(contentClassName)}>
        {/* Top sentinel */}
        <div ref={topSentinelRef} aria-hidden className="h-px w-full" />

        {children}

        {/* Bottom sentinel */}
        <div ref={bottomSentinelRef} aria-hidden className="h-px w-full" />
      </div>

      {/* Bottom shadow */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none sticky bottom-0 z-10 h-16 -mb-16 transition-opacity duration-200',
          'bg-gradient-to-t from-background to-transparent',
          showBottomShadow ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
}

export default ScrollShadowViewport;
