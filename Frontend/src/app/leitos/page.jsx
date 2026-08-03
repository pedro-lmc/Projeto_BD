'use client';

import { useState, useEffect, useRef } from 'react';
import { Bed, ShieldAlert, Activity, Sparkles, MoreVertical, UserPlus, UserMinus, SprayCan, X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATUS_LABEL = {
  OCUPADO: 'Ocupado',
  LIVRE: 'Disponível',
  HIGIENIZACAO: 'Higienização'
};

export default function LeitosPage() {
  const [leitos, setLeitos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [modalAdicionar, setModalAdicionar] = useState(null); // leito selecionado para internar
  const [pacientes, setPacientes] = useState([]);
  const [pacienteId, setPacienteId] = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const menuRef = useRef(null);

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

  useEffect(() => {
    fetchLeitos();
  }, []);

  // Fecha o menu de três pontinhos se o usuário clicar fora dele
  useEffect(() => {
    function handleClickFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbertoId(null);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const abrirModalAdicionar = async (leito) => {
    setMenuAbertoId(null);
    setModalAdicionar(leito);
    setPacienteId('');
    setBuscaPaciente('');
    setErro('');
    try {
      // Só pacientes sem internação ativa em qualquer leito aparecem aqui —
      // um paciente não pode ocupar dois leitos ao mesmo tempo.
      const res = await fetch(`${API_BASE_URL}/api/leitos/pacientes-disponiveis`);
      if (res.ok) setPacientes(await res.json());
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    }
  };

  const confirmarAdicionarPaciente = async (e) => {
    e.preventDefault();
    if (!pacienteId || !modalAdicionar) return;

    setSalvando(true);
    setErro('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/leitos/${modalAdicionar.id}/paciente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId })
      });

      if (res.ok) {
        await fetchLeitos();
        setModalAdicionar(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setErro(data.error || 'Erro ao internar paciente no leito.');
      }
    } catch (err) {
      console.error('Erro ao internar paciente:', err);
      setErro('Erro ao internar paciente no leito.');
    } finally {
      setSalvando(false);
    }
  };

  const removerPaciente = async (leito) => {
    setMenuAbertoId(null);
    if (!window.confirm(`Remover ${leito.paciente?.nome || 'o paciente'} do leito ${leito.numero}? O leito ficará marcado como sujo (higienização).`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/leitos/${leito.id}/paciente`, { method: 'DELETE' });
      if (res.ok) {
        await fetchLeitos();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Erro ao remover paciente do leito.');
      }
    } catch (err) {
      console.error('Erro ao remover paciente:', err);
    }
  };

  const limparLeito = async (leito) => {
    setMenuAbertoId(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/leitos/${leito.id}/limpar`, { method: 'POST' });
      if (res.ok) {
        await fetchLeitos();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Erro ao higienizar o leito.');
      }
    } catch (err) {
      console.error('Erro ao limpar leito:', err);
    }
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    (p.nome || '').toLowerCase().includes(buscaPaciente.toLowerCase())
  );

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
          <div key={l.id} className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-bold text-slate-800 text-lg">{l.numero}</span>

              <div className="relative" ref={menuAbertoId === l.id ? menuRef : null}>
                <button
                  type="button"
                  onClick={() => setMenuAbertoId(menuAbertoId === l.id ? null : l.id)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  aria-label="Mais opções"
                >
                  <MoreVertical size={18} />
                </button>

                {menuAbertoId === l.id && (
                  <div className="absolute right-0 top-8 z-10 w-52 bg-white rounded-xl border border-slate-100 shadow-lg py-1.5">
                    {l.status === 'LIVRE' && (
                      <button
                        type="button"
                        onClick={() => abrirModalAdicionar(l)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <UserPlus size={16} className="text-emerald-600" /> Adicionar paciente
                      </button>
                    )}
                    {l.status === 'OCUPADO' && (
                      <button
                        type="button"
                        onClick={() => removerPaciente(l)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <UserMinus size={16} className="text-red-600" /> Remover paciente
                      </button>
                    )}
                    {l.status === 'HIGIENIZACAO' && (
                      <button
                        type="button"
                        onClick={() => limparLeito(l)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <SprayCan size={16} className="text-amber-600" /> Limpar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              l.status === 'OCUPADO' ? 'bg-red-100 text-red-700' :
              l.status === 'LIVRE' ? 'bg-emerald-100 text-emerald-800' :
              'bg-amber-100 text-amber-800'
            }`}>{STATUS_LABEL[l.status] || l.status}</span>

            <p className="text-xs text-slate-400 font-medium">{l.bloco}</p>
            {l.status === 'OCUPADO' && l.paciente && (
              <p className="text-xs text-slate-600 font-semibold truncate">{l.paciente.nome}</p>
            )}
          </div>
        ))}
        {!carregando && total === 0 && (
          <p className="col-span-full text-center text-xs text-slate-400 py-6">Nenhum leito encontrado.</p>
        )}
      </div>

      {/* Modal: adicionar paciente ao leito */}
      {modalAdicionar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">Internar paciente — {modalAdicionar.numero}</h2>
              <button type="button" onClick={() => setModalAdicionar(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={confirmarAdicionarPaciente} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Buscar paciente</label>
                <input
                  type="text"
                  value={buscaPaciente}
                  onChange={(e) => setBuscaPaciente(e.target.value)}
                  placeholder="Digite o nome do paciente..."
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00A884]"
                />
              </div>

              <div className="max-h-52 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-50 ${
                        String(pacienteId) === String(p.id) ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="paciente"
                        value={p.id}
                        checked={String(pacienteId) === String(p.id)}
                        onChange={(e) => setPacienteId(e.target.value)}
                      />
                      <span className="font-medium text-slate-700">{p.nome}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">Nenhum paciente encontrado.</p>
                )}
              </div>

              {erro && <p className="text-xs text-red-600 font-medium">{erro}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAdicionar(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!pacienteId || salvando}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#00A884] hover:bg-[#00926f] disabled:opacity-50"
                >
                  {salvando ? 'Internando...' : 'Internar paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}