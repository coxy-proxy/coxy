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
            <img src="/logo.png" alt="Coxy Logo" className="h-8 w-auto" />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#product" className="text-foreground hover:text-primary font-medium">
              Product
            </a>
            <a href="#resources" className="text-foreground hover:text-primary font-medium">
              Resources
            </a>
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
          <Button asChild className="w-full">
            <a href="#get-started">Get Started</a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
