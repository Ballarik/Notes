import React, { useState } from 'react';
import { TrendingUp, Filter } from 'lucide-react';

const MONTHS = [
  { num: 9, name: "Set" },
  { num: 10, name: "Ott" },
  { num: 11, name: "Nov" },
  { num: 12, name: "Dic" },
  { num: 1, name: "Gen" },
  { num: 2, name: "Feb" },
  { num: 3, name: "Mar" },
  { num: 4, name: "Apr" },
  { num: 5, name: "Mag" },
  { num: 6, name: "Giu" },
];

const SUBJECT_COLORS = {
  "Chimica e biologia": "#10b981",
  "Disegno e storia dell'arte": "#f59e0b",
  "Educazione civica": "#3b82f6",
  "Educazione fisica": "#8b5cf6",
  "Filosofia": "#ec4899",
  "Fisica": "#6366f1",
  "Informatica": "#06b6d4",
  "Inglese": "#14b8a6",
  "Italiano": "#ef4444",
  "Matematica": "#f97316",
  "Storia": "#84cc16",
  "Tedesco": "#a855f7"
};

export const GradesChart = ({ grades, subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState('tutte');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const filteredGrades = grades.filter(g => {
    return selectedSubject === 'tutte' || g.subject === selectedSubject;
  });

  // Full-width wide dimensions for viewBox
  const svgWidth = 1100;
  const svgHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 40;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getXCoord = (monthNum) => {
    const monthIndex = MONTHS.findIndex(m => m.num === Number(monthNum));
    const idx = monthIndex !== -1 ? monthIndex : 0;
    return paddingLeft + (idx / (MONTHS.length - 1)) * chartWidth;
  };

  const getYCoord = (gradeVal) => {
    const val = Math.max(1, Math.min(10, Number(gradeVal)));
    return paddingTop + chartHeight - ((val - 1) / 9) * chartHeight;
  };

  const gradesGroupedBySubject = filteredGrades.reduce((acc, g) => {
    if (!acc[g.subject]) acc[g.subject] = [];
    acc[g.subject].push(g);
    return acc;
  }, {});

  return (
    <div className="w-full notion-card p-4 space-y-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5 w-full">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
            Andamento Voti nel Tempo (Settembre — Giugno)
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs p-1 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="tutte">Tutte le Materie</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {grades.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 space-y-1 w-full">
          <div className="font-semibold text-neutral-500">Nessun voto presente per il grafico</div>
          <div>Inserisci i primi voti nella tabella sottostante per tracciare la curva di andamento temporale!</div>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            className="w-full h-auto min-h-[200px] font-sans select-none"
          >
            {/* Horizontal Grid lines for Y-axis grades 2, 4, 6 (sufficienza), 8, 10 */}
            {[2, 4, 6, 8, 10].map(yVal => {
              const yPos = getYCoord(yVal);
              const isSufficiency = yVal === 6;
              return (
                <g key={yVal}>
                  <line
                    x1={paddingLeft}
                    y1={yPos}
                    x2={svgWidth - paddingRight}
                    y2={yPos}
                    stroke={isSufficiency ? '#10b981' : '#e5e7eb'}
                    strokeDasharray={isSufficiency ? '4,4' : '2,2'}
                    strokeWidth={isSufficiency ? 1.5 : 1}
                    className={isSufficiency ? 'dark:stroke-emerald-900/60' : 'dark:stroke-neutral-800'}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={yPos + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill={isSufficiency ? '#10b981' : '#9ca3af'}
                    fontWeight={isSufficiency ? 'bold' : 'normal'}
                  >
                    {yVal}
                  </text>
                </g>
              );
            })}

            {/* Vertical Month Ticks */}
            {MONTHS.map(m => {
              const xPos = getXCoord(m.num);
              return (
                <g key={m.num}>
                  <line
                    x1={xPos}
                    y1={paddingTop}
                    x2={xPos}
                    y2={paddingTop + chartHeight}
                    stroke="#f3f4f6"
                    strokeDasharray="2,2"
                    className="dark:stroke-neutral-800/40"
                  />
                  <text
                    x={xPos}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                    className="dark:fill-neutral-400 font-medium"
                  >
                    {m.name}
                  </text>
                </g>
              );
            })}

            {/* Trend lines per subject */}
            {Object.entries(gradesGroupedBySubject).map(([subjectName, subjGrades]) => {
              if (subjGrades.length < 2) return null;
              const color = SUBJECT_COLORS[subjectName] || '#8b5cf6';
              const pointsStr = subjGrades
                .map(g => `${getXCoord(g.monthNum || 9)},${getYCoord(g.grade)}`)
                .join(' ');

              return (
                <polyline
                  key={subjectName}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsStr}
                  opacity="0.85"
                />
              );
            })}

            {/* Data Points */}
            {filteredGrades.map((g) => {
              const cx = getXCoord(g.monthNum || 9);
              const cy = getYCoord(g.grade);
              const color = SUBJECT_COLORS[g.subject] || '#8b5cf6';
              const isHovered = hoveredPoint && hoveredPoint.id === g.id;

              return (
                <g key={g.id} className="cursor-pointer">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 7 : 4.5}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(g)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div 
              className="absolute pointer-events-none bg-neutral-900 text-white text-[11px] p-2 rounded shadow-lg z-30 space-y-0.5 border border-neutral-700"
              style={{
                left: `${(getXCoord(hoveredPoint.monthNum || 9) / svgWidth) * 100}%`,
                top: `${(getYCoord(hoveredPoint.grade) / svgHeight) * 100 - 15}%`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="font-bold flex items-center gap-1.5">
                <span 
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: SUBJECT_COLORS[hoveredPoint.subject] || '#8b5cf6' }}
                />
                <span>{hoveredPoint.subject}</span>
              </div>
              <div>Voto: <span className="font-bold text-amber-300">{hoveredPoint.grade}</span> ({hoveredPoint.monthName})</div>
              {hoveredPoint.notes && <div className="text-[10px] text-neutral-300 italic">{hoveredPoint.notes}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
