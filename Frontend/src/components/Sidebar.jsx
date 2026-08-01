'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, Stethoscope, Bed, CreditCard, Settings } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Calendar, label: 'Agenda', href: '/agenda' },
    { icon: Users, label: 'Pacientes', href: '/pacientes' },
    { icon: Stethoscope, label: 'Prontuário (PEP)', href: '/prontuario' },
    { icon: Bed, label: 'Leitos', href: '/leitos' },
    { icon: CreditCard, label: 'Financeiro', href: '/financeiro' },
    { icon: Settings, label: 'Configurações', href: '/configuracoes' },
  ];

  return (
    <aside className="w-64 bg-[#0B132B] text-slate-300 min-h-screen p-4 flex flex-col justify-between shrink-0 border-r border-slate-800/80">
      <div>
        <div className="mb-8 px-2 pt-2">
          <h1 className="text-xl font-bold text-white tracking-wide">Dra. Yuska Maritan</h1>
          <p className="text-xs text-teal-400 font-medium">Gestão Hospitalar</p>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#00A884] text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-800/40 rounded-xl flex items-center gap-3 border border-slate-700/40">
        <div className="w-9 h-9 rounded-full bg-[#00A884] text-white flex items-center justify-center font-bold text-xs tracking-wider">
          YM
        </div>
        <div className="text-xs">
          <p className="font-semibold text-white">Dra. Yuska Maritan</p>
          <p className="text-slate-400">Diretora Médica</p>
        </div>
      </div>
    </aside>
  );
}