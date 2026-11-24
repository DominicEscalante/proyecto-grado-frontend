import { SignalIcon, ClipboardDocumentListIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import type { CitizenTab } from '../types/citizen-reports.types.js';

const tabs = [
  { id: 'reportar', label: 'Reportar', Icon: SignalIcon },
  { id: 'alertas', label: 'Alertas', Icon: ClipboardDocumentListIcon },
  { id: 'perfil', label: 'Perfil', Icon: UserCircleIcon },
] as const;

interface CitizenBottomNavProps {
  activeTab: CitizenTab;
  onTabChange: (tab: CitizenTab) => void;
  unreadAlertsCount?: number;
  inHeader?: boolean;
}

export const CitizenBottomNav = ({
  activeTab,
  onTabChange,
  unreadAlertsCount = 0,
  inHeader = false,
}: CitizenBottomNavProps) => (
  <nav
    aria-label="Navegación ciudadana"
    className={inHeader
      ? 'hidden h-full items-stretch gap-2 md:flex'
      : 'z-40 grid shrink-0 grid-cols-3 border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] md:hidden'}
  >
    {tabs.map(({ id, label, Icon }) => (
      <button
        key={id}
        type="button"
        aria-current={activeTab === id ? 'page' : undefined}
        onClick={() => onTabChange(id)}
        className={inHeader
          ? `border-b-2 px-4 text-sm font-medium hover:bg-white/10 ${activeTab === id ? 'border-emerald-300 text-white' : 'border-transparent text-emerald-100/80'}`
          : `flex h-14 flex-col items-center justify-center gap-1 border-t-2 text-xs font-semibold ${activeTab === id ? 'border-emerald-800 bg-emerald-50 text-emerald-950' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
      >
        {!inHeader && <Icon aria-hidden="true" className="h-5 w-5" />}
        <span>{label}</span>
        {id === 'alertas' && unreadAlertsCount > 0 && <span className="sr-only"> ({unreadAlertsCount} sin leer)</span>}
      </button>
    ))}
  </nav>
);
