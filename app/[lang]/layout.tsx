"use client";

import { ThemeProvider } from '@/contexts/theme-context';
import { LanguageProvider } from '@/contexts/language-context';
import { AdminAuthProvider } from '@/contexts/admin-auth-context';
import { AdminToolbar } from '@/components/admin-toolbar';
import { use } from 'react';

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);

  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <LanguageProvider initialLang={lang}>
          <AdminToolbar />
          {children}
        </LanguageProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
