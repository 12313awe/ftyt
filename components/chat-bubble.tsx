'use client';

import { Message } from '@/types/chat';
import dynamic from 'next/dynamic';

const DynamicMarkdownRenderer = dynamic(
  () => import('./markdown-renderer').then(mod => mod.MarkdownRenderer),
  {
    loading: () => <div className="prose prose-sm max-w-none"><p>Yükleniyor...</p></div>,
    ssr: false // Markdown renderer might have client-side dependencies
  }
);

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
            isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
          }`}
        >
        <div className="prose prose-sm max-w-none text-current dark:text-white">
            <DynamicMarkdownRenderer content={message.content || ''} />
        </div>
      </div>
    </div>
  );
}