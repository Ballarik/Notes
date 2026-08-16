import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

export const TenDayEconomyChart = ({ transactions, initialBaseBalance = 840.00 }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Generate 10 days array ending today
  const generate10DaysData = () => {
    const data = [];
    const today = new Date();
    
    // Sort transactions chronologically
    const realTx = transactions.filter(t => t.description !== 'Saldo Iniziale');
    const sortedTx = [...realTx].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate initial balance before 10 days ago
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 9);
    tenDaysAgo.setHours(0, 0, 0, 0);

    let runningBalance = initialBaseBalance + sortedTx
      .filter(t => new Date(t.date) < tenDaysAgo)
      .reduce((acc, t) => acc + (t.type === 'entrata' ? Number(t.amount) : -Number(t.amount)), 0);

    for (let i = 9; i >= 0; i--) {
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

  const chartData = generate10DaysData();

  // Find min and max balance for Y-axis scaling
  const balances = chartData.map(d => d.runningBalance);
  const minBal = Math.min(0, ...balances);
  const maxBal = Math.max(100, ...balances);
  const range = (maxBal - minBal) || 100;

  // SVG Dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  const getYCoord = (val) => {
    const normalized = (val - minBal) / range;
    return svgHeight - paddingBottom - (normalized * chartInnerHeight);
  };

  const getXCoord = (index) => {
    return paddingLeft + (index / (chartData.length - 1)) * chartInnerWidth;
  };

  return (
    <div className="notion-card p-4 space-y-2 w-full bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl">
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
            Andamento Soldi (Ultimi 10 Giorni)
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
          Attuale: €{balances[balances.length - 1].toFixed(2)}
        </span>
      </div>

      {/* SVG Line Chart */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          {/* Grid lines */}
          {[minBal, maxBal].map((val, idx) => {
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
                  x={paddingLeft - 6}
                  y={yPos + 3}
                  textAnchor="end"
                  className="text-[9px] fill-neutral-400 font-mono font-semibold"
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

          {/* Points and Hover Zones */}
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
                <rect
                  x={cx - (chartInnerWidth / 10) / 2}
                  y={paddingTop}
                  width={chartInnerWidth / 10}
                  height={chartInnerHeight}
                  fill="transparent"
                />

                {(hoveredPoint?.date === d.date || d.txCount > 0) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="3"
                    className={d.netDaily < 0 ? 'fill-red-500 stroke-white dark:stroke-[#202020]' : 'fill-emerald-500 stroke-white dark:stroke-[#202020]'}
                    strokeWidth="1.5"
                  />
                )}

                {/* X Axis Label */}
                <text
                  x={cx}
                  y={svgHeight - paddingBottom + 14}
                  textAnchor="middle"
                  className="text-[9px] fill-neutral-400 font-semibold"
                >
                  {d.formattedDate}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="absolute z-20 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[11px] p-2 rounded-lg shadow-xl pointer-events-none space-y-0.5 transform -translate-x-1/2 -translate-y-full mb-2 min-w-[120px]"
            style={{
              left: `${(hoveredPoint.cx / svgWidth) * 100}%`,
              top: `${(hoveredPoint.cy / svgHeight) * 100}%`
            }}
          >
            <div className="font-bold border-b border-neutral-700 dark:border-neutral-200 pb-0.5 text-[10px]">
              {hoveredPoint.formattedDate}
            </div>
            <div className="flex items-center justify-between gap-2 font-mono font-bold pt-0.5">
              <span>Saldo:</span>
              <span>€{hoveredPoint.runningBalance.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
