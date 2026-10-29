// Componente Header Superior Minimalista Blanco con Perfil Desplegable (Estilo Stripe / Notion)
// Disenado para navegacion dinamica multi-rol con acentos en la paleta global y estrictamente sin emojis.

import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { AppLogo } from '../ui/AppLogo.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu.js';
import {
  UsersIcon,
  MapIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export interface NavItemConfig {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: number[];
  tabKey?: string;
}

export interface AppHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

// Estructura extensible de rutas de navegacion multi-rol
const ALL_NAV_ITEMS: NavItemConfig[] = [
  // Rutas Administrador (Rol 4)
  {
    name: 'Directorio',
    href: '/admin/usuarios',
    icon: UsersIcon,
    roles: [4],
  },
  {
    name: 'Despacho en Vivo',
    href: '/operador/emergencias',
    icon: MapIcon,
    roles: [4],
  },
  {
    name: 'Incidentes',
    href: '/admin/incidentes',
    icon: ClipboardDocumentListIcon,
    roles: [4],
  },
  {
    name: 'Auditoría',
    href: '/admin/auditoria',
    icon: ShieldCheckIcon,
    roles: [4],
  },

  // Rutas Operador Policia / Bomberos (Roles 2 y 3)
  {
    name: 'Despacho en Vivo',
    href: '/operador/emergencias',
    icon: MapIcon,
    roles: [2, 3],
  },
  {
    name: 'Incidentes',
    href: '/operador/incidentes',
    icon: ClipboardDocumentListIcon,
    roles: [2, 3],
  },

  // Rutas Ciudadano (Rol 1)
  {
    name: 'Reportar Auxilio',
    href: '/ciudadano/reportes',
    icon: MapIcon,
    roles: [1],
    tabKey: 'reportar',
  },
  {
    name: 'Mis Alertas',
    href: '/ciudadano/reportes#alertas',
    icon: ClipboardDocumentListIcon,
    roles: [1],
    tabKey: 'alertas',
  },
  {
    name: 'Mi Perfil',
    href: '/ciudadano/reportes#perfil',
    icon: UserCircleIcon,
    roles: [1],
    tabKey: 'perfil',
  },
];

/**
 * Obtiene el titulo amigable del rol segun rol_id.
 */
function getRoleLabel(rolId?: number): string {
  switch (rolId) {
    case 4:
      return 'Administración General';
    case 2:
      return 'Despacho Policial';
    case 3:
      return 'Despacho Bomberos';
    case 1:
      return 'Portal Ciudadano';
    default:
      return 'Personal Autorizado';
  }
}

/**
 * Calcula las iniciales del usuario para el avatar circular.
 */
function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'US';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onTabChange,
  className = '',
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Rol efectivo (default: si estamos en /ciudadano/reportes asume rol 1 si no esta definido)
  const effectiveRoleId = useMemo(() => {
    if (user?.rol_id) return user.rol_id;
    if (location.pathname.startsWith('/ciudadano')) return 1;
    if (location.pathname.startsWith('/admin')) return 4;
    if (location.pathname.startsWith('/operador')) return 2;
    return 1;
  }, [user, location.pathname]);

  const roleLabel = useMemo(() => getRoleLabel(effectiveRoleId), [effectiveRoleId]);

  const userName = useMemo(() => {
    if (user?.name) return user.name;
    if (user?.nombres && user?.apellidos) return `${user.nombres} ${user.apellidos}`;
    if (user?.email) return user.email.split('@')[0];
    if (effectiveRoleId === 4) return 'Admin Sistema';
    if (effectiveRoleId === 1) return 'Ciudadano Ampar';
    return 'Operador de Despacho';
  }, [user, effectiveRoleId]);

  const userEmail = user?.email || (effectiveRoleId === 4 ? 'admin@admin.com' : 'ciudadano@ampar.bo');
  const initials = useMemo(() => getInitials(userName, userEmail), [userName, userEmail]);

  // Filtrar elementos de navegacion segun el rol del usuario autenticado
  const visibleNavItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => item.roles.includes(effectiveRoleId));
  }, [effectiveRoleId]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const isItemActive = (item: NavItemConfig) => {
    if (item.tabKey && activeTab) {
      return activeTab === item.tabKey;
    }
    return location.pathname === item.href;
  };

  const handleNavClick = (e: React.MouseEvent, item: NavItemConfig) => {
    if (item.tabKey && onTabChange) {
      e.preventDefault();
      onTabChange(item.tabKey);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full bg-[#143601] backdrop-blur-md border-b border-white/15 transition-colors ${className}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 1. Zona Izquierda: Marca + Contexto + Navegacion Dinamica */}
        <div className="flex items-center min-w-0">
          {/* Marca / Logo */}
          <Link
            to={effectiveRoleId === 4 ? '/admin/usuarios' : effectiveRoleId === 1 ? '/ciudadano/reportes' : '/operador/emergencias'}
            className="flex items-center gap-2.5 group select-none shrink-0"
            title="AMPAR - Inicio"
          >
            <AppLogo size={28} color="#ffffff" showText={false} />
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-100 transition-colors">
              AMPAR
            </span>
          </Link>

          {/* Divisor vertical sutil */}
          <div className="h-5 w-px bg-stone-200 mx-3 hidden sm:block shrink-0" />

          {/* Badge de Rol / Entorno */}
          <div className="hidden sm:block shrink-0">
            <span className="rounded-md px-2.5 py-1 text-xs font-semibold bg-white/10 text-white border border-white/20 font-sans tracking-tight">
              {roleLabel}
            </span>
          </div>

          {/* Navegacion Multi-Rol (Desktop) */}
          {visibleNavItems.length > 0 && (
            <nav
              aria-label="Navegación principal"
              className="hidden md:flex items-center gap-1 ml-6"
            >
              {visibleNavItems.map((item) => {
                const active = isItemActive(item);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-2xs'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 ${
                        active ? 'text-white stroke-[2.2]' : 'text-white/65 stroke-[1.8]'
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* 2. Zona Derecha: Utilidades + Dropdown de Perfil de Usuario */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Indicador discreto de estado operativo */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-white/90 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 select-none">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>En línea</span>
          </div>

          {/* Boton de Notificaciones */}
          <button
            type="button"
            className="p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer"
            title="Notificaciones del sistema"
            aria-label="Notificaciones"
          >
            <BellIcon className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-[#143601]" />
          </button>

          {/* Trigger y Menu Desplegable de Usuario (Dropdown) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-xl border border-transparent hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-white/20"
                aria-label="Menú de perfil de usuario"
              >
                {/* Avatar circular en verde institucional (#143601) con iniciales */}
                <div className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/25 shrink-0">
                  {initials}
                </div>

                {/* Nombre en una linea */}
                <span className="text-sm font-semibold text-white hidden sm:block truncate max-w-[150px]">
                  {userName}
                </span>

                {/* Icono Chevron */}
                <ChevronDownIcon className="w-4 h-4 text-white/75 shrink-0 stroke-[2]" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-64 rounded-xl bg-white shadow-lg border border-stone-200/90 py-1.5 z-50 p-0 overflow-hidden animate-fadeIn"
            >
              {/* Cabecera del Dropdown (No clicable) */}
              <div className="border-b border-stone-100 px-4 py-3 select-none">
                <p className="text-sm font-bold text-stone-900 leading-snug truncate">
                  {userName}
                </p>
                <p className="text-xs text-stone-500 truncate mt-0.5 font-mono">
                  {userEmail}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-[#143601] border border-emerald-200/70">
                    {roleLabel}
                  </span>
                </div>
              </div>

              {/* Cuerpo del Dropdown */}
              <div className="py-1">
                <DropdownMenuItem
                  onClick={() => {
                    if (onTabChange) {
                      onTabChange('perfil');
                    } else if (effectiveRoleId === 4) {
                      navigate('/admin/usuarios');
                    }
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 cursor-pointer font-medium transition-colors"
                >
                  <UserCircleIcon className="w-4 h-4 text-stone-500 shrink-0 stroke-[1.8]" />
                  <span>Mi Perfil y Credenciales</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    // Preferencias de vista
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 cursor-pointer font-medium transition-colors"
                >
                  <Cog6ToothIcon className="w-4 h-4 text-stone-500 shrink-0 stroke-[1.8]" />
                  <span>Preferencias de Vista</span>
                </DropdownMenuItem>
              </div>

              {/* Pie del Dropdown */}
              <DropdownMenuSeparator className="my-0 bg-stone-100" />
              <div className="pt-1 mt-1 px-1.5 pb-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-600 shrink-0 stroke-[1.8]" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Boton Hamburguesa para navegacion movil (md:hidden) */}
          {visibleNavItems.length > 0 && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 md:hidden transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              title="Menú de navegación"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5 stroke-[2]" />
              ) : (
                <Bars3Icon className="w-5 h-5 stroke-[2]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Menu Colapsable Movil (Mobile-First) */}
      {mobileMenuOpen && visibleNavItems.length > 0 && (
        <div className="md:hidden border-t border-stone-200/80 bg-white/95 backdrop-blur-md px-4 py-3 space-y-2 animate-fadeIn shadow-md">
          <nav aria-label="Navegación móvil" className="space-y-1">
            {visibleNavItems.map((item) => {
              const active = isItemActive(item);
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-50 text-[#143601] font-semibold border border-emerald-200/60'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <IconComponent
                    className={`w-4 h-4 ${
                      active ? 'text-[#143601] stroke-[2.2]' : 'text-stone-500 stroke-[1.8]'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>En línea</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-[#143601] border border-emerald-200/70">
              {roleLabel}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
