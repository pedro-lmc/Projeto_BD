'use client';

import { useState, useEffect } from 'react';
import { User, Check } from 'lucide-react';
import { normalizarConfiguracao } from '@/utils/apiAdapters';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ConfiguracoesPage() {
  const [nomeInstituicao, setNomeInstituicao] = useState('');
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const fetchConfiguracao = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/configuracoes`);
        if (res.ok) {
          const data = await res.json();
          const configuracao = normalizarConfiguracao(data);
          setNomeInstituicao(configuracao.nomeInstituicao || '');
          setEmail(configuracao.email || '');
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setCarregando(false);
      }
    };
    fetchConfiguracao();
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setSalvo(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/configuracoes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeInstituicao, email })
      });

      if (res.ok) {
        setSalvo(true);
        setTimeout(() => setSalvo(false), 3000);
      } else {
        alert('Erro ao salvar as configurações no servidor.');
      }
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      alert('Não foi possível conectar ao servidor. Verifique se o Backend está rodando.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h1>
        <p className="text-sm text-slate-500">Ajustes gerais do hospital e credenciais do usuário</p>
      </div>

      <form onSubmit={handleSalvar} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-[#00A884] rounded-xl"><User size={24} /></div>
          <div>
            <h2 className="font-bold text-slate-800">Dados do Hospital</h2>
            <p className="text-xs text-slate-400">{carregando ? 'Carregando...' : nomeInstituicao}</p>
          </div>
        </div>
        <hr className="border-slate-100" />
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da Instituição</label>
            <input
              type="text"
              required
              disabled={carregando}
              value={nomeInstituicao}
              onChange={(e) => setNomeInstituicao(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-[#00A884]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail Institucional</label>
            <input
              type="email"
              disabled={carregando}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-[#00A884]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={salvando || carregando}
            className="bg-[#00A884] hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          {salvo && (
            <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1">
              <Check size={16} /> Salvo com sucesso
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
