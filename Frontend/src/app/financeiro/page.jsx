'use client';

import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

// Valores fictícios, dentro de uma faixa realista para um hospital de médio porte
const faturamentoMensal = [
  { mes: 'Fev', receita: 128400, despesas: 41200 },
  { mes: 'Mar', receita: 134900, despesas: 39800 },
  { mes: 'Abr', receita: 131200, despesas: 42500 },
  { mes: 'Mai', receita: 139700, despesas: 40100 },
  { mes: 'Jun', receita: 145300, despesas: 43600 },
  { mes: 'Jul', receita: 142800, despesas: 38200 }
];

const receitaPorConvenio = [
  { nome: 'Unimed', valor: 52300 },
  { nome: 'Bradesco Saúde', valor: 31900 },
  { nome: 'Hapvida', valor: 24800 },
  { nome: 'Particular', valor: 33800 }
];

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FinanceiroPage() {
  const mesAtual = faturamentoMensal[faturamentoMensal.length - 1];
  const mesAnterior = faturamentoMensal[faturamentoMensal.length - 2];
  const variacao = ((mesAtual.receita - mesAnterior.receita) / mesAnterior.receita) * 100;
  const lucroLiquido = mesAtual.receita - mesAtual.despesas;
  const ticketMedio = mesAtual.receita / 480; // estimativa com base no volume médio de atendimentos/mês

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel Financeiro</h1>
        <p className="text-sm text-slate-500">Resumo de receitas, convênios e custos operacionais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">RECEITA MENSAL</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatarMoeda(mesAtual.receita)}</p>
            <p className={`text-xs font-semibold mt-1 ${variacao >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {variacao >= 0 ? '+' : ''}{variacao.toFixed(1)}% vs. mês anterior
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><ArrowUpRight size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">DESPESAS</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatarMoeda(mesAtual.despesas)}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-500 rounded-xl"><ArrowDownRight size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">LUCRO LÍQUIDO</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{formatarMoeda(lucroLiquido)}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><DollarSign size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">TICKET MÉDIO</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{formatarMoeda(ticketMedio)}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-500 rounded-xl"><TrendingUp size={20} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Faturamento x Despesas (últimos 6 meses)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={faturamentoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatarMoeda(v)} />
              <Legend />
              <Line type="monotone" dataKey="receita" name="Receita" stroke="#00A884" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CreditCard size={18} /> Receita por Convênio</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={receitaPorConvenio} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="nome" tick={{ fontSize: 12, fill: '#475569' }} width={90} />
              <Tooltip formatter={(v) => formatarMoeda(v)} />
              <Bar dataKey="valor" name="Receita" fill="#0D9488" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
