import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const notifications = [
    { id: 1, message: "New participant signed up for your study." },
    { id: 2, message: "Your study 'Cognitive Research' has a new message." },
];


export const DashboardHeader = ({role, setRole}) => {
    const { user, signOut } = useAuth();
    const [roleLoading, setRoleLoading] = useState(false);
    return (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hello There,</h1>
            <p>{role === 'researcher' ? "Manage your research studies and participants" : "Browse and join studies that match your interests"}</p>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="px-8 py-2 rounded-full hover:bg-gray-200 transition-colors" variant="ghost" size="icon" aria-label="Select language">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" className="mr-1"><path fillRule="evenodd" d="M9 0a9.001 9.001 0 0 0 0 18A9.001 9.001 0 0 0 9 0Zm5.98 5.222h-2.01a14.073 14.073 0 0 0-.91-2.121c-.12-.222-.242-.434-.353-.636a7.156 7.156 0 0 1 3.273 2.757ZM7.859 3.616C8.455 2.566 9 1.93 9 1.93s.545.637 1.141 1.687c.263.465.536 1 .778 1.606H7.081a13.28 13.28 0 0 1 .778-1.606ZM6.293 2.465c-.111.202-.232.414-.354.636a14.073 14.073 0 0 0-.909 2.121H3.02a7.156 7.156 0 0 1 3.273-2.757Zm-4.212 7.98A6.804 6.804 0 0 1 1.929 9c0-.636.081-1.263.253-1.848h2.343A10.944 10.944 0 0 0 4.364 9c0 .495.04.98.11 1.444H2.082Zm.707 1.929h2.1c.294.97.678 1.828 1.051 2.525.122.222.243.434.354.636a7.044 7.044 0 0 1-3.505-3.161Zm7.353 2.01C9.545 15.434 9 16.07 9 16.07s-.545-.637-1.141-1.687a12.498 12.498 0 0 1-.93-2.01h4.142a12.5 12.5 0 0 1-.93 2.01Zm-3.727-3.94A8.445 8.445 0 0 1 6.293 9c0-.636.07-1.263.202-1.848h5.01c.131.585.202 1.212.202 1.848 0 .495-.04.98-.121 1.444H6.414Zm5.293 5.091c.111-.202.232-.414.354-.636.373-.697.757-1.556 1.05-2.525h2.101a7.045 7.045 0 0 1-3.505 3.161Zm1.818-5.09c.071-.465.111-.95.111-1.445 0-.636-.06-1.263-.161-1.848h2.343c.172.585.253 1.212.253 1.848 0 .495-.05.98-.152 1.444h-2.394Z" clipRule="evenodd"></path></svg>
                  EN
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>EN</DropdownMenuItem>
                <DropdownMenuItem>FR</DropdownMenuItem>
                <DropdownMenuItem>DE</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <svg aria-hidden="true" height="16" width="16" viewBox="0 0 18 18">
                    <path fill="currentColor" d="M10.995 2.14c2.764.494 3.874 2.202 4.71 5.79.67 2.877.983 4.081 1.537 5.32.501.423.752.984.758 1.725v.047C17.983 17.582 15.038 18 9 18c-6.035 0-8.98-.418-9-2.974v-.053c.006-.648.2-1.159.583-1.56a27.52 27.52 0 0 0 .916-2.778c.147-.534.278-1.064.428-1.71.039-.164.285-1.247.355-1.543.794-3.347 1.9-4.86 4.72-5.276a2 2 0 1 1 3.992.034Zm-1.75 1.845a2.02 2.02 0 0 1-.505-.002c-3.102.027-3.77.735-4.512 3.86-.068.286-.312 1.362-.353 1.535a45.228 45.228 0 0 1-.447 1.786c-.11.397-.224.787-.346 1.173C4.533 12.072 6.502 12 9 12c2.407 0 4.322.066 5.756.308-.293-.95-.581-2.134-.999-3.924-.804-3.449-1.541-4.345-4.512-4.399ZM9 16c3.866 0 7-.448 7-1s-3.134-1-7-1-7 .448-7 1 3.134 1 7 1Z"></path>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {notifications.length === 0 ? (
                  <DropdownMenuItem className="text-muted-foreground">
                    No new notifications
                  </DropdownMenuItem>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id}>{n.message}</DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage className="cursor-pointer p-1.5 rounded-full hover:bg-gray-200 transition-colors" src="https://github.com/shadcn.png" />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRole(role === 'researcher' ? 'participant' : 'researcher')}>
                  Switch to {role === 'researcher' ? 'Participant' : 'Researcher'}
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
    )
}