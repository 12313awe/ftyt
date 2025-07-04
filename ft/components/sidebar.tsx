'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Plus, User, LogOut } from 'lucide-react';
import { 
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  subWeeks,
  subMonths,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useChatStore } from '@/lib/store';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Sidebar() {
  const { 
    sessions, 
    currentSession, 
    setCurrentSession, 
    createNewSession, 
    language 
  } = useChatStore();

  const texts = {
    tr: {
      chatHistory: 'Sohbet Geçmişi',
      newChat: 'Yeni Sohbet',
      messages: 'mesaj',
      today: 'Bugün',
      yesterday: 'Dün',
      thisWeek: 'Bu Hafta',
      lastWeek: 'Geçen Hafta',
      thisMonth: 'Bu Ay',
      lastMonth: 'Geçen Ay',
      older: 'Daha Eski',
      logout: 'Çıkış Yap',
      student: 'Öğrenci'
    },
    en: {
      chatHistory: 'Chat History',
      newChat: 'New Chat',
      messages: 'messages',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      lastWeek: 'Last Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      older: 'Older',
      logout: 'Logout',
      student: 'Student'
    }
  };

  const locale = language === 'tr' ? tr : enUS;

  // Helper functions for date comparisons
  const isLastWeek = (date: Date) => {
    const now = new Date();
    const lastWeekStart = startOfWeek(subWeeks(now, 1));
    const lastWeekEnd = endOfWeek(subWeeks(now, 1));
    return isAfter(date, lastWeekStart) && isBefore(date, lastWeekEnd);
  };

  const isLastMonth = (date: Date) => {
    const now = new Date();
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    return isAfter(date, lastMonthStart) && isBefore(date, lastMonthEnd);
  };

  // Group sessions by date
  type GroupKey = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'older';
  
  const groupSessionsByDate = () => {
    const groups: Record<GroupKey, ChatSession[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      lastWeek: [],
      thisMonth: [],
      lastMonth: [],
      older: []
    };

    sessions.forEach((session) => {
      const date = session.createdAt;
      
      if (isToday(date)) {
        groups.today.push(session);
      } else if (isYesterday(date)) {
        groups.yesterday.push(session);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(session);
      } else if (isLastWeek(date)) {
        groups.lastWeek.push(session);
      } else if (isThisMonth(date)) {
        groups.thisMonth.push(session);
      } else if (isLastMonth(date)) {
        groups.lastMonth.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate();

  const renderSessionGroup = (groupKey: GroupKey, sessions: ChatSession[]) => {
    if (sessions.length === 0) return null;

    return (
      <div key={groupKey} className="mb-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 mb-2">
          {texts[language][groupKey]} ({sessions.length})
        </h3>
        <div className="space-y-2">
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`group relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                currentSession?.id === session.id
                  ? 'bg-gray-100/80 border border-gray-200/60 shadow-sm'
                  : 'hover:bg-gray-50/60 border border-transparent'
              }`}
              onClick={() => setCurrentSession(session.id)}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                  currentSession?.id === session.id 
                    ? 'skal-gradient' 
                    : 'bg-gray-200/60'
                }`}>
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                    {session.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(session.updatedAt, { addSuffix: true, locale })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {session.messages.length} {texts[language].messages}
                  </p>
                </div>
              </div>


            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.aside
      className="w-full sm:w-80 lg:w-80 h-full p-2 sm:p-4 flex flex-col"
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <div className="sidebar-card flex-1 flex flex-col min-h-0">
        {/* User Account Section */}
        <div className="p-4 sm:p-6 border-b border-gray-200/50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800">Ahmet Yılmaz</h3>
              <p className="text-xs text-gray-500">{texts[language].student}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  {texts[language].logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chat History Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200/50 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            {texts[language].chatHistory}
          </h2>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={createNewSession}
              className="w-full skal-gradient hover:opacity-90 text-white border-0 rounded-xl h-9 sm:h-10 shadow-sm text-sm"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {texts[language].newChat}
            </Button>
          </motion.div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full p-2 sm:p-3">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">
                  {language === 'tr' ? 'Henüz sohbet yok' : 'No chats yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {renderSessionGroup('today', groupedSessions.today)}
                {renderSessionGroup('yesterday', groupedSessions.yesterday)}
                {renderSessionGroup('thisWeek', groupedSessions.thisWeek)}
                {renderSessionGroup('lastWeek', groupedSessions.lastWeek)}
                {renderSessionGroup('thisMonth', groupedSessions.thisMonth)}
                {renderSessionGroup('lastMonth', groupedSessions.lastMonth)}
                {renderSessionGroup('older', groupedSessions.older)}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </motion.aside>
  );
}