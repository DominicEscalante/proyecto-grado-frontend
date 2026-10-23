import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { AppLogo } from '../components/ui/index.js';
import {
  LogOut,
  Shield,
  Flame,
  Radio,
  Clock,
  CheckCircle2,
  AlertOctagon,
  UserCheck,
} from 'lucide-react';

export const OperatorDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'pendientes' | 'en_curso' | 'atendidos'>('pendientes');

  const isPolicia = user?.rol_id === 2 || user?.institucion === 'POLICIA';
  const institucionNombre = isPolicia ? 'Policía Boliviana' : 'Cuerpo de Bomberos';

  return (
    <div className="min-h-screen w-full bg-[#0d2200] flex flex-col justify-between select-none">
      {/* Cabecera Operativa */}
      <header className="relative z-10 w-full bg-[#143601]/95 border-b border-white/10 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <AppLogo size={36} showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-wider text-white">AMPAR</h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white text-[#143601]">
                Consola Operativa
              </span>
            </div>
            <p className="text-[10px] text-white/60 uppercase tracking-wider">
              {institucionNombre} · Despacho y Seguimiento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/20 border border-white/10 text-right">
            {isPolicia ? (
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div>
              <p className="text-xs font-semibold text-white leading-tight">
                {user?.rango ? `${user.rango} ` : ''}{user?.name || `${user?.nombres} ${user?.apellidos}`}
              </p>
              <p className="text-[10px] text-white/60 font-mono">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 transition-colors focus:outline-none"
            title="Cerrar Sesion"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Contenido de la Consola */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Barra de Estado Operativo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-3xl bg-[#143601]/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-white/60 font-medium">Estado Central</span>
              <p className="text-base font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                En Línea
              </p>
            </div>
            <Radio className="w-6 h-6 text-white/30" />
          </div>

          <div className="p-4 rounded-3xl bg-[#143601]/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-white/60 font-medium">Incidentes Activos</span>
              <p className="text-base font-bold text-white font-mono">0 Pendientes</p>
            </div>
            <AlertOctagon className="w-6 h-6 text-white/30" />
          </div>

          <div className="p-4 rounded-3xl bg-[#143601]/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-white/60 font-medium">Unidades Móviles</span>
              <p className="text-base font-bold text-white font-mono">Disponibles</p>
            </div>
            <Clock className="w-6 h-6 text-white/30" />
          </div>

          <div className="p-4 rounded-3xl bg-[#143601]/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-white/60 font-medium">Operador Activo</span>
              <p className="text-xs font-bold text-white font-mono">CI: {user?.ci}</p>
            </div>
            <UserCheck className="w-6 h-6 text-white/30" />
          </div>
        </div>

        {/* Bandeja de Despacho de Incidentes (HU-09 / HU-10) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#143601]/90 border border-white/10 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Bandeja de Incidentes Georreferenciados</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                  La Paz
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Monitoreo espacial de incidentes reportados por la ciudadanía en tiempo real.
              </p>
            </div>

            {/* Pestañas de Filtro */}
            <div className="flex p-1 rounded-full bg-black/30 border border-white/10 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('pendientes')}
                className={`px-3.5 py-1.5 rounded-full transition-colors ${
                  activeTab === 'pendientes'
                    ? 'bg-white text-[#143601] font-bold shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Pendientes (0)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en_curso')}
                className={`px-3.5 py-1.5 rounded-full transition-colors ${
                  activeTab === 'en_curso'
                    ? 'bg-white text-[#143601] font-bold shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                En Despacho (0)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('atendidos')}
                className={`px-3.5 py-1.5 rounded-full transition-colors ${
                  activeTab === 'atendidos'
                    ? 'bg-white text-[#143601] font-bold shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Historial
              </button>
            </div>
          </div>

          {/* Estado de Espera / Bandeja vacia */}
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <CheckCircle2 className="w-7 h-7 text-white/60" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">
                No hay incidentes pendientes de asignación
              </h3>
              <p className="text-xs text-white/50 max-w-md">
                La consola se encuentra a la escucha de nuevas alertas reportadas por los ciudadanos para la jurisdicción de {institucionNombre}.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Pie de Pagina */}
      <footer className="relative z-10 w-full text-center py-4 text-[10px] text-white/40 uppercase tracking-wider font-medium">
        Centro de Comando y Control · Plataforma AMPAR La Paz
      </footer>
    </div>
  );
};
