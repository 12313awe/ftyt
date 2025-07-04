import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { ChatSession, Message } from '@/types/chat'; // Veritabanı ile uyumlu tipleri kullan
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export type { Message };

const supabase = createClient();

interface ChatStore {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Message[];
  user: User | null;
  isLoading: boolean;
  isResponding: boolean;
  isSidebarOpen: boolean;
  
  // Actions
  fetchSessions: () => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;
  createNewSession: (title?: string, initialMessageContent?: string) => Promise<ChatSession | null>;
  setCurrentSession: (session: ChatSession | null) => void;
  sendMessage: (text: string) => Promise<void>;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  setUser: (user: User | null) => void;
  clearChat: () => void;
  logout: () => Promise<void>;
  startNewConversation: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  user: null,
  isLoading: true, // Start with loading true
  isResponding: false,
  isSidebarOpen: true,

  setUser: (user) => set({ user }),

  fetchSessions: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ sessions: [], isLoading: false, user: null });
      return;
    }
    set({ user });

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Oturumlar yüklenirken bir hata oluştu.');
      console.error('Error fetching sessions:', error);
      set({ isLoading: false });
      return;
    }
    set({ sessions: data || [], isLoading: false });
  },

  fetchMessages: async (sessionId: string) => {
    set({ isLoading: true, messages: [] });
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Mesajlar yüklenirken bir hata oluştu.');
      console.error('Error fetching messages:', error);
      set({ messages: [], isLoading: false });
      return;
    }
    set({ messages: data || [], isLoading: false });
  },

  setCurrentSession: (session: ChatSession | null) => {
    if (get().currentSession?.id === session?.id) return;
    
    set({ currentSession: session });
    if (session) {
      get().fetchMessages(session.id);
    } else {
      set({ messages: [] });
    }
  },

  createNewSession: async (title?: string, initialMessageContent?: string) => {
    const user = get().user;
    if (!user) {
      toast.error('Oturum oluşturmak için giriş yapmalısınız.');
      return null;
    }
    
    let newSessionTitle = title || 'Yeni Sohbet';

    // Eğer initialMessageContent varsa, AI ile başlık oluştur
    if (initialMessageContent) {
      try {
        const res = await fetch('/api/generate-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: initialMessageContent }),
        });
        
        if (res.ok) {
          const data = await res.json();
          newSessionTitle = data.title; // AI tarafından oluşturulan başlığı kullan
        } else {
          console.error('AI başlık oluşturma hatası:', await res.text());
          toast.error('Sohbet başlığı oluşturulurken bir hata oluştu.');
        }
      } catch (error) {
        console.error('AI başlık oluşturma ağı hatası:', error);
        toast.error('Sohbet başlığı oluşturulurken bir ağ hatası oluştu.');
      }
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: newSessionTitle })
      .select()
      .single();

    if (error) {
      toast.error('Yeni oturum oluşturulurken bir hata oluştu.');
      console.error('Error creating new session:', error);
      return null;
    }
    
    // PERFORMANCE FIX: Add to state instead of re-fetching
    set(state => ({ sessions: [data, ...state.sessions] }));
    get().setCurrentSession(data);
    return data;
  },
  
  sendMessage: async (text: string) => {
    let session = get().currentSession;

    // If there is no active session, create a new one.
    if (!session) {
      const newSession = await get().createNewSession(text.substring(0, 30), text);
      if (!newSession) {
        toast.error('Mesaj göndermek için oturum oluşturulamadı.');
        return;
      }
      session = newSession;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      session_id: session.id,
      user_id: session.user_id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      session_id: session.id,
      user_id: session.user_id,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };

    set(state => ({ 
      messages: [...state.messages, userMessage, assistantMessage],
      isResponding: true 
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: session.id }),
      });

      if (!res.ok || !res.body) {
        const errorData = await res.json().catch(() => ({ error: "Bilinmeyen bir ağ hatası oluştu." }));
        throw new Error(errorData.error || 'API isteği başarısız oldu.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fullResponse += decoder.decode(value, { stream: true });
        
        // PERFORMANCE FIX: Surgically update only the last message's content
        set(state => {
          const newMessages = [...state.messages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.id === assistantMessage.id) {
            newMessages[newMessages.length - 1] = { ...lastMessage, content: fullResponse };
            return { messages: newMessages };
          }
          return state; // Should not happen, but as a fallback
        });
      }

    } catch (error: any) {
      console.error('Mesaj gönderilirken hata:', error);
      toast.error(`Bir hata oluştu: ${error.message}`);
      // Hata durumunda, hem kullanıcı hem de asistan mesajını state'den kaldır.
      set(state => ({
        messages: state.messages.filter(msg => msg.id !== userMessage.id && msg.id !== assistantMessage.id)
      }));
    } finally {
      set({ isResponding: false });
    }
  },
  
  deleteSession: async (sessionId: string) => {
    // Optimistic UI update
    const previousState = get();
    const newSessions = previousState.sessions.filter(s => s.id !== sessionId);
    const newCurrentSession = previousState.currentSession?.id === sessionId ? null : previousState.currentSession;

    set({ sessions: newSessions, currentSession: newCurrentSession, messages: newCurrentSession ? get().messages : [] });

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      toast.error("Oturum silinirken bir hata oluştu.");
      console.error('Error deleting session:', error);
      // Revert state on error
      set(previousState);
    } else {
      toast.success("Oturum başarıyla silindi.");
    }
  },

  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

  clearChat: () => {
    set({
      messages: [],
      currentSession: null,
    });
  },

  startNewConversation: () => {
    set({
      currentSession: null,
      messages: [],
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      sessions: [],
      messages: [],
      currentSession: null,
      isLoading: false,
    });
    toast.success("Başarıyla çıkış yapıldı.");
  }
}));

if (process.env.NODE_ENV === 'development') {
  // ... existing code ...
}