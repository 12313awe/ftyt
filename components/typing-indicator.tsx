'use client';

import { motion } from 'framer-motion';
import { useChatStore } from '@/lib/store';
import React from 'react';

const TypingIndicatorComponent = React.forwardRef<HTMLDivElement>((props, ref) => {
  const { isResponding } = useChatStore();

  if (!isResponding) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex items-center space-x-2 p-4"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
        <div className="flex space-x-1">
          <motion.div
            className="w-1.5 h-1.5 bg-gray-600 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="w-1.5 h-1.5 bg-gray-600 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          <motion.div
            className="w-1.5 h-1.5 bg-gray-600 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
});

TypingIndicatorComponent.displayName = 'TypingIndicator';

export const TypingIndicator = TypingIndicatorComponent;