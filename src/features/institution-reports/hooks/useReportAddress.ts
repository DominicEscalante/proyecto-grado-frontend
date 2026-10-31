import { useEffect, useState } from 'react';
import { apiClient } from '../../../api/client.js';

export function useReportAddress(ticket: string | undefined, referencia: string | undefined) {
  const [resolved, setResolved] = useState<{ ticket: string; direccion: string } | null>(null);
  const needsLookup = referencia?.startsWith('Coordenadas GPS sincronizadas (') || referencia === 'Dirección no disponible';

  useEffect(() => {
    if (!ticket || !needsLookup) return;
    let active = true;
    apiClient.get<{ data: { direccion: string } }>(`/api/operador/reportes/${encodeURIComponent(ticket)}/direccion`)
      .then((response) => { if (active) setResolved({ ticket, direccion: response.data.data.direccion }); })
      .catch(() => { if (active) setResolved({ ticket, direccion: 'Dirección no disponible' }); });
    return () => { active = false; };
  }, [ticket, needsLookup]);

  if (needsLookup) return resolved?.ticket === ticket ? resolved?.direccion : 'Buscando dirección...';
  return referencia || 'Dirección no disponible';
}
