'use client';

import { useChatStore } from '@/lib/store';
import { Button } from './ui/button';
import { PlusCircle, MessageSquare, Trash2, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

export function Sidebar() {
  const { 
    sessions, 
    currentSession, 
    setCurrentSession, 
    deleteSession,
    startNewConversation,
  } = useChatStore();

    return (
    <aside className="h-full w-full max-w-xs flex-col border-r bg-card p-2 hidden lg:flex">
      <div className="flex items-center justify-between p-2 mb-2">
        <div className="flex items-center gap-2">
            <Logo size={24} />
            <h2 className="text-lg font-semibold">SkalGPT</h2>
        </div>
      </div>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => startNewConversation()}
      >
        <PlusCircle className="h-4 w-4" />
        Yeni Sohbet
      </Button>

      <p className="p-2 mt-4 text-xs font-semibold uppercase text-muted-foreground">
        Geçmiş Sohbetler
      </p>

      <ScrollArea className="flex-1 -mx-2">
        <div className="flex flex-col gap-1 p-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group flex cursor-pointer items-center justify-between rounded p-2 text-sm",
                currentSession?.id === session.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-accent'
              )}
              onClick={() => setCurrentSession(session)}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare className="h-4 w-4" />
              <span className="truncate">{session.title || 'Yeni Sohbet'}</span>
              </div>
              
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Trash2 className="h-4 w-4 text-destructive/70" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu eylem geri alınamaz. Bu, sohbet geçmişini kalıcı olarak silecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
              >
                Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}