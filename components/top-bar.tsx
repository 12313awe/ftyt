'use client';

import { useChatStore } from '@/lib/store';
import { Button } from './ui/button';
import { PanelLeft } from 'lucide-react';
import { UserNav } from './user-nav';
import { Logo } from './logo';

export function TopBar() {
  const { toggleSidebar } = useChatStore();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden" // Only show on small screens
        >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <div className="hidden lg:block">
            <Logo size={30} />
        </div>
        <h1 className="text-lg font-semibold lg:hidden">SkalGPT</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Placeholder for future buttons */}
        <UserNav />
      </div>
    </header>
  );
}