'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/lib/store';
import { TopBar } from './top-bar';
import { Sidebar } from './sidebar';
import { ChatArea } from './chat-area';
import { ChatInput } from './chat-input';

export function ChatInterface() {
  const { currentSession, createNewSession, isSidebarOpen, setSidebarOpen } = useChatStore();

  useEffect(() => {
    if (!currentSession) {
      createNewSession();
    }
  }, [currentSession, createNewSession]);

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      <div className="flex flex-1 relative min-h-0">
        {/* Sidebar - Always visible on desktop */}
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block relative z-20`}>
          <Sidebar />
        </div>

        {/* Sidebar Overlay for mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatArea />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}