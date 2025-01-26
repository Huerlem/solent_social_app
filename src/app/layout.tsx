// src/app/layout.tsx
'use client';

import './globals.css'
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FormContextProvider } from '@/context/FormContext';
import { AuthContextProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className='antialiased min-h-screen flex flex-col' style={{
          fontFamily: `var(--font-geist-sans), sans-serif`,
        }}>
        <AuthContextProvider>
          <FormContextProvider>
          <Toaster position="top-right" />
            <Header />
            {children}
            <Footer />
          </FormContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}