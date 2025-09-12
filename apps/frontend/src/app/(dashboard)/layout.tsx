'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import { RecentChats } from '_/components/chat/RecentChats';
import { useChatStore } from '_/hooks/useChatStore';
import { Key, MessageSquare, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/components/dropdown-menu';
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
  SidebarTrigger,
  Sidebar as UiSidebar,
} from '@/shared/ui/components/sidebar';
import { Toaster } from '@/shared/ui/components/sonner';

function AppSidebar() {
  const { user } = useUser();
  const fullName = user?.fullName ?? user?.firstName ?? 'User';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const imageUrl = user?.imageUrl ?? undefined;

  return (
    <UiSidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Image src="/logo.png" width={32} height={32} alt="Coxy Logo" loading="lazy" />
          <Link href="/">
            <span className="font-semibold text-2xl">Coxy</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/api-keys">
                    <Key />
                    <span>API Keys</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chat">
                    <MessageSquare />
                    <span>New Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <RecentChats />
      </SidebarContent>
      <SidebarFooter>
        {process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-3 text-left outline-hidden  transition-[width,height,padding] h-12 text-sm data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                type="button"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={imageUrl} alt={fullName} />
                  <AvatarFallback className="rounded-lg">{fullName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="text-muted-foreground truncate text-xs">{email}</span>
                </div>
                <MoreVertical className="ml-auto size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="https://github.com/hankchiutw/copilot-proxy/issues" target="_blank">
                  Get Help
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <SignOutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </UiSidebar>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = pathname.startsWith('/api-keys') ? 'API Keys' : pathname.startsWith('/chat') ? 'Chat' : '';
  return (
    <SidebarProvider>
      <div
        className="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar-background flex min-h-svh w-full bg-sidebar"
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 60)',
            '--sidebar-width-icon': '3rem',
            '--header-height': 'calc(var(--spacing) * 14)',
          } as React.CSSProperties
        }
      >
        <AppSidebar />

        {/* Inset main area */}
        <SidebarInset className="bg-background border">
          <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b-2 transition-[width,height] ease-linear">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
              <SidebarTrigger />
              <div className="bg-border/60 shrink-0 mx-2 w-0.5 h-4" />
              <h1 className="text-base font-medium">{pageTitle}</h1>
            </div>
          </header>
          <div className="flex flex-1 flex-col overflow-y-auto rounded-[inherit] ">{children}</div>
          <Toaster richColors position="top-right" />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
