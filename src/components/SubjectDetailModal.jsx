import React, { useState } from 'react';
import { X, Award, Plus, Trash2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { GradeDetailModal } from './GradeDetailModal';

const MONTHS = [
  { num: 9, name: "SET", full: "Settembre", period: 1 },
  { num: 10, name: "OTT", full: "Ottobre", period: 1 },
  { num: 11, name: "NOV", full: "Novembre", period: 1 },
  { num: 12, name: "DIC", full: "Dicembre", period: 1 },
  { num: 1, name: "GEN", full: "Gennaio", period: 2 },
  { num: 2, name: "FEB", full: "Febbraio", period: 2 },
  { num: 3, name: "MAR", full: "Marzo", period: 2 },
  { num: 4, name: "APR", full: "Aprile", period: 2 },
  { num: 5, name: "MAG", full: "Maggio", period: 2 },
  { num: 6, name: "GIU", full: "Giugno", period: 2 },
];

export const SubjectDetailModal = ({ 
  subject, 
  onClose, 
  grades, 
  onDeleteGrade,
  onOpenAddWizard 
}) => {
  const { isSidebarOpen } = useWorkspace();
  const [gradePendingDelete, setGradePendingDelete] = useState(null);
  const [selectedGradeDetail, setSelectedGradeDetail] = useState(null);

  if (!subject) return null;

  const subjectGrades = grades.filter(g => g.subject === subject);

  const getGradePeriod = (g) => {
    if (g.monthNum) {
      return [9, 10, 11, 12].includes(Number(g.monthNum)) ? 1 : 2;
    }
    if (g.date) {
      const monthIndex = new Date(g.date).getMonth() + 1;
      return [9, 10, 11, 12].includes(monthIndex) ? 1 : 2;
    }
    return 1;
  };

  const calcAvg = (list) => {
    const activeGrades = list.filter(g => !g.noAverage && (g.weight === undefined || g.weight > 0));
    if (!activeGrades || activeGrades.length === 0) return null;
    const totalWeight = activeGrades.reduce((acc, g) => acc + (g.weight !== undefined ? g.weight : 1.0), 0);
    const weightedSum = activeGrades.reduce((acc, g) => acc + Number(g.grade) * (g.weight !== undefined ? g.weight : 1.0), 0);
    return (weightedSum / totalWeight).toFixed(2);
  };

  const period1Grades = subjectGrades.filter(g => getGradePeriod(g) === 1);
  const period2Grades = subjectGrades.filter(g => getGradePeriod(g) === 2);

  const avgP1 = calcAvg(period1Grades);
  const avgP2 = calcAvg(period2Grades);
  const avgTotal = calcAvg(subjectGrades);

  const getGradesForMonth = (monthNum) => {
    return subjectGrades.filter(g => {
      if (g.monthNum) return Number(g.monthNum) === monthNum;
      if (g.date) return (new Date(g.date).getMonth() + 1) === monthNum;
      return false;
    });
  };

  const handleConfirmDelete = () => {
    if (gradePendingDelete) {
      onDeleteGrade(gradePendingDelete.id);
      setGradePendingDelete(null);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 cursor-pointer overflow-y-auto transition-all ${
          isSidebarOpen ? 'left-60' : 'left-0'
        }`}
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-[#202020] w-full max-w-4xl rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                📚
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Dettaglio Materia — {subject}
                </h2>
                <p className="text-[11px] text-neutral-400">
                  Griglia dei voti verticale mese per mese
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenAddWizard(subject);
                }}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuovo Voto</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 overflow-y-auto space-y-5">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-0.5">
                <div className="text-[11px] font-semibold text-neutral-500">Media 1° Periodo (Set-Dic)</div>
                <div className="text-xl font-bold text-neutral-900 dark:text-white font-mono">
                  {avgP1 ? `${avgP1} / 10` : '—'}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-0.5">
                <div className="text-[11px] font-semibold text-neutral-500">Media 2° Periodo (Gen-Giun)</div>
                <div className="text-xl font-bold text-neutral-900 dark:text-white font-mono">
                  {avgP2 ? `${avgP2} / 10` : '—'}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-purple-200/80 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/20 space-y-0.5">
                <div className="text-[11px] font-bold text-purple-900 dark:text-purple-300">Media Totale Materia</div>
                <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                  {avgTotal ? `${avgTotal} / 10` : '—'}
                </div>
              </div>
            </div>

            {/* Grid Layout (10 Colonne Orizzontali) */}
            <div className="notion-card p-0 overflow-hidden border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#191919]">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-neutral-100/70 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-700 text-[10px] uppercase font-bold tracking-wider">
                      <th colSpan={4} className="py-1 border-r border-neutral-300 dark:border-neutral-700 text-blue-600 dark:text-blue-400">
                        1° Periodo
                      </th>
                      <th colSpan={6} className="py-1 text-amber-600 dark:text-amber-400">
                        2° Periodo
                      </th>
                    </tr>

                    <tr className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-700 text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
                      {MONTHS.map((m, idx) => (
                        <th 
                          key={m.num} 
                          className={`py-2.5 px-2 w-1/10 ${idx < MONTHS.length - 1 ? 'border-r border-neutral-300 dark:border-neutral-700' : ''}`}
                        >
                          {m.name}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="divide-x divide-neutral-300 dark:divide-neutral-700 align-top min-h-[160px]">
                      {MONTHS.map((m) => {
                        const monthGrades = getGradesForMonth(m.num);
                        const monthAvg = calcAvg(monthGrades);

                        return (
                          <td key={m.num} className="p-2 min-w-[70px] space-y-1.5">
                            {monthGrades.length > 0 ? (
                              <div className="flex flex-col items-center gap-1.5">
                                {monthGrades.map(g => (
                                  <div 
                                    key={g.id}
                                    onClick={() => setSelectedGradeDetail(g)}
                                    className={`group/pill w-full text-center py-1 px-1.5 rounded-md border text-xs font-bold font-mono transition-all relative cursor-pointer hover:scale-105 hover:shadow-xs ${
                                      g.noAverage
                                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-dashed border-neutral-300 dark:border-neutral-600'
                                        : Number(g.grade) >= 6 
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800' 
                                        : 'bg-red-50 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-200/80 dark:border-red-800'
                                    }`}
                                    title="Clicca per dettagli voto"
                                  >
                                    <div>{g.displayGrade || g.grade}</div>
                                    
                                    {g.isHalfWeight && (
                                      <div className="text-[9px] font-normal text-amber-600 dark:text-amber-400 leading-none">50%</div>
                                    )}
                                    {g.noAverage && (
                                      <div className="text-[9px] font-normal text-neutral-400 leading-none">No Media</div>
                                    )}

                                    {/* Delete button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setGradePendingDelete(g);
                                      }}
                                      className="opacity-0 group-hover/pill:opacity-100 absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow-xs"
                                      title="Elimina voto"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}

                                {monthAvg && (
                                  <div className="mt-2 pt-1 border-t border-neutral-200 dark:border-neutral-800 text-[10px] font-semibold text-neutral-400">
                                    Media: <span className="font-bold font-mono text-neutral-700 dark:text-neutral-300">{monthAvg}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="py-6 text-neutral-300 dark:text-neutral-700 text-xs italic">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>

      {/* Grade Detail Modal (Opens on top of SubjectDetailModal with z-[70]) */}
      <GradeDetailModal
        grade={selectedGradeDetail}
        onClose={() => setSelectedGradeDetail(null)}
        onDeleteGrade={(g) => {
          setSelectedGradeDetail(null);
          setGradePendingDelete(g);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!gradePendingDelete}
        onClose={() => setGradePendingDelete(null)}
        onConfirm={handleConfirmDelete}
        itemTitle={gradePendingDelete ? `${gradePendingDelete.subject} (${gradePendingDelete.displayGrade || gradePendingDelete.grade})` : ''}
      />
    </>
  );
};
