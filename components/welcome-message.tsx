'use client';

import { Logo } from "./logo";

export function WelcomeMessage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4">
        <Logo size={80} />
      </div>
      <h2 className="text-2xl font-semibold text-foreground">
        SkalGPT'ye Hoş Geldiniz
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Bu yapay zeka asistanı, Sezai Karakoç Anadolu Lisesi için özel olarak tasarlanmıştır. Dersler, ödevler ve okul hakkında merak ettiğiniz her şeyi sorabilirsiniz.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Başlamak için aşağıdaki metin kutusuna bir mesaj yazın.
      </p>
    </div>
  );
} 