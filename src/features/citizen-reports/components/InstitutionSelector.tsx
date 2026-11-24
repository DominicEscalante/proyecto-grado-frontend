import { ShieldCheckIcon, FireIcon } from '@heroicons/react/24/outline';
import type { InstitucionDestino } from '../types/citizen-reports.types.js';

const institutions = [
  { id: 'POLICIA', name: 'Policía', Icon: ShieldCheckIcon, tone: 'border-emerald-800 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-800' },
  { id: 'BOMBEROS', name: 'Bomberos', Icon: FireIcon, tone: 'border-red-700 bg-red-50/70 text-red-950 ring-1 ring-red-700' },
] as const;

interface InstitutionSelectorProps {
  selected: InstitucionDestino;
  onSelect: (inst: InstitucionDestino) => void;
  disabled?: boolean;
}

export const InstitutionSelector = ({ selected, onSelect, disabled = false }: InstitutionSelectorProps) => (
  <fieldset className="min-w-0">
    <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Institución</legend>
    <div className="grid grid-cols-2 gap-2">
      {institutions.map(({ id, name, Icon, tone }) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          aria-pressed={selected === id}
          onClick={() => onSelect(id)}
          className={`flex h-11 items-center gap-2 rounded-md border px-2.5 text-left text-sm font-semibold disabled:opacity-60 ${selected === id ? tone : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span>{name}</span>
        </button>
      ))}
    </div>
  </fieldset>
);
