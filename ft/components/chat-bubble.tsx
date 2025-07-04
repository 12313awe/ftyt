'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import { Message } from '@/lib/store';
import { MarkdownRenderer } from './markdown-renderer';
import { Button } from './ui/button';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(feedback === type ? null : type);
  };

  return (
    <div className={`relative flex gap-2 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl skal-gradient flex items-center justify-center flex-shrink-0 shadow-md"
        >
          <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: isUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`max-w-[85%] sm:max-w-[70%] ${isUser ? 'order-first' : ''}`}
      >
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={`p-3 sm:p-4 rounded-2xl shadow-sm ${
            isUser
              ? 'skal-gradient text-white'
              : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-800'
          }`}
        >
          {isUser ? (
            <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              <MarkdownRenderer content={message.text} />
            </div>
          ) : (
            <div className="text-xs sm:text-sm">
              <MarkdownRenderer content={message.text} />
            </div>
          )}
        </motion.div>
        
        <div className={`flex items-center gap-2 mt-1 sm:mt-2 text-xs text-gray-500 ${
          isUser ? 'justify-end' : 'justify-between'
        }`}>
          <div className="flex items-center gap-2">
            <span>{format(message.timestamp, 'HH:mm')}</span>
            {isUser && (
              <div className="w-2 h-2 rounded-full bg-green-400" />
            )}
          </div>
          
          {!isUser && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-400" />
                  )}
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('up')}
                  className={`h-6 w-6 p-0 hover:bg-gray-100 ${
                    feedback === 'up' ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('down')}
                  className={`h-6 w-6 p-0 hover:bg-gray-100 ${
                    feedback === 'down' ? 'text-red-600' : 'text-gray-400'
                  }`}
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      {isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-200/60 flex items-center justify-center flex-shrink-0 shadow-md"
        >
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        </motion.div>
      )}
    </div>
  );
}