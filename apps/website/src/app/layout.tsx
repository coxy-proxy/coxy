import './global.css';

import { Analytics } from '@vercel/analytics/next';
import { Nunito, PT_Sans, PT_Serif } from 'next/font/google';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
});

const ptSans = PT_Sans({
  variable: '--font-pt-sans',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const ptSerif = PT_Serif({
  variable: '--font-pt-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${nunito.variable} ${ptSans.variable} ${ptSerif.variable} antialiased relative`}>
        <div className="texture" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
