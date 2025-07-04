import { create } from 'zustand';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  language: 'tr' | 'en';
  
  // Actions
  createNewSession: () => void;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  sendMessage: (text: string) => Promise<void>;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage: (lang: 'tr' | 'en') => void;
}

const educationalResponses = {
  tr: [
    `# Matematik Konusu Açıklaması

Bu konuda size yardımcı olmaktan mutluluk duyarım! 

## Temel Kavramlar

- **Tanım**: Bu kavram şu şekilde açıklanabilir
- **Örnekler**: Günlük hayattan örnekler
- **Uygulama**: Pratik kullanım alanları

### Adım Adım Çözüm

1. İlk olarak problemi analiz edelim
2. Gerekli formülleri belirleyelim
3. Hesaplamaları yapalım

\`\`\`javascript
// Örnek kod
function hesapla(x, y) {
  return x + y;
}
\`\`\`

> **Not**: Bu konuyu daha iyi anlamak için pratik yapmanız önemlidir.

**Sonuç**: Bu şekilde problemi çözebiliriz.`,

    `# Detaylı Konu Anlatımı

Harika bir soru! Bu konuyu **adım adım** açıklayayım.

## Ana Başlıklar

### 1. Giriş
Bu konu hakkında temel bilgiler:
- Tanım ve önem
- Tarihçe
- Güncel kullanım

### 2. Detaylar
| Özellik | Açıklama |
|---------|----------|
| Avantaj | Pozitif yönler |
| Dezavantaj | Dikkat edilmesi gerekenler |

### 3. Örnekler
\`\`\`python
# Python örneği
def ornek_fonksiyon():
    print("Merhaba Dünya!")
\`\`\`

**Önemli**: Bu konuyu tam anlamak için pratik yapmayı unutmayın!`,

    `# Kapsamlı Rehber

Bu konu gerçekten önemli. Size **kapsamlı bir rehber** hazırlayayım.

## İçindekiler
1. [Temel Kavramlar](#temel-kavramlar)
2. [Uygulama](#uygulama)
3. [Örnekler](#örnekler)

## Temel Kavramlar

Bu konunun temelleri şunlardır:

- **Birinci nokta**: Açıklama
- **İkinci nokta**: Detay
- **Üçüncü nokta**: Örnek

## Uygulama

Pratik uygulamalar:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Örnek</title>
</head>
<body>
    <h1>Merhaba!</h1>
</body>
</html>
\`\`\`

> Bu örneği kendi bilgisayarınızda deneyebilirsiniz.

**Sonuç**: Bu rehberi takip ederek konuyu öğrenebilirsiniz.`
  ],
  en: [
    `# Mathematical Topic Explanation

I'd be happy to help you with this topic!

## Basic Concepts

- **Definition**: This concept can be explained as follows
- **Examples**: Real-life examples
- **Application**: Practical usage areas

### Step-by-Step Solution

1. First, let's analyze the problem
2. Determine the necessary formulas
3. Perform the calculations

\`\`\`javascript
// Example code
function calculate(x, y) {
  return x + y;
}
\`\`\`

> **Note**: Practice is important to better understand this topic.

**Result**: This is how we can solve the problem.`,

    `# Detailed Topic Explanation

Great question! Let me explain this topic **step by step**.

## Main Headings

### 1. Introduction
Basic information about this topic:
- Definition and importance
- History
- Current usage

### 2. Details
| Feature | Description |
|---------|-------------|
| Advantage | Positive aspects |
| Disadvantage | Points to consider |

### 3. Examples
\`\`\`python
# Python example
def example_function():
    print("Hello World!")
\`\`\`

**Important**: Don't forget to practice to fully understand this topic!`,

    `# Comprehensive Guide

This topic is really important. Let me prepare a **comprehensive guide** for you.

## Table of Contents
1. [Basic Concepts](#basic-concepts)
2. [Application](#application)
3. [Examples](#examples)

## Basic Concepts

The fundamentals of this topic are:

- **First point**: Explanation
- **Second point**: Detail
- **Third point**: Example

## Application

Practical applications:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Example</title>
</head>
<body>
    <h1>Hello!</h1>
</body>
</html>
\`\`\`

> You can try this example on your own computer.

**Conclusion**: You can learn the topic by following this guide.`
  ]
};

export const useChatStore = create<ChatStore>((set, get) => ({
  currentSession: null,
  sessions: [],
  isLoading: false,
  isSidebarOpen: false,
  language: 'tr',

  createNewSession: () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSession: newSession,
    }));
  },

  setCurrentSession: (sessionId: string) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (session) {
      set({ currentSession: session });
    }
  },

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    set((state) => {
      if (!state.currentSession) return state;

      const updatedSession = {
        ...state.currentSession,
        messages: [...state.currentSession.messages, newMessage],
        updatedAt: new Date(),
        title: state.currentSession.messages.length === 0 
          ? message.text.slice(0, 30) + (message.text.length > 30 ? '...' : '')
          : state.currentSession.title,
      };

      return {
        currentSession: updatedSession,
        sessions: state.sessions.map(s => 
          s.id === updatedSession.id ? updatedSession : s
        ),
      };
    });
  },

  sendMessage: async (text: string) => {
    const { addMessage, currentSession, createNewSession, language } = get();
    
    // Create new session if none exists
    if (!currentSession) {
      createNewSession();
    }

    // Add user message
    addMessage({ text, sender: 'user' });
    
    // Add typing indicator
    addMessage({ 
      text: '', 
      sender: 'assistant',
      isTyping: true,
    });

    set({ isLoading: true });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Remove typing indicator
      set((state) => {
        if (!state.currentSession) return state;
        
        const updatedSession = {
          ...state.currentSession,
          messages: state.currentSession.messages.filter(m => !m.isTyping),
        };

        return {
          currentSession: updatedSession,
          sessions: state.sessions.map(s => 
            s.id === updatedSession.id ? updatedSession : s
          ),
        };
      });

      // Add assistant response with markdown
      const responses = educationalResponses[language];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage({ text: response, sender: 'assistant' });
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = language === 'tr' 
        ? 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
        : 'Sorry, an error occurred. Please try again.';
      addMessage({ 
        text: errorMessage, 
        sender: 'assistant' 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  setLanguage: (lang) => set({ language: lang }),
}));