'use client';

import { useState, useEffect } from 'react';
import { Bed, ShieldAlert, Activity, Sparkles } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATUS_LABEL = {
  OCUPADO: 'Ocupado',
  LIVRE: 'Disponível',
  HIGIENIZACAO: 'Higienização'
};

export default function LeitosPage() {
  const [leitos, setLeitos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchLeitos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/leitos`);
        if (res.ok) setLeitos(await res.json());
      } catch (err) {
        console.error('Erro ao carregar leitos:', err);
      } finally {
        setCarregando(false);
      }
    };
    fetchLeitos();
  }, []);

  const total = leitos.length;
  const ocupados = leitos.filter((l) => l.status === 'OCUPADO').length;
  const disponiveis = leitos.filter((l) => l.status === 'LIVRE').length;
  const higienizacao = leitos.filter((l) => l.status === 'HIGIENIZACAO').length;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Ocupação de Leitos</h1>
        <p className="text-sm text-slate-500">Monitoramento de enfermaria, UTI e disponibilidade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-slate-400 uppercase">LEITOS TOTAIS</p><p className="text-2xl font-bold text-slate-800 mt-1">{total}</p></div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Bed size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-slate-400 uppercase">OCUPADOS</p><p className="text-2xl font-bold text-red-600 mt-1">{ocupados}</p></div>
          <div className="p-3 bg-red-50 text-red-500 rounded-xl"><Activity size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-slate-400 uppercase">DISPONÍVEIS</p><p className="text-2xl font-bold text-emerald-600 mt-1">{disponiveis}</p></div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><ShieldAlert size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-slate-400 uppercase">HIGIENIZAÇÃO</p><p className="text-2xl font-bold text-amber-600 mt-1">{higienizacao}</p></div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Sparkles size={20} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {leitos.map((l) => (
          <div key={l.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-lg">{l.numero}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                l.status === 'OCUPADO' ? 'bg-red-100 text-red-700' :
                l.status === 'LIVRE' ? 'bg-emerald-100 text-emerald-800' :
                'bg-amber-100 text-amber-800'
              }`}>{STATUS_LABEL[l.status] || l.status}</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{l.bloco}</p>
          </div>
        ))}
        {!carregando && total === 0 && (
          <p className="col-span-full text-center text-xs text-slate-400 py-6">Nenhum leito encontrado.</p>
        )}
      </div>
    </div>
  );
}
