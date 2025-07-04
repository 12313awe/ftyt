'use client';

import { motion } from 'framer-motion';
import { Calculator, BookOpen, FileText, Lightbulb, Code, Globe } from 'lucide-react';
import { useChatStore } from '@/lib/store';
import { Button } from './ui/button';

export function QuickActions() {
  const { sendMessage, language } = useChatStore();

  const quickActions = {
    tr: [
      {
        icon: Calculator,
        label: 'Matematik',
        prompt: 'Bu matematik problemini çöz: ',
        color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      },
      {
        icon: BookOpen,
        label: 'Açıkla',
        prompt: 'Bu konuyu detaylı açıkla: ',
        color: 'bg-green-100 text-green-700 hover:bg-green-200'
      },
      {
        icon: FileText,
        label: 'Özet',
        prompt: 'Bu metni özetle: ',
        color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      },
      {
        icon: Lightbulb,
        label: 'Fikir',
        prompt: 'Bu konu hakkında yaratıcı fikirler ver: ',
        color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      },
      {
        icon: Code,
        label: 'Kod',
        prompt: 'Bu kodu açıkla ve örnekle: ',
        color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      },
      {
        icon: Globe,
        label: 'Çevir',
        prompt: 'Bu metni çevir: ',
        color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
      }
    ],
    en: [
      {
        icon: Calculator,
        label: 'Math',
        prompt: 'Solve this math problem: ',
        color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      },
      {
        icon: BookOpen,
        label: 'Explain',
        prompt: 'Explain this topic in detail: ',
        color: 'bg-green-100 text-green-700 hover:bg-green-200'
      },
      {
        icon: FileText,
        label: 'Summary',
        prompt: 'Summarize this text: ',
        color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      },
      {
        icon: Lightbulb,
        label: 'Ideas',
        prompt: 'Give creative ideas about: ',
        color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      },
      {
        icon: Code,
        label: 'Code',
        prompt: 'Explain this code with examples: ',
        color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      },
      {
        icon: Globe,
        label: 'Translate',
        prompt: 'Translate this text: ',
        color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
      }
    ]
  };

  const handleQuickAction = (prompt: string) => {
    // Focus on input and add prompt
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
      textarea.value = prompt;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-4"
    >
      {quickActions[language].map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickAction(action.prompt)}
            className={`${action.color} border-0 rounded-full px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200`}
          >
            <action.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {action.label}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}