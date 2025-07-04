'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.replace('/chat');
      } else {
        router.replace('/auth/login');
      }
    };

    checkUserAndRedirect();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <p>Yönlendiriliyor...</p>
    </div>
  );
} 