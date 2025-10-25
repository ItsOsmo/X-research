"use client";
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Search
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
  badge?: string;
}

interface SidebarProps {
  className?: string;
  activeSection: 'dashboard' | 'conversations' | 'participant-groups';
  onSectionChange: (section: 'dashboard' | 'conversations' | 'participant-groups') => void;
  onLogout?: () => void;
}

// Navigation items for researcher dashboard
const navigationItems: NavigationItem[] = [
  { 
    id: "dashboard", 
    name: "Dashboard", 
    icon: LayoutDashboard, 
    href: "/dashboard",
    description: "Main researcher dashboard"
  },
  { 
    id: "conversations", 
    name: "Conversations", 
    icon: MessageSquare, 
    href: "/conversations",
    description: "Send, receive, and review communications with participants"
  },
  { 
    id: "participant-groups", 
    name: "Participant Groups", 
    icon: Users, 
    href: "/participant-groups",
    description: "Create participant groups to easily include or exclude participants across projects"
  },
];

export function ModernSidebar({ className = "", activeSection, onSectionChange, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId as 'dashboard' | 'conversations' | 'participant-groups');
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-6 left-6 z-50 p-3 rounded-lg bg-background shadow-md border border-border md:hidden hover:bg-muted transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        {isOpen ? 
          <X className="h-5 w-5 text-muted-foreground" /> : 
          <Menu className="h-5 w-5 text-muted-foreground" />
        }
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-background border-r border-border z-40 transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-96"}
          md:translate-x-0 md:static md:z-auto
          ${className}
        `}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <Logo size="md" />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-base">XResearch</span>
                <span className="text-xs text-muted-foreground">Research Platform</span>
              </div>
            </div>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-md hover:bg-muted transition-all duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-md text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-3 rounded-md text-left transition-all duration-200 group
                      ${isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                      ${isCollapsed ? "justify-center px-2" : ""}
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                      <Icon
                        className={`
                          h-5 w-5 flex-shrink-0
                          ${isActive 
                            ? "text-primary-foreground" 
                            : "text-muted-foreground group-hover:text-foreground"
                          }
                        `}
                      />
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex flex-col flex-1">
                        <span className={`text-sm ${isActive ? "font-medium" : "font-normal"}`}>
                          {item.name}
                        </span>
                        {item.description && (
                          <span className={`text-xs opacity-75 line-clamp-2 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}>
                            {item.description}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-border">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover border-l border-t border-border rotate-45" />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section with logout */}
        <div className="mt-auto border-t border-border">
          {/* Logout Button */}
          <div className="p-3">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center rounded-md text-left transition-all duration-200 group
                text-destructive hover:bg-destructive/10 hover:text-destructive
                ${isCollapsed ? "justify-center p-2.5" : "space-x-3 px-3 py-2.5"}
              `}
              title={isCollapsed ? "Logout" : undefined}
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <LogOut className="h-5 w-5 flex-shrink-0 text-destructive" />
              </div>
              
              {!isCollapsed && (
                <span className="text-sm">Logout</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-border">
                  Logout
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-popover border-l border-t border-border rotate-45" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}