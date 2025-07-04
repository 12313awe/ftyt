'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, MessageSquare, Plus, Languages } from 'lucide-react';
import { useChatStore } from '@/lib/store';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function TopBar() {
  const { toggleSidebar, createNewSession, language, setLanguage } = useChatStore();

  const texts = {
    tr: {
      school: 'Sezai Karakoç Anadolu Lisesi',
      turkish: 'Türkçe',
      english: 'English'
    },
    en: {
      school: 'Sezai Karakoç Anatolian High School',
      turkish: 'Türkçe',
      english: 'English'
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-30 h-16 sm:h-20 px-3 sm:px-6"
    >
      <div className="card-modern h-full flex items-center justify-between px-3 sm:px-6 mx-2 sm:mx-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 text-gray-600"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <motion.div
            className="flex items-center gap-2 sm:gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl skal-gradient-reverse flex items-center justify-center shadow-md">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                SkalGPT
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {texts[language].school}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={createNewSession}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 text-gray-600"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 text-gray-600"
                >
                  <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={() => setLanguage('tr')}
                  className={language === 'tr' ? 'bg-gray-100' : ''}
                >
                  🇹🇷 {texts[language].turkish}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-gray-100' : ''}
                >
                  🇺🇸 {texts[language].english}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}