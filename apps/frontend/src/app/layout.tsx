import { AuthProvider } from '_/contexts/AuthContext';
import './global.css';

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
    <AuthProvider>
      <html lang="en">
        <body className={`${nunito.variable} ${ptSans.variable} ${ptSerif.variable} antialiased relative bg-sidebar`}>
          <div className="texture" />
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
