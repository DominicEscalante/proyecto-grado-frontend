import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { AppLogo } from '../components/ui/index.js';
import { LogOut, PlusCircle, ShieldCheck, MapPin, Clock, AlertTriangle, FileText } from 'lucide-react';

export const CitizenDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[#0d2200] flex flex-col justify-between select-none">
      {/* Barra de Navegacion Superior */}
      <header className="relative z-10 w-full bg-[#143601]/90 border-b border-white/10 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppLogo size={38} showText={false} />
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-wider text-white">AMPAR</h1>
            <p className="text-[10px] text-white/60 uppercase tracking-wider">Panel Ciudadano · La Paz</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">{user?.name || `${user?.nombres} ${user?.apellidos}`}</p>
            <p className="text-[10px] text-white/60 font-mono">CI: {user?.ci} · {user?.email}</p>
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

      {/* Contenido Principal */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner de Bienvenida y Estado del Usuario */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#143601] to-[#1a4301] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Identidad Ciudadana Activa</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white pt-1">
                Bienvenido, {user?.nombres || user?.name}
              </h2>
              <p className="text-xs sm:text-sm text-white/70 max-w-xl">
                Sistema oficial de auxilio y respuesta rápida conectado con el Comando Departamental de la Policía y la Unidad de Bomberos Antofagasta.
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-1 text-[11px] text-white/70 font-mono">
                <MapPin className="w-3.5 h-3.5 text-white/60" />
                <span>Municipio Nuestra Señora de La Paz</span>
              </div>
              <span className="text-[10px] text-white/40 font-mono">
                Sesión segura iniciada con Better Auth
              </span>
            </div>
          </div>
        </div>

        {/* Tarjetas de Accion Inmediata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-[#1a4301]/80 border border-white/10 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-white/20 transition-all group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Nuevo Reporte</h3>
              <p className="text-xs text-white/60">
                Registra un incidente de tránsito, robo o incendio con coordenadas georreferenciadas.
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-full bg-white text-[#143601] text-xs font-bold hover:bg-slate-100 transition-colors shadow-md"
              >
                Crear Reporte (HU-04)
              </button>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#1a4301]/80 border border-white/10 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-white/20 transition-all group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Mis Reportes</h3>
              <p className="text-xs text-white/60">
                Visualiza el ticket correlativo y estado de despacho de las alertas que enviaste.
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-full bg-white/10 text-white text-xs font-medium border border-white/20 hover:bg-white/20 transition-colors"
              >
                Ver Historial (HU-07)
              </button>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#1a4301]/80 border border-white/10 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-white/20 transition-all group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Líneas de Auxilio</h3>
              <p className="text-xs text-white/60">
                Llamada directa de emergencia a Radio Patrullas 110 y Bomberos 119.
              </p>
            </div>
            <div className="pt-4">
              <div className="flex gap-2">
                <a
                  href="tel:110"
                  className="flex-1 text-center py-2 rounded-full bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition-colors font-mono"
                >
                  110 Policía
                </a>
                <a
                  href="tel:119"
                  className="flex-1 text-center py-2 rounded-full bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition-colors font-mono"
                >
                  119 Bomberos
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Datos y Alertas Recientes */}
        <div className="p-5 rounded-3xl bg-[#143601]/70 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-white/70" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Estado del Servicio
              </h3>
            </div>
            <span className="text-[10px] text-white/50 font-mono">
              PostgreSQL + PostGIS v16 Activo
            </span>
          </div>

          <div className="pt-4 text-xs text-white/70 space-y-2">
            <p>
              Cuenta autenticada como ciudadano. Tienes permisos para registrar incidentes georreferenciados en la jurisdicción del Municipio de La Paz.
            </p>
            <div className="p-3 rounded-2xl bg-black/20 border border-white/5 font-mono text-[11px] text-white/80 space-y-1">
              <p><span className="text-white/50">Identificador CI:</span> {user?.ci}</p>
              <p><span className="text-white/50">Celular Registrado:</span> +591 {user?.telefono}</p>
              <p><span className="text-white/50">Correo Electrónico:</span> {user?.email}</p>
              <p><span className="text-white/50">Estado de Identidad:</span> Verificada</p>
            </div>
          </div>
        </div>
      </main>

      {/* Pie de Pagina */}
      <footer className="relative z-10 w-full text-center py-4 text-[10px] text-white/40 uppercase tracking-wider font-medium">
        Gobierno Autónomo Municipal de La Paz · Plataforma AMPAR
      </footer>
    </div>
  );
};
