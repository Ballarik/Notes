import React, { useState } from 'react';
import { Wallet, Package, PieChart as PieIcon, Coins } from 'lucide-react';

export const PatrimonioPieChart = ({ saldoTotale = 0, assets = [] }) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const safeCash = Math.max(0, saldoTotale);
  const totalAssetsValue = assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const totalPatrimonio = safeCash + totalAssetsValue;

  const PALETTE = [
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#84cc16', // Lime
    '#a855f7', // Violet
  ];

  // Build slices data
  const slices = [];

  // 1. Cash slice
  if (safeCash > 0) {
    const pct = totalPatrimonio > 0 ? (safeCash / totalPatrimonio) * 100 : 0;
    slices.push({
      id: 'cash',
      label: 'Denaro (Liquidità)',
      value: safeCash,
      percentage: pct,
      color: '#10b981', // Emerald
      icon: 'wallet',
      isCash: true
    });
  }

  // 2. Asset slices
  assets.forEach((a, index) => {
    const val = Number(a.value) || 0;
    if (val > 0) {
      const pct = totalPatrimonio > 0 ? (val / totalPatrimonio) * 100 : 0;
      slices.push({
        id: a.id,
        label: a.name,
        description: a.description,
        value: val,
        percentage: pct,
        color: PALETTE[index % PALETTE.length],
        icon: 'package',
        isCash: false
      });
    }
  });

  // Calculate SVG arc paths
  const size = 200;
  const center = size / 2;
  const radius = 85;
  const innerRadius = 55;

  let accumulatedAngle = 0;
  const computedSlices = slices.map((slice) => {
    const sliceAngle = totalPatrimonio > 0 ? (slice.value / totalPatrimonio) * 360 : 0;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + sliceAngle;
    accumulatedAngle += sliceAngle;

    // Convert polar coordinates to Cartesian
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const ix1 = center + innerRadius * Math.cos(endRad);
    const iy1 = center + innerRadius * Math.sin(endRad);
    const ix2 = center + innerRadius * Math.cos(startRad);
    const iy2 = center + innerRadius * Math.sin(startRad);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    let pathData = '';
    if (slices.length === 1 || sliceAngle >= 359.99) {
      // Full circle donut
      pathData = `
        M ${center} ${center - radius}
        A ${radius} ${radius} 0 1 0 ${center} ${center + radius}
        A ${radius} ${radius} 0 1 0 ${center} ${center - radius}
        M ${center} ${center - innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 1 ${center} ${center + innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 1 ${center} ${center - innerRadius}
        Z
      `;
    } else {
      pathData = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${ix1} ${iy1}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}
        Z
      `;
    }

    return {
      ...slice,
      pathData,
      startAngle,
      endAngle
    };
  });

  const activeInfo = hoveredSlice !== null ? computedSlices[hoveredSlice] : null;

  return (
    <div className="notion-card p-5 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Distribuzione Patrimonio (Denaro vs Oggetti)
          </h3>
        </div>
        <span className="text-[11px] font-mono font-semibold text-neutral-500">
          Totale: € {totalPatrimonio.toFixed(2)}
        </span>
      </div>

      {totalPatrimonio === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 italic">
          Nessun dato disponibile per il grafico. Inserisci del saldo o aggiungi oggetti di valore.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart SVG */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg 
                viewBox={`0 0 ${size} ${size}`} 
                className="w-full h-full transform transition-transform duration-300"
              >
                {computedSlices.map((slice, index) => {
                  const isHovered = hoveredSlice === index;
                  return (
                    <path
                      key={slice.id}
                      d={slice.pathData}
                      fill={slice.color}
                      className="transition-all duration-200 cursor-pointer hover:opacity-90"
                      style={{
                        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                        transformOrigin: `${center}px ${center}px`,
                        filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none'
                      }}
                      onMouseEnter={() => setHoveredSlice(index)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Info in Donut Hole */}
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4"
                style={{ width: `${innerRadius * 2}px`, height: `${innerRadius * 2}px`, margin: 'auto' }}
              >
                {activeInfo ? (
                  <>
                    <span className="text-[10px] font-semibold text-neutral-400 truncate max-w-[90px]">
                      {activeInfo.label}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-neutral-900 dark:text-white">
                      {activeInfo.percentage.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                      €{activeInfo.value.toFixed(0)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      Patrimonio
                    </span>
                    <span className="text-xs font-mono font-extrabold text-neutral-900 dark:text-white">
                      € {totalPatrimonio.toFixed(0)}
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      {slices.length} {slices.length === 1 ? 'voce' : 'voci'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Macro Breakdown Pills */}
            <div className="flex items-center gap-3 mt-3 text-[11px] font-medium">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Wallet className="w-3 h-3 text-emerald-500" />
                <span>Denaro: {totalPatrimonio > 0 ? ((safeCash / totalPatrimonio) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Package className="w-3 h-3 text-indigo-500" />
                <span>Oggetti: {totalPatrimonio > 0 ? ((totalAssetsValue / totalPatrimonio) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="md:col-span-7 space-y-1.5 max-h-60 overflow-y-auto pr-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Dettaglio Voci ({slices.length})
            </div>
            {computedSlices.map((slice, index) => {
              const isHovered = hoveredSlice === index;
              return (
                <div
                  key={slice.id}
                  onMouseEnter={() => setHoveredSlice(index)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-neutral-100/80 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 shadow-xs scale-[1.01]'
                      : 'bg-neutral-50/50 dark:bg-neutral-900/40 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: slice.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-neutral-800 dark:text-neutral-200 truncate flex items-center gap-1.5">
                        <span>{slice.label}</span>
                        {slice.isCash && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                            Liquidità
                          </span>
                        )}
                      </div>
                      {slice.description && (
                        <div className="text-[10px] text-neutral-400 truncate">
                          {slice.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      € {slice.value.toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {slice.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
