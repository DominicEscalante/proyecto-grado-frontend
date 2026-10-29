import React from 'react';

export const MapLegend: React.FC = () => <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-4 rounded-lg border border-stone-200 bg-white/95 px-3 py-2 text-xs text-stone-700 shadow-sm backdrop-blur-sm">
  <span className="font-semibold">Zonas de Calor (24h)</span>
  <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-red-500/80" />Alta</span>
  <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />Media</span>
</div>;
