'use client';

import { motion } from 'framer-motion';
import { BookOpen, Calculator, FileText, Calendar, Users, HelpCircle } from 'lucide-react';
import { useChatStore } from '@/lib/store';

export function SuggestionCards() {
  const { sendMessage, language } = useChatStore();

  const suggestions = {
    tr: [
      {
        icon: BookOpen,
        title: "Konu Anlatımı",
        description: "Matematik, Fizik, Kimya gibi derslerde yardım",
        prompt: "Matematik dersinde logaritma konusunu anlatır mısın?"
      },
      {
        icon: Calculator,
        title: "Soru Çözümü",
        description: "Adım adım soru çözüm yardımı",
        prompt: "Bu matematik sorusunu çözmeme yardım eder misin?"
      },
      {
        icon: FileText,
        title: "Özet Çıkarma",
        description: "Ders notlarından özet hazırlama",
        prompt: "Osmanlı İmparatorluğu'nun kuruluş dönemi hakkında özet hazırlar mısın?"
      },
      {
        icon: Calendar,
        title: "Sınav Hazırlığı",
        description: "Sınav programı ve çalışma planı",
        prompt: "YKS'ye nasıl hazırlanmalıyım? Çalışma programı önerir misin?"
      },
      {
        icon: Users,
        title: "Proje Önerileri",
        description: "Okul projeleri için yaratıcı fikirler",
        prompt: "Tarih dersi için proje konusu önerir misin?"
      },
      {
        icon: HelpCircle,
        title: "Genel Sorular",
        description: "Eğitim ve okul hakkında her şey",
        prompt: "Üniversite tercih sürecinde nelere dikkat etmeliyim?"
      }
    ],
    en: [
      {
        icon: BookOpen,
        title: "Subject Explanation",
        description: "Help with Math, Physics, Chemistry and other subjects",
        prompt: "Can you explain the logarithm topic in mathematics?"
      },
      {
        icon: Calculator,
        title: "Problem Solving",
        description: "Step-by-step problem solving assistance",
        prompt: "Can you help me solve this math problem?"
      },
      {
        icon: FileText,
        title: "Summary Creation",
        description: "Creating summaries from lesson notes",
        prompt: "Can you prepare a summary about the founding period of the Ottoman Empire?"
      },
      {
        icon: Calendar,
        title: "Exam Preparation",
        description: "Exam schedule and study plan",
        prompt: "How should I prepare for university entrance exams? Can you suggest a study program?"
      },
      {
        icon: Users,
        title: "Project Suggestions",
        description: "Creative ideas for school projects",
        prompt: "Can you suggest a project topic for history class?"
      },
      {
        icon: HelpCircle,
        title: "General Questions",
        description: "Everything about education and school",
        prompt: "What should I pay attention to during the university preference process?"
      }
    ]
  };

  const texts = {
    tr: {
      footer: 'Yukarıdaki önerilerden birini seçin veya kendi sorunuzu yazın'
    },
    en: {
      footer: 'Choose one of the suggestions above or type your own question'
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="w-full max-w-5xl px-2 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      >
        {suggestions[language].map((suggestion, index) => (
          <motion.div
            key={suggestion.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="card-modern p-3 sm:p-4 cursor-pointer hover:shadow-xl transition-all duration-200"
            onClick={() => handleSuggestionClick(suggestion.prompt)}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-10 lg:h-10 rounded-lg skal-gradient flex items-center justify-center flex-shrink-0 shadow-sm">
                <suggestion.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 text-xs sm:text-sm lg:text-sm mb-1">
                  {suggestion.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {suggestion.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-4 sm:mt-6"
      >
        <p className="text-xs sm:text-sm text-gray-500 px-4 sm:px-0">
          {texts[language].footer}
        </p>
      </motion.div>
    </div>
  );
}