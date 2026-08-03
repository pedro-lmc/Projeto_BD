'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, X, Pencil, Trash2 } from 'lucide-react';
import { normalizarPacientes } from '@/utils/apiAdapters';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const FORM_VAZIO = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  tipoSanguineo: '',
  alergias: ''
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [pacienteEmEdicao, setPacienteEmEdicao] = useState(null); // null = criando novo

  const [form, setForm] = useState(FORM_VAZIO);

  const fetchPacientes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pacientes`);
      if (res.ok) {
        const data = await res.json();
        setPacientes(normalizarPacientes(data));
      }
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const resetForm = () => {
    setForm(FORM_VAZIO);
    setPacienteEmEdicao(null);
  };

  const abrirModalNovo = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (paciente) => {
    setPacienteEmEdicao(paciente);
    setForm({
      nome: paciente.nome || '',
      cpf: paciente.cpf || '',
      dataNascimento: paciente.dataNascimento ? String(paciente.dataNascimento).slice(0, 10) : '',
      telefone: paciente.telefone || '',
      tipoSanguineo: paciente.tipoSanguineo || '',
      alergias: paciente.alergias || ''
    });
    setIsModalOpen(true);
  };

  const handleSalvarPaciente = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.cpf || !form.dataNascimento || !form.telefone) return;

    const editando = Boolean(pacienteEmEdicao);
    const url = editando
      ? `${API_BASE_URL}/api/pacientes/${pacienteEmEdicao.id}`
      : `${API_BASE_URL}/api/pacientes`;

    setSalvando(true);
    try {
      const res = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        await fetchPacientes();
        resetForm();
        setIsModalOpen(false);
      } else {
        const erro = await res.json().catch(() => ({}));
        alert(erro.error || 'Erro ao salvar paciente no servidor.');
      }
    } catch (err) {
      console.error('Erro ao salvar paciente:', err);
      alert('Não foi possível conectar ao servidor. Verifique se o Backend está rodando.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirPaciente = async (paciente) => {
    if (!window.confirm(
      `Deseja remover o paciente "${paciente.nome}"?\n\nEsta ação também apaga TODOS os atendimentos, internações e evoluções vinculados a ele. Não pode ser desfeita.`
    )) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/pacientes/${paciente.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setPacientes((prev) => prev.filter((p) => p.id !== paciente.id));
      } else {
        const erro = await res.json().catch(() => ({}));
        alert(erro.error || 'Erro ao excluir paciente.');
      }
    } catch (err) {
      console.error('Erro ao excluir paciente:', err);
      alert('Não foi possível conectar ao servidor. Verifique se o Backend está rodando.');
    }
  };

  const formatarData = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('pt-BR');
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    p.cpf?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Base de Pacientes</h1>
          <p className="text-sm text-slate-500">Listagem geral e busca cadastral do hospital</p>
        </div>
        <button
          onClick={abrirModalNovo}
          className="bg-[#00A884] hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <UserPlus size={18} /> Novo Paciente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por Nome ou CPF..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <table className="w-full text-left text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="pb-2 pl-3">Nome Completo</th>
              <th className="pb-2">CPF</th>
              <th className="pb-2">Telefone</th>
              <th className="pb-2">Tipo Sanguíneo</th>
              <th className="pb-2">Última Visita</th>
              <th className="pb-2">Cadastrado em</th>
              <th className="pb-2 text-right pr-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-3 font-bold text-slate-800">{p.nome}</td>
                  <td className="py-3 text-slate-600">{p.cpf}</td>
                  <td className="py-3 text-slate-600">{p.telefone}</td>
                  <td className="py-3">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      {p.tipoSanguineo || 'Não informado'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {p.atendimentos?.[0] ? formatarData(p.atendimentos[0].dataHora) : 'Sem atendimentos'}
                  </td>
                  <td className="py-3 text-slate-400">{formatarData(p.createdAt)}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => abrirModalEdicao(p)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Editar paciente"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluirPaciente(p)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Excluir paciente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-6 text-center text-xs text-slate-400 font-medium">
                  Nenhum paciente cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={18} /> {pacienteEmEdicao ? 'Editar Paciente' : 'Novo Paciente'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarPaciente} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Ana Maria Silva"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">CPF</label>
                  <input
                    type="text"
                    required
                    value={form.cpf}
                    onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={form.dataNascimento}
                    onChange={(e) => setForm((f) => ({ ...f, dataNascimento: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone</label>
                  <input
                    type="text"
                    required
                    value={form.telefone}
                    onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                    placeholder="(83) 90000-0000"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo Sanguíneo</label>
                  <select
                    value={form.tipoSanguineo}
                    onChange={(e) => setForm((f) => ({ ...f, tipoSanguineo: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                  >
                    <option value="">Não informado</option>
                    <option>A+</option><option>A-</option>
                    <option>B+</option><option>B-</option>
                    <option>AB+</option><option>AB-</option>
                    <option>O+</option><option>O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Alergias (separadas por vírgula)</label>
                <input
                  type="text"
                  value={form.alergias}
                  onChange={(e) => setForm((f) => ({ ...f, alergias: e.target.value }))}
                  placeholder="Ex: Dipirona, Penicilina"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="w-1/2 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="w-1/2 bg-[#00A884] hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {salvando ? 'Salvando...' : pacienteEmEdicao ? 'Salvar alterações' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}