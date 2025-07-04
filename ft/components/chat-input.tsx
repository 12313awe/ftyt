'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useChatStore } from '@/lib/store';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

export function ChatInput() {
  const [message, setMessage] = useState('');
  const { sendMessage, isLoading, language } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const texts = {
    tr: {
      placeholder: 'Sorunuzu yazın... (Markdown desteklenir)',
      disclaimer: 'SkalGPT hata yapabilir. Önemli bilgileri doğrulamayı unutmayın.'
    },
    en: {
      placeholder: 'Type your question... (Markdown supported)',
      disclaimer: 'SkalGPT can make mistakes. Remember to verify important information.'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const messageText = message.trim();
    setMessage('');
    await sendMessage(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="flex-shrink-0">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-3 sm:p-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="card-modern p-3 sm:p-4">
            <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={texts[language].placeholder}
                  className="min-h-[40px] sm:min-h-[48px] max-h-32 resize-none bg-gray-50/50 border-gray-200/50 text-gray-800 placeholder:text-gray-500 focus:border-gray-300 focus:ring-gray-200/50 text-sm sm:text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Send Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="skal-gradient hover:opacity-90 text-white border-0 flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-xl shadow-sm"
                  size="icon"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </motion.div>
            </form>
          </div>
          
          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-2 sm:mt-3"
          >
            <p className="text-xs text-gray-500 px-4 sm:px-0">
              {texts[language].disclaimer}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}