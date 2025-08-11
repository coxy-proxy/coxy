'use client';

import { UserButton } from '@clerk/nextjs';
import { Home, Key, MessageSquare, PanelLeft } from 'lucide-react';

import Link from 'next/link';
import { useState } from 'react';
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  Sidebar as UiSidebar,
} from '@/shared/ui/components/sidebar';

function AppSidebar({ onClose }: { onClose: () => void }) {
  return (
    <UiSidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <MessageSquare className="size-5" />
          <span className="font-semibold">AI Chatbot</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chat">
                    <MessageSquare />
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/api-keys">
                    <Key />
                    <span>API Keys</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground">Press ⌘B to toggle</div>
      </SidebarFooter>
    </UiSidebar>
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
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar overlay retained for now (UiSidebar supports its own offcanvas) */}
        <div
          className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <AppSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <AppSidebar onClose={() => {}} />
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
    </SidebarProvider>
  );
}
