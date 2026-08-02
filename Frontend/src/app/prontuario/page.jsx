'use client';

import { useState, useEffect } from 'react';
import { Stethoscope, AlertCircle, Plus, Search, X, User, RefreshCw } from 'lucide-react';
import { normalizarEvolucoes, normalizarPacientes } from '@/utils/apiAdapters';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return '-';
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade;
}

export default function ProntuarioPage() {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [evolucoes, setEvolucoes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [texto, setTexto] = useState('');
  const [responsavel, setResponsavel] = useState('Dra. Yuska Maritan');
  const [salvando, setSalvando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

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

  const fetchEvolucoes = async (pacienteId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pacientes/${pacienteId}/evolucoes`);
      if (res.ok) {
        const data = await res.json();
        setEvolucoes(normalizarEvolucoes(data));
      }
    } catch (err) {
      console.error('Erro ao carregar evoluções:', err);
    }
  };

  const atualizarProntuario = async () => {
    if (!selecionado) return;

    setAtualizando(true);
    try {
      await fetchEvolucoes(selecionado.id);
    } finally {
      setAtualizando(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const selecionarPaciente = (paciente) => {
    setSelecionado(paciente);
    fetchEvolucoes(paciente.id);
  };

  const handleNovaEvolucao = async (e) => {
    e.preventDefault();
    if (!selecionado || !texto) return;

    setSalvando(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/evolucoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId: selecionado.id, texto, responsavel })
      });

      if (res.ok) {
        await fetchEvolucoes(selecionado.id);
        setTexto('');
        setIsModalOpen(false);
      } else {
        alert('Erro ao salvar a evolução no servidor.');
      }
    } catch (err) {
      console.error('Erro ao salvar evolução:', err);
      alert('Não foi possível conectar ao servidor. Verifique se o Backend está rodando.');
    } finally {
      setSalvando(false);
    }
  };

  const pacientesFiltrados = busca
    ? pacientes.filter((p) =>
        p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        p.cpf?.toLowerCase().includes(busca.toLowerCase())
      )
    : [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prontuário Eletrônico (PEP)</h1>
          <p className="text-sm text-slate-500">Histórico de atestados, diagnósticos e receituários</p>
        </div>
        <button
          onClick={() => {
            if (!selecionado) {
              alert('Selecione um paciente na busca antes de adicionar uma evolução.');
              return;
            }
            setIsModalOpen(true);
          }}
          className="bg-[#00A884] hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={18} /> Adicionar Evolução
        </button>
      </div>

      {/* Busca de paciente */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 relative">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar paciente por nome ou CPF para abrir o prontuário..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {busca && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    selecionarPaciente(p);
                    setBusca('');
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-2 cursor-pointer"
                >
                  <User size={14} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">{p.nome}</span>
                  <span className="text-xs text-slate-400">{p.cpf}</span>
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-xs text-slate-400">Nenhum paciente encontrado.</p>
            )}
          </div>
        )}
      </div>

      {selecionado ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-100 text-[#00A884] rounded-2xl flex items-center justify-center font-bold text-lg">
                {selecionado.nome?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-slate-800">{selecionado.nome}</h2>
                <p className="text-xs text-slate-400">
                  {calcularIdade(selecionado.dataNascimento)} anos • Sangue: {selecionado.tipoSanguineo || 'Não informado'}
                </p>
              </div>
            </div>
            <hr className="border-slate-100" />
            <div>
              <p className="text-xs font-bold text-red-500 uppercase flex items-center gap-1"><AlertCircle size={14} /> Alergias</p>
              <p className="text-sm text-slate-700 mt-0.5">{selecionado.alergias || 'Nenhuma alergia registrada'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Telefone</p>
              <p className="text-sm text-slate-700 mt-0.5">{selecionado.telefone}</p>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Histórico de Evoluções</h3>
              <button
                type="button"
                onClick={atualizarProntuario}
                disabled={atualizando || !selecionado}
                className="flex items-center gap-2 text-sm font-semibold text-[#00A884] disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <RefreshCw size={15} className={atualizando ? 'animate-spin' : ''} />
                {atualizando ? 'Atualizando...' : 'Atualizar prontuário'}
              </button>
            </div>
            {evolucoes.length > 0 ? (
              <div className="space-y-3">
                {evolucoes.map((ev) => (
                  <div key={ev.id} className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-800">Evolução Clínica</span>
                      <span className="text-xs text-slate-400">
                        {new Date(ev.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{ev.texto}</p>
                    <p className="text-xs font-semibold text-[#00A884]">Responsável: {ev.responsavel}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">Nenhuma evolução registrada para este paciente ainda.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Stethoscope className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="text-sm text-slate-400">Busque um paciente acima para visualizar o prontuário.</p>
        </div>
      )}

      {isModalOpen && selecionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">Nova Evolução — {selecionado.nome}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleNovaEvolucao} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Responsável</label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Evolução / Observações</label>
                <textarea
                  required
                  rows={4}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Descreva a evolução clínica, diagnóstico ou prescrição..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A884] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="w-1/2 bg-[#00A884] hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm disabled:opacity-60 cursor-pointer"
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
