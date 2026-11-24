import { MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import type { GpsLocationState } from '../types/citizen-reports.types.js';

interface CitizenGpsCardProps {
  gps: GpsLocationState & { sincronizarGps: () => void };
}

export const CitizenGpsCard = ({ gps }: CitizenGpsCardProps) => (
  <section aria-labelledby="report-gps-title" className="space-y-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm lg:p-4">
    <h2 id="report-gps-title" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
      <MapPinIcon aria-hidden="true" className="h-4 w-4 text-emerald-900" />
      Ubicación GPS
    </h2>
    <div role="status" className="space-y-1">
      <p className={`text-sm font-medium ${gps.status === 'synchronized' ? 'text-emerald-800' : 'text-slate-700'}`}>
        {gps.status === 'synchronized'
          ? gps.isSimulated ? 'Ubicación simulada' : 'Ubicación sincronizada'
          : gps.status === 'obtaining' ? 'Obteniendo ubicación…' : 'Ubicación no disponible'}
      </p>
      {gps.errorMessage && <p className="text-sm text-slate-600">{gps.errorMessage}</p>}
    </div>
    {gps.coords && (
      <dl className="grid grid-cols-2 gap-1.5 rounded-md border border-slate-200 bg-slate-50 p-2 text-xs lg:grid-cols-3">
        <div>
          <dt className="text-slate-600">Latitud</dt>
          <dd className="break-all font-mono tabular-nums text-slate-900">{gps.coords.latitud.toFixed(6)}</dd>
        </div>
        <div>
          <dt className="text-slate-600">Longitud</dt>
          <dd className="break-all font-mono tabular-nums text-slate-900">{gps.coords.longitud.toFixed(6)}</dd>
        </div>
        <div className="col-span-2 flex items-center justify-between gap-2 border-t border-slate-200 pt-1.5 lg:col-span-1 lg:block lg:border-0 lg:pt-0">
          <dt className="text-slate-600">Precisión</dt>
          <dd className="font-medium tabular-nums text-slate-900">±{gps.coords.precisionMetros} m</dd>
        </div>
      </dl>
    )}
    <button type="button" onClick={gps.sincronizarGps} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
      <ArrowPathIcon aria-hidden="true" className="h-4 w-4" />
      Actualizar ubicación
    </button>
  </section>
);

