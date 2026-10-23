import { AdminUserItem } from '../types/admin-users.types.js';

/**
 * Obtiene las 2 iniciales en mayusculas para el avatar del usuario.
 * Ignora prefijos comunes como 'Sgto.', 'Tte.', 'Cabo', 'Admin'.
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') return 'US';
  
  const clean = name
    .replace(/^(sgto|tte|cabo|pol|bom|admin|dr|lic)\.?\s+/i, '')
    .trim();

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Formatea una fecha ISO a texto legible en español.
 */
export function formatDate(dateString?: string | Date): string {
  if (!dateString) return 'Sin fecha';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateString);
  }
}

/**
 * Genera y descarga un archivo CSV con la lista de usuarios.
 */
export function exportUsersToCsv(users: AdminUserItem[]): void {
  const headers = [
    'ID Sistema',
    'Documento / CI',
    'Nombres',
    'Apellidos',
    'Nombre Completo',
    'Correo Electrónico',
    'Celular',
    'Rol',
    'Institución',
    'Rango',
    'Estado Cuenta',
    'Identidad Verificada',
    'Fecha Creación',
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = users.map((u) => [
    escapeCsv(u.id),
    escapeCsv(u.ci + (u.complemento ? `-${u.complemento}` : '')),
    escapeCsv(u.nombres),
    escapeCsv(u.apellidos),
    escapeCsv(u.name),
    escapeCsv(u.email),
    escapeCsv(u.telefono),
    escapeCsv(u.rol?.nombre || `Rol ${u.rol?.rolId}`),
    escapeCsv(u.institucion || 'N/A'),
    escapeCsv(u.rango || 'N/A'),
    escapeCsv(u.estadoCuenta ? 'Activo' : 'Suspendido'),
    escapeCsv(u.identidadVerificada ? 'Verificada' : 'Pendiente'),
    escapeCsv(formatDate(u.createdAt)),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const now = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `ampar_usuarios_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
