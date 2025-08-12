'use client';

import { UserButton } from '@clerk/nextjs';
import { Home, Key, MessageSquare, PanelLeft } from 'lucide-react';

import Link from 'next/link';
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
    <UiSidebar variant="inset" collapsible="icon">
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
  return (
    <SidebarProvider>
      <div className="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar-background flex min-h-svh w-full">
        {/* Sidebar */}
        <AppSidebar onClose={() => {}} />

        {/* Inset main area */}
        <SidebarInset className="bg-background border">
          <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b-2 transition-[width,height] ease-linear">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
              <SidebarTrigger />
              <div className="bg-border/60 shrink-0 mx-2 w-0.5 h-4" />
              <h1 className="text-base font-medium">Dashboard</h1>
              <div className="ml-auto flex items-center gap-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 p-4">{children}</div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
