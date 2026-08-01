import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Dra. Yuska Maritan - Gestão Hospitalar',
  description: 'Painel de gestão hospitalar e acompanhamento em tempo real.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100/70 flex min-h-screen text-slate-900 antialiased font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}