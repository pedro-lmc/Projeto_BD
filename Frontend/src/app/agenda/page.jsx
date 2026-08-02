'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, UserCheck, Plus, Search, X, Trash2 } from 'lucide-react';
import { normalizarAtendimentos } from '@/utils/apiAdapters';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AgendaPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [busca, setBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);

  const [paciente, setPaciente] = useState('');
  const [medico, setMedico] = useState('Dra. Yuska Maritan');
  const [especialidade, setEspecialidade] = useState('Cardiologia');
  const [convenio, setConvenio] = useState('Unimed');
  const [hora, setHora] = useState('');

  const fetchAgendamentos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/atendimentos`);
      if (res.ok) {
        const data = await res.json();
        setAgendamentos(normalizarAtendimentos(data));
      }
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const handleNovoAgendamento = async (e) => {
    e.preventDefault();
    if (!paciente || !hora) return;

    setSalvando(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/atendimentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente,
          hora,
          status: 'AGUARDANDO',
          medico,
          especialidade,
          convenio,
          observacao: 'Consulta agendada pelo módulo de agenda.'
        })
      });

      if (res.ok) {
        await fetchAgendamentos(); // Recarrega os dados atualizados do banco

        // Reseta o formulário
        setPaciente('');
        setHora('');
        setEspecialidade('Cardiologia');
        setConvenio('Unimed');
        setMedico('Dra. Yuska Maritan');
        setIsModalOpen(false);
      } else {
        alert('Erro ao salvar no servidor. Verifique o terminal do Backend.');
      }
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      alert('Não foi possível conectar ao servidor. Verifique se o Backend está rodando.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirAgendamento = async (id) => {
    if (!window.confirm('Deseja remover este agendamento da agenda?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/atendimentos/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setAgendamentos((prev) => prev.filter((item) => item.id !== id));
        if (atendimentoSelecionado?.id === id) {
          setAtendimentoSelecionado(null);
        }
      }
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err);
    }
  };

  const agendamentosFiltrados = agendamentos.filter(item =>
    item.paciente?.toLowerCase().includes(busca.toLowerCase()) ||
    item.medico?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Topo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agenda Médica</h1>
          <p className="text-sm text-slate-500">Gestão diária de horários, retornos e consultas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00A884] hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={18} /> Agendar Consulta
        </button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-slate-400 uppercase">AGENDADOS HOJE</p><p className="text-2xl font-bold text-slate-800 mt-1">{agendamentos.length}</p></div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Calendar size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-slate-400 uppercase">NA RECEPÇÃO</p><p className="text-2xl font-bold text-slate-800 mt-1">3</p></div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Clock size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-slate-400 uppercase">ATENDIDOS</p><p className="text-2xl font-bold text-slate-800 mt-1">7</p></div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><CheckCircle2 size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-slate-400 uppercase">MÉDICOS ATIVOS</p><p className="text-2xl font-bold text-slate-800 mt-1">5</p></div>
          <div className="p-3 bg-purple-50 text-purple-500 rounded-xl"><UserCheck size={20} /></div>
        </div>
      </div>

      {/* Tabela de Agendamentos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <h2 className="font-bold text-slate-800 text-base">Horários do Dia</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Filtrar por paciente/médico..." 
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
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {agendamentosFiltrados.length > 0 ? (
              agendamentosFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-3 font-semibold text-slate-700">{item.hora}</td>
                  <td className="py-3 font-bold text-slate-800">
                    <button
                      type="button"
                      onClick={() => setAtendimentoSelecionado(item)}
                      className="text-left hover:text-[#00A884] hover:underline underline-offset-2"
                    >
                      {item.paciente}
                    </button>
                  </td>
                  <td className="py-3 text-slate-600">{item.medico}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-start gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'EM_ATENDIMENTO' ? 'bg-amber-100/80 text-amber-800' :
                        item.status === 'CONCLUIDO' ? 'bg-emerald-100/80 text-emerald-800' :
                        item.status === 'CANCELADO' ? 'bg-red-100/80 text-red-800' :
                        'bg-blue-100/80 text-blue-800'
                      }`}>
                        {item.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleExcluirAgendamento(item.id)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Excluir agendamento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center text-xs text-slate-400 font-medium">
                  Nenhuma consulta encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {atendimentoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800">Detalhes do Agendamento</h3>
                <p className="text-sm text-slate-500">{atendimentoSelecionado.paciente}</p>
              </div>
              <button onClick={() => setAtendimentoSelecionado(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-400">Horário</p>
                <p className="font-semibold text-slate-700 mt-1">{atendimentoSelecionado.hora}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-400">Status</p>
                <p className="font-semibold text-slate-700 mt-1">{atendimentoSelecionado.status}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-400">Médico</p>
                <p className="font-semibold text-slate-700 mt-1">{atendimentoSelecionado.medico}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-400">Especialidade</p>
                <p className="font-semibold text-slate-700 mt-1">{atendimentoSelecionado.especialidade || 'Cardiologia'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-400">Convênio</p>
                <p className="font-semibold text-slate-700 mt-1">{atendimentoSelecionado.convenio || 'Unimed'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 md:col-span-2">
                <p className="text-xs font-semibold uppercase text-slate-400">Observação</p>
                <p className="font-semibold text-slate-700 mt-1">{atendimentoSelecionado.observacao || 'Consulta agendada pelo módulo de agenda.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO AGENDAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">Agendar Nova Consulta</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleNovoAgendamento} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Paciente</label>
                <input
                  type="text"
                  required
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                  placeholder="Ex: Beatriz Vasconcelos"
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Convênio</label>
                  <select
                    value={convenio}
                    onChange={(e) => setConvenio(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                  >
                    <option>Unimed</option>
                    <option>Bradesco Saúde</option>
                    <option>Hapvida</option>
                    <option>Particular</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Médico Responsável</label>
                <select
                  value={medico}
                  onChange={(e) => setMedico(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                >
                  <option>Dra. Yuska Maritan</option>
                  <option>Dr. Roberto Alves</option>
                  <option>Dr. Fernando Costa</option>
                  <option>Dra. Camila Duarte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Especialidade</label>
                <select
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                >
                  <option>Cardiologia</option>
                  <option>Clínica Geral</option>
                  <option>Pediatria</option>
                  <option>Ortopedia</option>
                  <option>Ginecologia</option>
                </select>
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
                  disabled={salvando}
                  className="w-1/2 bg-[#00A884] hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}