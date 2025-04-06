'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import { SidebarProvider } from './SidebarContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system" attribute="class" enableSystem disableTransitionOnChange>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};