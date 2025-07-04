'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useChatStore } from '@/lib/store';

export function TypingIndicator() {
  const { language } = useChatStore();

  const texts = {
    tr: {
      typing: 'SkalGPT yazıyor'
    },
    en: {
      typing: 'SkalGPT is typing'
    }
  };

  return (
    <div className="flex gap-2 sm:gap-4 justify-start">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl skal-gradient flex items-center justify-center flex-shrink-0 shadow-md"
      >
        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-3 sm:p-4 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-xs sm:text-sm">{texts[language].typing}</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}