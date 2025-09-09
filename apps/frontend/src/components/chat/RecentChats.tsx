'use client';

import { useChatStore } from '_/hooks/useChatStore';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/components/sidebar';

interface RecentChatsProps {
  limit?: number;
}

export function RecentChats({ limit = 10 }: RecentChatsProps) {
  const { sessions } = useChatStore();
  const hydrated = useChatStore((s) => s.hasHydrated);

  const recentSessions = useMemo(() => {
    const entries = Object.entries(sessions).map(([id, messages]) => {
      const lastMsg = messages[messages.length - 1];
      const t = lastMsg?.timestamp as unknown;
      const ms = t instanceof Date ? t.getTime() : t ? new Date(t as any).getTime() : 0;
      return { id, lastAtMs: ms, messages };
    });
    return entries
      .filter((s) => s.lastAtMs > 0)
      .sort((a, b) => b.lastAtMs - a.lastAtMs)
      .slice(0, limit);
  }, [sessions, limit]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {!hydrated ? (
            <SidebarMenuItem>
              <div className="text-sm text-muted-foreground px-2 py-1.5">Loading…</div>
            </SidebarMenuItem>
          ) : recentSessions.length === 0 ? (
            <SidebarMenuItem>
              <div className="text-sm text-muted-foreground px-2 py-1.5">No recent chats</div>
            </SidebarMenuItem>
          ) : (
            recentSessions.map((s) => {
              const lastMsg = s.messages[s.messages.length - 1];
              const preview = lastMsg?.content?.slice(0, 40) ?? '';
              return (
                <SidebarMenuItem key={s.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/chat/${s.id}`}>
                      <span className="truncate" title={preview || s.id}>
                        {preview || s.id}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
