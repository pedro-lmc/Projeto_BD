'use client';

import { useState, useEffect } from 'react';
import {
  Plus, X, Calendar, Stethoscope, Clock, UserCheck,
  Search, Users, Bed, DollarSign, ArrowRight
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Mesmo valor ilustrativo usado na aba Financeiro, para manter os números consistentes
const RECEITA_MES_ATUAL = 142800;

export default function Dashboard() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [leitos, setLeitos] = useState([]);
  const [busca, setBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [paciente, setPaciente] = useState('');
  const [tipo, setTipo] = useState('Consulta');
  const [hora, setHora] = useState('');

  const fetchAtendimentos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/atendimentos`);
      if (res.ok) setAtendimentos(await res.json());
    } catch (err) {
      console.error('Erro ao carregar atendimentos:', err);
    }
  };

  const fetchPacientes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pacientes`);
      if (res.ok) setPacientes(await res.json());
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    }
  };

  const fetchLeitos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leitos`);
      if (res.ok) setLeitos(await res.json());
    } catch (err) {
      console.error('Erro ao carregar leitos:', err);
    }
  };

  useEffect(() => {
    fetchAtendimentos();
    fetchPacientes();
    fetchLeitos();
  }, []);

  const handleNovoAtendimento = async (e) => {
    e.preventDefault();
    if (!paciente || !hora) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/atendimentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paciente, hora, tipo, status: 'AGUARDANDO' })
      });

      if (res.ok) {
        await fetchAtendimentos();
        await fetchPacientes();
        setPaciente('');
        setHora('');
        setIsModalOpen(false);
      } else {
        alert('Erro ao salvar no servidor. Verifique o terminal do Backend.');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
  };

  const handleMudarStatus = async (id, novoStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/atendimentos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      if (res.ok) {
        setAtendimentos(atendimentos.map((item) =>
          item.id === id ? { ...item, status: novoStatus } : item
        ));
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const atendimentosFiltrados = atendimentos.filter((item) =>
    item.paciente.toLowerCase().includes(busca.toLowerCase())
  );

  const totalLeitos = leitos.length;
  const leitosOcupados = leitos.filter((l) => l.status === 'OCUPADO').length;
  const leitosLivres = leitos.filter((l) => l.status === 'LIVRE').length;
  const leitosHigienizacao = leitos.filter((l) => l.status === 'HIGIENIZACAO').length;
  const ocupacaoPercentual = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;

  const ultimosPacientes = [...pacientes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="p-8 space-y-6">
      {/* Topo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Painel Geral</h1>
          <p className="text-sm text-slate-500">Acompanhamento em tempo real do hospital</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00A884] hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={18} /> Novo Atendimento
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL REGISTRADOS</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{atendimentos.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Calendar size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">OCUPAÇÃO LEITOS</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{ocupacaoPercentual}%</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><Stethoscope size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PACIENTES CADASTRADOS</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{pacientes.length}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-500 rounded-xl"><Users size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AGUARDANDO</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {atendimentos.filter((a) => a.status === 'AGUARDANDO').length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><UserCheck size={20} /></div>
        </div>
      </div>

      {/* Tabela da Fila Virtual */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-slate-800 text-base">Fila Virtual de Atendimento</h2>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar paciente..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-[#00A884]"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="pb-2 pl-3">Horário</th>
              <th className="pb-2">Paciente</th>
              <th className="pb-2">Médico</th>
              <th className="pb-2">Status Atual</th>
              <th className="pb-2 text-right pr-3">Alterar Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {atendimentosFiltrados.length > 0 ? (
              atendimentosFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-3 font-semibold text-slate-700">{item.hora}</td>
                  <td className="py-3 font-bold text-slate-800">{item.paciente}</td>
                  <td className="py-3 text-slate-500">{item.medico}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'EM_ATENDIMENTO' ? 'bg-amber-100 text-amber-800' :
                      item.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-3">
                    <select
                      value={item.status}
                      onChange={(e) => handleMudarStatus(item.id, e.target.value)}
                      className="text-xs bg-slate-100 font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="AGUARDANDO">AGUARDANDO</option>
                      <option value="EM_ATENDIMENTO">EM ATENDIMENTO</option>
                      <option value="CONCLUIDO">CONCLUIDO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-6 text-center text-xs text-slate-400 font-medium">
                  Nenhum atendimento salvo no banco de dados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resumo das demais áreas do sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumo de Leitos */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Bed size={16} /> Leitos</h3>
            <a href="/leitos" className="text-xs font-semibold text-[#00A884] flex items-center gap-1 hover:underline">
              Ver detalhes <ArrowRight size={12} />
            </a>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Ocupados</span>
              <span className="font-bold text-red-600">{leitosOcupados}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Disponíveis</span>
              <span className="font-bold text-emerald-600">{leitosLivres}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Higienização</span>
              <span className="font-bold text-amber-600">{leitosHigienizacao}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden flex">
              <div className="bg-red-400 h-2" style={{ width: `${totalLeitos ? (leitosOcupados / totalLeitos) * 100 : 0}%` }} />
              <div className="bg-amber-400 h-2" style={{ width: `${totalLeitos ? (leitosHigienizacao / totalLeitos) * 100 : 0}%` }} />
              <div className="bg-emerald-400 h-2" style={{ width: `${totalLeitos ? (leitosLivres / totalLeitos) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Últimos Pacientes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={16} /> Últimos Pacientes</h3>
            <a href="/pacientes" className="text-xs font-semibold text-[#00A884] flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight size={12} />
            </a>
          </div>
          <div className="space-y-3">
            {ultimosPacientes.length > 0 ? (
              ultimosPacientes.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-100 text-[#00A884] rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {p.nome?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{p.nome}</p>
                    <p className="text-xs text-slate-400">{p.telefone}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Nenhum paciente cadastrado ainda.</p>
            )}
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><DollarSign size={16} /> Financeiro</h3>
            <a href="/financeiro" className="text-xs font-semibold text-[#00A884] flex items-center gap-1 hover:underline">
              Ver detalhes <ArrowRight size={12} />
            </a>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Receita do Mês</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {RECEITA_MES_ATUAL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <p className="text-xs text-slate-400">Valores ilustrativos com base no fluxo médio mensal do hospital.</p>
        </div>
      </div>

      {/* MODAL NOVO ATENDIMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">Novo Atendimento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleNovoAtendimento} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Paciente</label>
                <input
                  type="text"
                  required
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                  >
                    <option>Consulta</option>
                    <option>Retorno</option>
                    <option>Triagem</option>
                    <option>Exame</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#00A884] hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
