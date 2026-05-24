import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Calha Norte PRO',
  description: 'Calculadora de peso de aço, catálogo de produtos em metalurgia (Gerdau, CSN) e gerador de orçamentos profissionais em PDF / WhatsApp integrados com assistente de IA Gemini.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
