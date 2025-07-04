'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { TopBar } from './top-bar';
import { Sidebar } from './sidebar';
import { ChatArea } from './chat-area';
import { ChatInput } from './chat-input';

export function ChatInterface() {
  const { isSidebarOpen, fetchSessions } = useChatStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="flex h-screen w-full flex-col bg-gray-100">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && <Sidebar />}
        <div className="flex flex-1 flex-col">
          <ChatArea />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}