import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Users } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import Logo from '@/components/ui/Logo';

interface ResearcherSidebarProps {
  activeSection: 'dashboard' | 'conversations' | 'participant-groups';
  onSectionChange: (section: 'dashboard' | 'conversations' | 'participant-groups') => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    value: 'dashboard' as const,
    icon: LayoutDashboard,
    description: 'Main researcher dashboard'
  },
  {
    title: 'Conversations',
    value: 'conversations' as const,
    icon: MessageSquare,
    description: 'Send, receive, and review communications with participants'
  },
  {
    title: 'Participant Groups',
    value: 'participant-groups' as const,
    icon: Users,
    description: 'Create participant groups to easily include or exclude participants across projects'
  }
];

export function ResearcherSidebar({ activeSection, onSectionChange }: ResearcherSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Logo size="md" className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-lg font-semibold">XResearch</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.value}>
              <SidebarMenuButton
                onClick={() => onSectionChange(item.value)}
                className={`w-full justify-start gap-3 py-3 px-3 rounded-lg transition-colors ${
                  activeSection === item.value
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{item.title}</span>
                    {item.value !== 'dashboard' && (
                      <span className="text-xs opacity-75 line-clamp-2">
                        {item.description}
                      </span>
                    )}
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}