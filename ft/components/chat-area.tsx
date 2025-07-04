'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { useChatStore } from '@/lib/store';
import { ChatBubble } from './chat-bubble';
import { TypingIndicator } from './typing-indicator';
import { ScrollArea } from './ui/scroll-area';
import { SuggestionCards } from './suggestion-cards';
import { QuickActions } from './quick-actions';

export function ChatArea() {
  const { currentSession, language } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages]);

  const texts = {
    tr: {
      greeting: 'Merhaba! Ben SkalGPT',
      description: 'Sezai Karakoç Anadolu Lisesi için özel geliştirilmiş eğitim asistanınızım.',
      question: 'Size nasıl yardımcı olabilirim?',
      quickStart: 'Hızlı başlangıç:'
    },
    en: {
      greeting: 'Hello! I am SkalGPT',
      description: 'I am your educational assistant specially developed for Sezai Karakoç Anatolian High School.',
      question: 'How can I help you?',
      quickStart: 'Quick start:'
    }
  };

  if (!currentSession || currentSession.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-start p-4 sm:p-8 min-h-full">
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6 sm:mb-8"
              >
                <motion.div 
                  className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl skal-gradient-reverse flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <GraduationCap className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-white" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {texts[language].greeting}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-2 sm:mb-3 text-sm sm:text-base lg:text-base px-4 sm:px-0">
                  {texts[language].description}
                </p>
                <p className="text-xs sm:text-sm lg:text-sm text-gray-500 mb-6 sm:mb-8">
                  {texts[language].question}
                </p>
                
                {/* Quick Actions */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{texts[language].quickStart}</p>
                  <QuickActions />
                </div>
              </motion.div>
              
              <div className="w-full">
                <SuggestionCards />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="max-w-4xl mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 pb-4">
            <AnimatePresence mode="popLayout">
              {currentSession.messages.map((message) => (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                  {message.isTyping ? (
                    <TypingIndicator />
                  ) : (
                    <ChatBubble message={message} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}