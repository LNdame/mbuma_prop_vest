import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { CurrencyProvider } from '@/lib/CurrencyContext';

export const metadata: Metadata = {
  title: 'Mbuma PropVest — Property Pledges for Everyone',
  description:
    'Fractionalised property pledge platform. Start pledging in South African real estate from as little as R1 000.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><CurrencyProvider>{children}</CurrencyProvider></body>
    </html>
  );
}
