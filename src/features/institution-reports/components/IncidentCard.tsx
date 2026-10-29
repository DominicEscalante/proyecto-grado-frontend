import React from 'react';
import { IncidenteInstitucional } from '../types/institution-reports.types.js';

interface Props { incident: IncidenteInstitucional; isSelected: boolean; onSelect: (incident: IncidenteInstitucional) => void; isBomberos: boolean; }

export const IncidentCard: React.FC<Props> = ({ incident, isSelected, onSelect, isBomberos }) => {
  const pending = incident.estado === 'PENDIENTE';
  const status = pending ? 'Pendiente' : incident.estado === 'ATENDIDO' ? 'Atendido' : incident.estado === 'FALSA_ALARMA' ? 'Falsa alarma' : 'En Curso';
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(incident.fechaReporte).getTime()) / 60000));
  return (
    <button type="button" onClick={() => onSelect(incident)} className={`relative block w-full border-b p-3.5 text-left transition-colors ${isBomberos ? 'border-[#ec5766]/15' : 'border-emerald-900/10'} ${isSelected ? isBomberos ? 'border-y border-[#da344d]/40 bg-[#ef7674]/20' : 'border-y border-emerald-800/40 bg-emerald-100/60' : isBomberos ? 'bg-[#FDF8F7] hover:bg-[#ef7674]/10' : 'bg-[#F9FAF9] hover:bg-emerald-50/70'}`}>
      {isSelected && <span className={`absolute bottom-0 left-0 top-0 w-1 ${isBomberos ? 'bg-[#c42348]' : 'bg-[#143601]'}`} />}
      <div className="mb-1.5 flex items-center justify-between gap-2"><span className="text-[11px] text-stone-600">{incident.horaFormateada} · Hace {elapsed}m</span><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pending ? 'border-red-200/70 bg-red-50 text-red-700' : incident.estado === 'ATENDIDO' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : incident.estado === 'FALSA_ALARMA' ? 'border-stone-200 bg-stone-100 text-stone-600' : 'border-amber-200/70 bg-amber-50 text-amber-700'}`}>{status}</span></div>
      <h3 className="truncate text-sm font-bold text-stone-900">{incident.titulo}</h3>
      <p className="mt-0.5 truncate text-xs text-stone-500">{incident.coordenadas.referencia}</p>
    </button>
  );
};
