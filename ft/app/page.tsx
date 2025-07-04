'use client';

import { ChatInterface } from '@/components/chat-interface';

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <ChatInterface />
    </div>
  );
}