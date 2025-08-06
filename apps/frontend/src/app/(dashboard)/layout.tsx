'use client';

import { UserButton } from '@clerk/nextjs';
import { useState } from 'react';

function Sidebar({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full p-4 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold">AI Chatbot</h1>
      <nav className="mt-8">
        <a href="/chat" className="block py-2">
          Chat
        </a>
        <a href="/api-keys" className="block py-2">
          API Keys
        </a>
      </nav>
      <button onClick={onClose} className="lg:hidden mt-auto">
        Close
      </button>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-800" onClick={(e) => e.stopPropagation()}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <Sidebar onClose={() => {}} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <MenuIcon />
          </button>
          <div className="flex-1" />
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
