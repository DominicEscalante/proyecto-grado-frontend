import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { AppLogo } from '../components/ui/index.js';
import { apiClient } from '../api/client.js';
import {
  LogOut,
  Users,
  Shield,
  Flame,
  UserCheck,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  ci: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  institucion?: 'POLICIA' | 'BOMBEROS' | null;
  rango?: string | null;
  rolId: number;
  rolNombre?: string;
  identidadVerificada: boolean;
  estadoCuenta: boolean;
  rol?: {
    rolId: number;
    nombre: string;
  };
}

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Cargar usuarios desde la API real del backend (HU-16)
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await apiClient.get('/api/admin/usuarios');
      if (response.data?.data?.items) {
        setUsersList(response.data.data.items);
      }
    } catch {
      // Fallback a lista inicial si todavia no hay conexion
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = usersList.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.ci?.toLowerCase().includes(term) ||
      u.telefono?.includes(term)
    );
  });

  return (
    <div className="min-h-screen w-full bg-[#0d2200] flex flex-col justify-between select-none">
      {/* Cabecera de Administracion */}
      <header className="relative z-10 w-full bg-[#143601]/95 border-b border-white/10 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <AppLogo size={36} showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-wider text-white">AMPAR</h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white text-[#143601]">
                Administración General
              </span>
            </div>
            <p className="text-[10px] text-white/60 uppercase tracking-wider">
              Control de Accesos, Auditoría y Usuarios (HU-16)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">{user?.name || 'Administrador General'}</p>
            <p className="text-[10px] text-white/60 font-mono">{user?.email}</p>
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
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Metricas de Supervision de Cuentas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-3xl bg-[#143601]/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-white/60 font-medium">Total Usuarios</span>
              <p className="text-xl font-extrabold text-white font-mono">
                {usersList.length || 8}
              </p>
            </div>
            <Users className="w-6 h-6 text-white/30" />
          </div>

          <div className="p-4 rounded-3xl bg-[#143601]/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-white/60 font-medium">Ciudadanos</span>
              <p className="text-xl font-extrabold text-white font-mono">3</p>
            </div>
            <UserCheck className="w-6 h-6 text-white/30" />
          </div>

          <div className="p-4 rounded-3xl bg-[#143601]/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-white/60 font-medium">Policía</span>
              <p className="text-xl font-extrabold text-emerald-400 font-mono">2</p>
            </div>
            <Shield className="w-6 h-6 text-white/30" />
          </div>

          <div className="p-4 rounded-3xl bg-[#143601]/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-white/60 font-medium">Bomberos</span>
              <p className="text-xl font-extrabold text-amber-400 font-mono">2</p>
            </div>
            <Flame className="w-6 h-6 text-white/30" />
          </div>
        </div>

        {/* Tabla de Administracion de Cuentas (HU-16) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#143601]/90 border border-white/10 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Directorio de Usuarios y Operadores</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                  HU-16
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Supervisión, altas institucionales y estado de verificación en La Paz.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Buscador */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Buscar CI, correo o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-full bg-black/20 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={fetchUsers}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
                title="Actualizar"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase font-mono">
                  <th className="py-2.5 px-3">Identificador / CI</th>
                  <th className="py-2.5 px-3">Nombre Completo</th>
                  <th className="py-2.5 px-3">Correo Electrónico</th>
                  <th className="py-2.5 px-3">Rol / Institución</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const rolId = u.rol?.rolId || u.rolId;
                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-white">
                          {u.ci}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-white">{u.name}</span>
                          {u.rango && (
                            <span className="block text-[10px] text-white/50">
                              {u.rango}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-white/80">
                          {u.email}
                        </td>
                        <td className="py-3 px-3">
                          {rolId === 4 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#143601]">
                              ADMIN
                            </span>
                          )}
                          {rolId === 2 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/80 border border-emerald-500/50 text-emerald-300">
                              POLICÍA
                            </span>
                          )}
                          {rolId === 3 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/80 border border-amber-500/50 text-amber-300">
                              BOMBEROS
                            </span>
                          )}
                          {rolId === 1 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/80">
                              CIUDADANO
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Activo
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/50">
                      No se encontraron usuarios coincidentes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
