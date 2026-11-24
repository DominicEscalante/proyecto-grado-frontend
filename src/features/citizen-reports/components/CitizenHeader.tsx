import { AppLogo } from '../../../components/ui/AppLogo.js';
import { MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import type { CitizenTab, GpsLocationState } from '../types/citizen-reports.types.js';
import { CitizenBottomNav } from './CitizenBottomNav.js';

interface CitizenHeaderProps {
  gps: GpsLocationState & { sincronizarGps: () => void };
  activeTab: CitizenTab;
  onTabChange: (tab: CitizenTab) => void;
}

export const CitizenHeader = ({ gps, activeTab, onTabChange }: CitizenHeaderProps) => {
  const isSync = gps.status === 'synchronized' && gps.coords;
  const statusLabel = gps.status === 'obtaining'
    ? 'Ubicando…'
    : isSync ? 'GPS sincronizado' : 'Sin GPS';

  return (
    <header className="z-30 shrink-0 border-b border-white/10 bg-[#0F291E] text-white">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-3 md:grid md:h-14 md:px-6 md:grid-cols-[1fr_auto_1fr]">
        <button type="button" onClick={() => onTabChange('reportar')} className="flex w-fit items-center gap-2 rounded-md text-left">
          <AppLogo size={26} color="#ffffff" showText={false} />
          <span>
            <span className="block text-base font-semibold leading-tight">Ampar</span>
            <span className="block text-[11px] text-emerald-100/80">Sistema de Emergencias</span>
          </span>
        </button>

        <CitizenBottomNav activeTab={activeTab} onTabChange={onTabChange} inHeader />

        <button
          type="button"
          onClick={gps.sincronizarGps}
          aria-label={`Actualizar ubicación. ${statusLabel}`}
          className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium hover:bg-white/10 md:justify-self-end"
        >
          <MapPinIcon aria-hidden="true" className={`h-4 w-4 ${isSync ? 'text-emerald-300' : 'text-amber-200'}`} />
          <span>{statusLabel}</span>
          <ArrowPathIcon aria-hidden="true" className="h-3.5 w-3.5 text-emerald-100/80" />
        </button>
      </div>
    </header>
  );
};
