'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import { ChatBubble } from './chat-bubble';
import { TypingIndicator } from './typing-indicator';
import { useVirtualizer } from '@tanstack/react-virtual';
import { WelcomeMessage } from './welcome-message';

export function ChatArea() {
  const { messages, isLoading, currentSession } = useChatStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: messages.length + (isLoading ? 1 : 0), // Add 1 for typing indicator
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimate of average item height in px
    overscan: 5,
  });

  useEffect(() => {
    if (messages.length) {
      rowVirtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    }
  }, [messages.length, rowVirtualizer]);

  const virtualItems = rowVirtualizer.getVirtualItems();

  if (!currentSession) {
  return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">
            Başlamak için bir sohbet seçin veya yeni bir tane oluşturun.
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <WelcomeMessage />
      </div>
    );
  }

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto p-4">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isLoaderRow = virtualItem.index > messages.length - 1;
          const message = messages[virtualItem.index];

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="px-2" // Add some padding for messages
            >
              {isLoaderRow ? <TypingIndicator /> : <ChatBubble message={message} />}
            </div>
          );
        })}
          </div>
    </div>
  );
}