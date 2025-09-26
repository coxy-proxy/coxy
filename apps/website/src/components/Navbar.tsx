'use client';

import React from 'react';
import { Button } from '@/shared/ui/components/button';

export default function Navbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur supports-backdrop-blur:border-b border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a href="#home" className="flex-shrink-0 inline-flex items-center gap-2">
            <img src="/header-dark.png" alt="Coxy Logo" className="h-8 w-auto" />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#product" className="text-foreground hover:text-primary font-medium">
              Product
            </a>
            <a href="#resources" className="text-foreground hover:text-primary font-medium">
              Resources
            </a>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/coxy-proxy/coxy"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Open Coxy GitHub repository"
                title="GitHub"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
                  <path
                    fill="currentColor"
                    d="M12 .5C5.73.5.99 5.24.99 11.5c0 4.85 3.14 8.96 7.49 10.41.55.1.75-.24.75-.53 0-.26-.01-.95-.01-1.87-3.05.66-3.69-1.47-3.69-1.47-.5-1.27-1.22-1.6-1.22-1.6-.99-.68.08-.67.08-.67 1.1.08 1.67 1.13 1.67 1.13.97 1.66 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.42.11-2.97 0 0 .93-.3 3.05 1.12.88-.25 1.83-.38 2.77-.39.94.01 1.89.14 2.77.39 2.12-1.42 3.05-1.12 3.05-1.12.6 1.55.22 2.69.11 2.97.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.15-5.02 5.42.39.33.73.97.73 1.96 0 1.41-.01 2.55-.01 2.9 0 .29.2.64.76.53 4.34-1.45 7.48-5.56 7.48-10.41C23.01 5.24 18.27.5 12 .5Z"
                  />
                </svg>
              </a>
            </Button>
            <Button asChild>
              <a href="#get-started">Get Started</a>
            </Button>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              aria-label="Toggle menu"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div id="mobile-menu" className={`${open ? 'block' : 'hidden'} md:hidden border-t`}>
        <div className="px-4 py-3 space-y-2">
          <a
            href="#product"
            className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-accent"
          >
            Product
          </a>
          <a
            href="#resources"
            className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-accent"
          >
            Resources
          </a>
          <a
            href="https://github.com/coxy-proxy/coxy"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-accent"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 .5C5.73.5.99 5.24.99 11.5c0 4.85 3.14 8.96 7.49 10.41.55.1.75-.24.75-.53 0-.26-.01-.95-.01-1.87-3.05.66-3.69-1.47-3.69-1.47-.5-1.27-1.22-1.6-1.22-1.6-.99-.68.08-.67.08-.67 1.1.08 1.67 1.13 1.67 1.13.97 1.66 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.42.11-2.97 0 0 .93-.3 3.05 1.12.88-.25 1.83-.38 2.77-.39.94.01 1.89.14 2.77.39 2.12-1.42 3.05-1.12 3.05-1.12.6 1.55.22 2.69.11 2.97.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.15-5.02 5.42.39.33.73.97.73 1.96 0 1.41-.01 2.55-.01 2.9 0 .29.2.64.76.53 4.34-1.45 7.48-5.56 7.48-10.41C23.01 5.24 18.27.5 12 .5Z"
              />
            </svg>
            GitHub
          </a>
          <Button asChild className="w-full">
            <a href="#get-started">Get Started</a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
