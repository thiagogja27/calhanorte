import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Calha Norte PRO',
  description: 'Calculadora de peso de aço, catálogo de produtos em metalurgia (Gerdau, CSN) e gerador de orçamentos profissionais em PDF / WhatsApp integrados com assistente de IA Gemini.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.jpg',
    shortcut: '/icon-192.jpg',
    apple: '/icon-192.jpg',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Calha Norte PRO" />
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
