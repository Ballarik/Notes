import React from 'react';
import { X, PieChart as PieIcon } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

const PIE_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899',
  '#06b6d4', '#6366f1', '#14b8a6', '#ef4444', '#84cc16'
];

export const EconomyPieChartsModal = ({ isOpen, onClose, transactions, categories }) => {
  const { isSidebarOpen } = useWorkspace();

  if (!isOpen) return null;

  // Compute category breakdown for entrate and uscite
  const getCategoryBreakdown = (type) => {
    const typeTx = transactions.filter(t => t.type === type);
    const totalTypeAmount = typeTx.reduce((acc, t) => acc + Number(t.amount), 0);

    const breakdown = categories.map((cat, idx) => {
      const catAmount = typeTx
        .filter(t => t.category === cat)
        .reduce((acc, t) => acc + Number(t.amount), 0);

      const percentage = totalTypeAmount > 0 ? (catAmount / totalTypeAmount) * 100 : 0;

      return {
        category: cat,
        amount: catAmount,
        percentage,
        color: PIE_COLORS[idx % PIE_COLORS.length]
      };
    }).filter(item => item.amount > 0);

    return { breakdown, totalTypeAmount };
  };

  const entrateData = getCategoryBreakdown('entrata');
  const usciteData = getCategoryBreakdown('uscita');

  // SVG Pie Chart Generator using stroke-dasharray on circle
  const renderPieSvg = (dataList, totalAmount) => {
    if (totalAmount === 0 || dataList.length === 0) {
      return (
        <div className="h-44 flex items-center justify-center text-xs text-neutral-400 italic">
          Nessuna transazione registrata
        </div>
      );
    }

    let cumulativePercent = 0;

    return (
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg viewBox="0 0 100 100" className="w-36 h-36 shrink-0 transform -rotate-90">
          {dataList.map((item, idx) => {
            const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
            const strokeDashoffset = -cumulativePercent;
            cumulativePercent += item.percentage;

            return (
              <circle
                key={item.category}
                cx="50"
                cy="50"
                r="15.91549430918954"
                fill="transparent"
                stroke={item.color}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 w-full text-xs">
          {dataList.map(item => (
            <div key={item.category} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-neutral-700 dark:text-neutral-300 font-medium">{item.category}</span>
              </div>
              <div className="font-mono font-bold text-neutral-900 dark:text-white shrink-0">
                €{item.amount.toFixed(2)} ({item.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
        isSidebarOpen ? 'left-60' : 'left-0'
      }`}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#202020] w-full max-w-3xl rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col p-5 space-y-5 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Grafici Distribuzione Categorie (Entrate & Uscite)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body: 2 Pie Charts */}
        <div className="overflow-y-auto space-y-6 pr-1">
          {/* Grafico 1: Entrate divise per Categoria */}
          <div className="p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 border-b border-emerald-200/50 dark:border-emerald-900/50 pb-2">
              <span>Grafico Entrate divise per Categoria</span>
              <span className="font-mono">Totale: +€{entrateData.totalTypeAmount.toFixed(2)}</span>
            </div>
            {renderPieSvg(entrateData.breakdown, entrateData.totalTypeAmount)}
          </div>

          {/* Grafico 2: Uscite divise per Categoria */}
          <div className="p-4 rounded-xl border border-red-200/60 dark:border-red-950 bg-red-50/20 dark:bg-red-950/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-red-800 dark:text-red-300 border-b border-red-200/50 dark:border-red-900/50 pb-2">
              <span>Grafico Uscite divise per Categoria</span>
              <span className="font-mono">Totale: -€{usciteData.totalTypeAmount.toFixed(2)}</span>
            </div>
            {renderPieSvg(usciteData.breakdown, usciteData.totalTypeAmount)}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
