import React from 'react';
import { X, Calendar, BookOpen, FileText, Trash2, Award } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const GradeDetailModal = ({ grade, onClose, onDeleteGrade }) => {
  const { isSidebarOpen } = useWorkspace();

  if (!grade) return null;

  const formattedDate = grade.date 
    ? new Date(grade.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : (grade.monthName || 'Data non specificata');

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
        isSidebarOpen ? 'left-60' : 'left-0'
      }`}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#202020] w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col space-y-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Dettaglio Valutazione
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grade Display Badge & Subject */}
        <div className="flex items-center justify-between bg-purple-50/60 dark:bg-purple-950/30 p-3.5 rounded-xl border border-purple-200/60 dark:border-purple-800/60">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
              {grade.subject}
            </span>
            <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
              {grade.title || 'Valutazione'}
            </div>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-extrabold font-mono px-3 py-1 rounded-xl shadow-2xs border ${
              grade.noAverage 
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-dashed border-neutral-300 dark:border-neutral-600'
                : Number(grade.grade) >= 6 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800'
            }`}>
              {grade.displayGrade || grade.grade}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
              Valore: {grade.grade}
            </div>
          </div>
        </div>

        {/* Badges for Special Options */}
        {(grade.noAverage || grade.isHalfWeight) && (
          <div className="flex items-center gap-2">
            {grade.noAverage && (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-dashed border-neutral-300 dark:border-neutral-700">
                🚫 Non fa media (Escluso dai calcoli)
              </span>
            )}
            {grade.isHalfWeight && (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                ⚖️ Valore al 50% (Media ponderata peso 0.5)
              </span>
            )}
          </div>
        )}

        {/* Detailed Fields */}
        <div className="space-y-3 pt-1 text-xs">
          {/* Data Precisa */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
            <Calendar className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-semibold text-neutral-400">Data Precisa</div>
              <div className="font-bold text-neutral-800 dark:text-neutral-200 capitalize mt-0.5">
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Descrizione / Dettagli */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
            <FileText className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div className="w-full">
              <div className="text-[11px] font-semibold text-neutral-400">Descrizione / Note</div>
              <div className="text-neutral-700 dark:text-neutral-300 mt-0.5 leading-relaxed whitespace-pre-wrap">
                {grade.description ? grade.description : <span className="text-neutral-400 italic">Nessuna descrizione inserita</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => {
              onClose();
              onDeleteGrade(grade);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Elimina Voto</span>
          </button>

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
