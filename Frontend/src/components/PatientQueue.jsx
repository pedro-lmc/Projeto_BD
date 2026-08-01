"use client";

import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function formatarHorario(valor) {
  if (!valor) {
    return '--:--';
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return '--:--';
  }

  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PatientQueue() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarFila() {
      try {
        setLoading(true);
        setErro('');

        const resposta = await fetch(`${API_BASE_URL}/api/atendimentos/hoje`);

        if (!resposta.ok) {
          throw new Error('Falha ao carregar a fila.');
        }

        const dados = await resposta.json();

        if (!ativo) {
          return;
        }

        setPacientes(Array.isArray(dados) ? dados : []);
      } catch (error) {
        if (!ativo) {
          return;
        }

        setErro('Não foi possível carregar a fila de atendimento.');
        setPacientes([]);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarFila();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-base font-bold text-slate-800 mb-4">Fila Virtual de Atendimento</h3>
      <div className="overflow-x-auto">
        {loading && <p className="text-sm text-slate-500 py-3">Carregando fila...</p>}
        {erro && <p className="text-sm text-red-600 py-3">{erro}</p>}
        {!loading && !erro && pacientes.length === 0 && (
          <p className="text-sm text-slate-500 py-3">Nenhum atendimento encontrado para hoje.</p>
        )}

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <th className="pb-3 font-semibold">Horário</th>
              <th className="pb-3 font-semibold">Paciente</th>
              <th className="pb-3 font-semibold">Tipo</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pacientes.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 font-medium text-slate-700">{formatarHorario(p.dataHora)}</td>
                <td className="py-3 font-bold text-slate-800">{p.paciente?.nome || 'Paciente não informado'}</td>
                <td className="py-3 text-slate-500">{p.queixaPrincipal || 'Consulta'}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    p.status === 'EM_ATENDIMENTO'
                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {p.status === 'EM_ATENDIMENTO'
                      ? 'Em Atendimento'
                      : p.status === 'CONCLUIDO'
                        ? 'Concluído'
                        : p.status === 'CANCELADO'
                          ? 'Cancelado'
                          : 'Aguardando'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}