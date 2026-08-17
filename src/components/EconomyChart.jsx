import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

export const EconomyChart = ({ transactions, initialBaseBalance = 840.00 }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Generate 90 days array ending today
  const generate90DaysData = () => {
    const data = [];
    const today = new Date();
    const BASE_BALANCE = initialBaseBalance;
    
    // Sort real transactions chronologically
    const realTx = transactions.filter(t => t.description !== 'Saldo Iniziale');
    const sortedTx = [...realTx].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate initial balance before 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 89);
    ninetyDaysAgo.setHours(0, 0, 0, 0);

    let runningBalance = BASE_BALANCE + sortedTx
      .filter(t => new Date(t.date) < ninetyDaysAgo)
      .reduce((acc, t) => acc + (t.type === 'entrata' ? Number(t.amount) : -Number(t.amount)), 0);

    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];

      // Find transactions for this specific day
      const dayTx = sortedTx.filter(t => t.date === isoDate);
      const dailyEntrate = dayTx.filter(t => t.type === 'entrata').reduce((acc, t) => acc + Number(t.amount), 0);
      const dailyUscite = dayTx.filter(t => t.type === 'uscita').reduce((acc, t) => acc + Number(t.amount), 0);
      const netDaily = dailyEntrate - dailyUscite;

      runningBalance += netDaily;

      data.push({
        date: isoDate,
        dateObj: d,
        formattedDate: d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
        dailyEntrate,
        dailyUscite,
        netDaily,
        runningBalance,
        txCount: dayTx.length
      });
    }

    return data;
  };

  const chartData = generate90DaysData();

  // Find min and max balance for Y-axis scaling
  const balances = chartData.map(d => d.runningBalance);
  const minBal = Math.min(0, ...balances);
  const maxBal = Math.max(100, ...balances);
  const range = (maxBal - minBal) || 100;

  // SVG Dimensions
  const svgWidth = 800;
  const svgHeight = 200;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  const getYCoord = (val) => {
    const normalized = (val - minBal) / range;
    return svgHeight - paddingBottom - (normalized * chartInnerHeight);
  };

  const getXCoord = (index) => {
    return paddingLeft + (index / (chartData.length - 1)) * chartInnerWidth;
  };

  // Filter X-axis tick labels (every 15 days)
  const tickIndices = [0, 15, 30, 45, 60, 75, 89];

  return (
    <div className="notion-card p-4 space-y-3 w-full bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
            Andamento Finanziario (Ultimi 90 Giorni)
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
            <span>Salita / Orizzontale (Verde)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-500 inline-block" />
            <span>Discesa (Rosso)</span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          {/* Grid lines (Y-axis ticks) */}
          {[minBal, (minBal + maxBal) / 2, maxBal].map((val, idx) => {
            const yPos = getYCoord(val);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={svgWidth - paddingRight}
                  y2={yPos}
                  stroke="#e5e7eb"
                  strokeDasharray="3,3"
                  strokeWidth="1"
                  className="dark:stroke-neutral-800"
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] fill-neutral-400 font-mono font-semibold"
                >
                  €{Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Dynamic Color Segmented Line (Thinner 1.5px stroke) */}
          {chartData.map((curr, idx) => {
            if (idx === 0) return null;
            const prev = chartData[idx - 1];

            const x1 = getXCoord(idx - 1);
            const y1 = getYCoord(prev.runningBalance);
            const x2 = getXCoord(idx);
            const y2 = getYCoord(curr.runningBalance);

            // Rule:
            // If going down (curr.runningBalance < prev.runningBalance) -> RED (#ef4444)
            // If going up or horizontal (curr.runningBalance >= prev.runningBalance) -> GREEN (#10b981)
            const isDiscesa = curr.runningBalance < prev.runningBalance;
            const strokeColor = isDiscesa ? '#ef4444' : '#10b981';

            return (
              <line
                key={curr.date}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Interactive Hover Dots & Touch Targets */}
          {chartData.map((d, idx) => {
            const cx = getXCoord(idx);
            const cy = getYCoord(d.runningBalance);

            return (
              <g 
                key={d.date}
                onMouseEnter={() => setHoveredPoint({ ...d, cx, cy })}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Invisible hover zone */}
                <rect
                  x={cx - (chartInnerWidth / 90) / 2}
                  y={paddingTop}
                  width={chartInnerWidth / 90}
                  height={chartInnerHeight}
                  fill="transparent"
                />

                {/* Small indicator dot on hover or transaction day */}
                {(hoveredPoint?.date === d.date || d.txCount > 0) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={hoveredPoint?.date === d.date ? "4" : "2.5"}
                    className={d.netDaily < 0 ? 'fill-red-500 stroke-white dark:stroke-[#202020]' : 'fill-emerald-500 stroke-white dark:stroke-[#202020]'}
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* X-Axis Month/Date Ticks */}
          {tickIndices.map(idx => {
            const item = chartData[idx];
            if (!item) return null;
            const xPos = getXCoord(idx);

            return (
              <g key={item.date}>
                <line
                  x1={xPos}
                  y1={svgHeight - paddingBottom}
                  x2={xPos}
                  y2={svgHeight - paddingBottom + 4}
                  stroke="#9ca3af"
                  strokeWidth="1"
                />
                <text
                  x={xPos}
                  y={svgHeight - paddingBottom + 16}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-400 font-semibold"
                >
                  {item.formattedDate}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="absolute z-20 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs p-2.5 rounded-lg shadow-xl pointer-events-none space-y-1 transform -translate-x-1/2 -translate-y-full mb-2 font-sans min-w-[140px]"
            style={{
              left: `${(hoveredPoint.cx / svgWidth) * 100}%`,
              top: `${(hoveredPoint.cy / svgHeight) * 100}%`
            }}
          >
            <div className="font-bold border-b border-neutral-700 dark:border-neutral-200 pb-1 flex items-center justify-between text-[11px]">
              <span>{hoveredPoint.formattedDate} ({hoveredPoint.date})</span>
            </div>

            <div className="space-y-0.5 text-[11px] pt-0.5">
              {hoveredPoint.dailyEntrate > 0 && (
                <div className="flex items-center justify-between gap-3 text-emerald-400 dark:text-emerald-600 font-semibold">
                  <span>Entrate:</span>
                  <span>+€{hoveredPoint.dailyEntrate.toFixed(2)}</span>
                </div>
              )}
              {hoveredPoint.dailyUscite > 0 && (
                <div className="flex items-center justify-between gap-3 text-red-400 dark:text-red-600 font-semibold">
                  <span>Uscite:</span>
                  <span>-€{hoveredPoint.dailyUscite.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 font-bold border-t border-neutral-800 dark:border-neutral-200 pt-1 text-white dark:text-neutral-900">
                <span>Saldo Cassa:</span>
                <span className="font-mono">€{hoveredPoint.runningBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
