// D:\shopin-frontend\src\app\layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { ToastProvider } from '@/contexts/ToastContext';
import ClientBodyCleanup from '@/components/ClientBodyCleanup';
import ToastContainer from '@/components/ToastContainer';
import ConditionalLayout from '@/components/ConditionalLayout';

export const metadata: Metadata = {
  title: 'ShopIn',
  description: 'Best online store!',
  icons: { icon: "/favicon.svg"}
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scrollbar-hide">
      <body suppressHydrationWarning>
        <ClientBodyCleanup />
        <AuthProvider>
          <SearchProvider>
            <ToastProvider>
              <div className="w-full box-border mx-auto bg-white">
                <ConditionalLayout>{children}</ConditionalLayout>
              </div>
              <ToastContainer />
            </ToastProvider>
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
