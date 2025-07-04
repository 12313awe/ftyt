'use client';

import { useState, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';

export function ChatInput() {
  const [text, setText] = useState('');
  const { sendMessage, isLoading, isResponding } = useChatStore();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (text.trim() && !isLoading && !isResponding) {
      sendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit(); // Use built-in form submission
    }
  };

  return (
    <div className="shrink-0 border-t bg-background p-4">
      <div className="mx-auto w-full max-w-3xl">
        <form 
          ref={formRef} 
          onSubmit={handleSubmit} 
          className="relative flex items-end gap-3"
        >
          <TextareaAutosize
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            className="flex-1 resize-none rounded-md border bg-input p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            rows={1}
            maxRows={8}
            disabled={isLoading || isResponding}
          />
          <Button
              type="submit" 
            size="icon"
            disabled={!text.trim() || isLoading || isResponding}
            className="absolute bottom-1.5 right-1.5 shrink-0"
            >
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">Gönder</span>
          </Button>
        </form>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          SkalGPT hata yapabilir. Önemli bilgileri doğrulayın.
          </p>
        </div>
      </div>
  );
}