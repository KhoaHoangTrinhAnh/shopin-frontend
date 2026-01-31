// D:\shopin-frontend\src\app\layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import StoreProvider from '@/components/StoreProvider';
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
        <StoreProvider>
          <div className="w-full box-border mx-auto bg-white">
            <ConditionalLayout>{children}</ConditionalLayout>
          </div>
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  )
}
