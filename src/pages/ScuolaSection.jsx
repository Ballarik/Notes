import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { GradesChart } from '../components/GradesChart';
import { AddGradeModal } from '../components/AddGradeModal';
import { AddDeadlineModal } from '../components/AddDeadlineModal';
import { SubjectDetailModal } from '../components/SubjectDetailModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { GradeDetailModal } from '../components/GradeDetailModal';
import { DirectLinksModal } from '../components/DirectLinksModal';
import { 
  GraduationCap, 
  Award, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Calendar, 
  RotateCcw,
  BookOpen,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Link2,
  ExternalLink,
  CalendarClock
} from 'lucide-react';


export const ScuolaSection = () => {
  const { 
    schoolItems, 
    addSchoolItem, 
    toggleSchoolStatus, 
    deleteSchoolItem,
    grades,
    addGrade,
    deleteGrade,
    directLinks,
    addDirectLink,
    deleteDirectLink,
    subjects = [],
    timetable = {},
    updateTimetableCell,
    clearTimetable
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState('voti'); 
  const [activeModal, setActiveModal] = useState(null); // 'p1', 'p2', 'general'
  const [activeSubjectDetail, setActiveSubjectDetail] = useState(null); 
  const [sortBy, setSortBy] = useState('name_asc');
  const [isAddGradeWizardOpen, setIsAddGradeWizardOpen] = useState(false);
  const [isAddDeadlineWizardOpen, setIsAddDeadlineWizardOpen] = useState(false);
  const [isDirectLinksModalOpen, setIsDirectLinksModalOpen] = useState(false);
  const [gradePendingDelete, setGradePendingDelete] = useState(null);
  const [selectedGradeDetail, setSelectedGradeDetail] = useState(null);

  // Timetable cell editing modal state
  const [editingCell, setEditingCell] = useState(null); // { dayKey, dayName, hourNum, value }
  const [deleteTimetableState, setDeleteTimetableState] = useState({ open: false, mousePos: null });

  const pendingItems = schoolItems
    .filter(i => i.status !== 'completato')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const completedItems = schoolItems
    .filter(i => i.status === 'completato')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Period helper
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

  const period1Grades = grades.filter(g => getGradePeriod(g) === 1);
  const period2Grades = grades.filter(g => getGradePeriod(g) === 2);

  // Weighted Average Calculation
  const calcAvg = (list) => {
    const activeGrades = list.filter(g => !g.noAverage && (g.weight === undefined || g.weight > 0));
    if (!activeGrades || activeGrades.length === 0) return null;
    const totalWeight = activeGrades.reduce((acc, g) => acc + (g.weight !== undefined ? g.weight : 1.0), 0);
    const weightedSum = activeGrades.reduce((acc, g) => acc + Number(g.grade) * (g.weight !== undefined ? g.weight : 1.0), 0);
    return (weightedSum / totalWeight).toFixed(2);
  };

  const avgPeriod1 = calcAvg(period1Grades);
  const avgPeriod2 = calcAvg(period2Grades);
  const avgOverall = calcAvg(grades);

  // Subject Stats calculation
  const getSubjectStats = (subject) => {
    const subjectGrades = grades.filter(g => g.subject === subject);
    const sorted = [...subjectGrades].sort((a, b) => {
      const dateA = a.date || `2026-${String(a.monthNum).padStart(2, '0')}-01`;
      const dateB = b.date || `2026-${String(b.monthNum).padStart(2, '0')}-01`;
      return new Date(dateA) - new Date(dateB);
    });

    const p1 = sorted.filter(g => getGradePeriod(g) === 1);
    const p2 = sorted.filter(g => getGradePeriod(g) === 2);

    return {
      subject,
      grades: sorted,
      avgP1: calcAvg(p1),
      avgP2: calcAvg(p2),
      avgTotal: calcAvg(sorted),
    };
  };

  const sortedSubjectData = (subjects || []).map(subj => getSubjectStats(subj)).sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return a.subject.localeCompare(b.subject);
      case 'name_desc':
        return b.subject.localeCompare(a.subject);
      case 'p1_asc':
        return (parseFloat(a.avgP1) || 99) - (parseFloat(b.avgP1) || 99);
      case 'p1_desc':
        return (parseFloat(b.avgP1) || -1) - (parseFloat(a.avgP1) || -1);
      case 'p2_asc':
        return (parseFloat(a.avgP2) || 99) - (parseFloat(b.avgP2) || 99);
      case 'p2_desc':
        return (parseFloat(b.avgP2) || -1) - (parseFloat(a.avgP2) || -1);
      case 'total_asc':
        return (parseFloat(a.avgTotal) || 99) - (parseFloat(b.avgTotal) || 99);
      case 'total_desc':
        return (parseFloat(b.avgTotal) || -1) - (parseFloat(a.avgTotal) || -1);
      default:
        return a.subject.localeCompare(b.subject);
    }
  });

  const toggleSort = (field) => {
    if (field === 'name') {
      setSortBy(prev => prev === 'name_asc' ? 'name_desc' : 'name_asc');
    } else if (field === 'p1') {
      setSortBy(prev => prev === 'p1_desc' ? 'p1_asc' : 'p1_desc');
    } else if (field === 'p2') {
      setSortBy(prev => prev === 'p2_desc' ? 'p2_asc' : 'p2_desc');
    } else if (field === 'total') {
      setSortBy(prev => prev === 'total_desc' ? 'total_asc' : 'total_desc');
    }
  };

  const [deleteLinkState, setDeleteLinkState] = useState({ open: false, link: null, mousePos: null });

  const handleConfirmDeleteGrade = () => {
    if (gradePendingDelete) {
      deleteGrade(gradePendingDelete.id);
      setGradePendingDelete(null);
    }
  };

  const handleConfirmDeleteLink = () => {
    if (deleteLinkState.link) {
      deleteDirectLink(deleteLinkState.link.id);
      setDeleteLinkState({ open: false, link: null, mousePos: null });
    }
  };

  return (
    <div className="w-full px-4 md:px-8 pt-5 pb-16 mb-12 space-y-4 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-500" />
            <span>Scuola & Studio</span>
          </h1>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Registro voti per materia, scadenze attive, compiti completati e collegamenti diretti.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'voti' ? (
            <button
              onClick={() => setIsAddGradeWizardOpen(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Voto</span>
            </button>
          ) : activeTab === 'scadenze' || activeTab === 'completati' ? (
            <button
              onClick={() => setIsAddDeadlineWizardOpen(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuova Scadenza</span>
            </button>
          ) : (
            <button
              onClick={() => setIsDirectLinksModalOpen(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Collegamento</span>
            </button>
          )}

          <button
            onClick={() => setIsDirectLinksModalOpen(true)}
            className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-300/80 dark:border-neutral-700"
          >
            <Plus className="w-3.5 h-3.5 text-purple-500" />
            <span>Nuovo Link</span>
          </button>
        </div>
      </div>

      {/* 4 Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('voti')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all shrink-0 ${
            activeTab === 'voti'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Tabella Voti ({grades.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scadenze')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all shrink-0 ${
            activeTab === 'scadenze'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Scadenze in Sospeso ({pendingItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completati')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all shrink-0 ${
            activeTab === 'completati'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completati ({completedItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('collegamenti')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all shrink-0 ${
            activeTab === 'collegamenti'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-purple-500" />
          <span>Collegamenti Diretti ({directLinks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orario')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all shrink-0 ${
            activeTab === 'orario'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5 text-purple-500" />
          <span>Orario Lezioni</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* SEZIONE VOTI */}
      {/* ===================================================================== */}
      {activeTab === 'voti' && (
        <div className="space-y-4 animate-fade-in w-full">
          {/* Top KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            {/* Card 1: Media 1° Periodo */}
            <div 
              onClick={() => setActiveModal('p1')}
              className="notion-card p-3.5 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Media 1° Periodo (Set-Dic)
                </span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 group-hover:underline">
                  Dettagli →
                </span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {avgPeriod1 ? `${avgPeriod1} / 10` : '—'}
              </div>
            </div>

            {/* Card 2: Media 2° Periodo */}
            <div 
              onClick={() => setActiveModal('p2')}
              className="notion-card p-3.5 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Media 2° Periodo (Gen-Giun)
                </span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 group-hover:underline">
                  Dettagli →
                </span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {avgPeriod2 ? `${avgPeriod2} / 10` : '—'}
              </div>
            </div>

            {/* Card 3: Media Generale */}
            <div 
              onClick={() => setActiveModal('general')}
              className="notion-card p-3.5 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all space-y-1 bg-purple-50/40 dark:bg-purple-950/20 group"
            >
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-1">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>Media Generale</span>
                </span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 group-hover:underline">
                  Tutte →
                </span>
              </div>
              <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                {avgOverall ? `${avgOverall} / 10` : '—'}
              </div>
            </div>
          </div>

          {/* Grafico Voti nel Tempo */}
          <GradesChart grades={grades} subjects={subjects} />

          {/* Table spanning full width of page */}
          <div className="w-full notion-card p-0 overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold select-none text-xs">
                    {/* Materia Header */}
                    <th 
                      onClick={() => toggleSort('name')}
                      className="py-2 px-3 cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap w-auto"
                    >
                      <div className="flex items-center gap-1">
                        <span>Materia (Clicca per dettagli)</span>
                        {sortBy === 'name_asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : sortBy === 'name_desc' ? <ArrowDown className="w-3.5 h-3.5 text-purple-600" /> : <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />}
                      </div>
                    </th>

                    {/* Media 1° Periodo Header */}
                    <th 
                      onClick={() => toggleSort('p1')}
                      className="py-2 px-3 text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap w-auto"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>1° Per.</span>
                        {sortBy === 'p1_desc' ? <ArrowDown className="w-3.5 h-3.5 text-purple-600" /> : sortBy === 'p1_asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />}
                      </div>
                    </th>

                    {/* Media 2° Periodo Header */}
                    <th 
                      onClick={() => toggleSort('p2')}
                      className="py-2 px-3 text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap w-auto"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>2° Per.</span>
                        {sortBy === 'p2_desc' ? <ArrowDown className="w-3.5 h-3.5 text-purple-600" /> : sortBy === 'p2_asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />}
                      </div>
                    </th>

                    {/* Media Totale Header */}
                    <th 
                      onClick={() => toggleSort('total')}
                      className="py-2 px-3 text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap w-auto"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Totale</span>
                        {sortBy === 'total_desc' ? <ArrowDown className="w-3.5 h-3.5 text-purple-600" /> : sortBy === 'total_asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />}
                      </div>
                    </th>

                    {/* Voti Inseriti */}
                    <th className="py-2 px-3 w-full">Voti Inseriti (Cronologici)</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {sortedSubjectData.map((item) => (
                    <tr key={item.subject} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group">
                      {/* Materia */}
                      <td 
                        onClick={() => setActiveSubjectDetail(item.subject)}
                        className="py-2 px-3 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 hover:underline flex items-center gap-1.5"
                      >
                        <span>{item.subject}</span>
                        <span className="text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                      </td>

                      {/* Media 1° Periodo */}
                      <td className="py-2 px-3 text-center font-mono whitespace-nowrap">
                        {item.avgP1 ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            Number(item.avgP1) >= 6 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                              : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          }`}>
                            {item.avgP1}
                          </span>
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Media 2° Periodo */}
                      <td className="py-2 px-3 text-center font-mono whitespace-nowrap">
                        {item.avgP2 ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            Number(item.avgP2) >= 6 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                              : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          }`}>
                            {item.avgP2}
                          </span>
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Media Totale */}
                      <td className="py-2 px-3 text-center font-mono whitespace-nowrap">
                        {item.avgTotal ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                            Number(item.avgTotal) >= 6 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                          }`}>
                            {item.avgTotal}
                          </span>
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Voti Inseriti */}
                      <td className="py-2 px-3">
                        {item.grades.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.grades.map((g) => (
                              <div 
                                key={g.id}
                                onClick={() => setSelectedGradeDetail(g)}
                                className={`group/pill inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] cursor-pointer hover:scale-105 transition-all hover:shadow-2xs ${
                                  g.noAverage
                                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-dashed border-neutral-300 dark:border-neutral-600'
                                    : 'bg-white dark:bg-neutral-800 border-neutral-200/80 dark:border-neutral-700'
                                }`}
                                title="Clicca per dettagli voto"
                              >
                                <span className={`font-mono font-bold ${
                                  g.noAverage 
                                    ? 'text-neutral-600 dark:text-neutral-400' 
                                    : Number(g.grade) >= 6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {g.displayGrade || g.grade}
                                </span>
                                {g.isHalfWeight && (
                                  <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">(50%)</span>
                                )}
                                {g.noAverage && (
                                  <span className="text-[9px] font-semibold text-neutral-400">(No Media)</span>
                                )}
                                {g.monthName && !g.noAverage && !g.isHalfWeight && (
                                  <span className="text-[10px] text-neutral-400">({g.monthName.slice(0, 3)})</span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setGradePendingDelete(g);
                                  }}
                                  className="opacity-0 group-hover/pill:opacity-100 text-neutral-400 hover:text-red-500 ml-0.5"
                                  title="Elimina voto"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600 text-xs">Nessun voto</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SEZIONE SCADENZE IN SOSPESO */}
      {/* ===================================================================== */}
      {activeTab === 'scadenze' && (
        <div className="space-y-3 animate-fade-in w-full">
          <div className="space-y-2 w-full">
            {pendingItems.length > 0 ? (
              pendingItems.map(item => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#202020] flex items-center justify-between gap-3 group hover:border-blue-300 dark:hover:border-blue-800 transition-colors shadow-2xs text-xs w-full"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSchoolStatus(item.id)}
                      className="text-neutral-400 hover:text-emerald-500 transition-colors"
                      title="Segna come completato"
                    >
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-neutral-300 dark:border-neutral-600 hover:border-emerald-500 transition-colors" />
                    </button>

                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        <span>{item.title}</span>
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {item.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{item.subject}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono font-bold text-neutral-700 dark:text-neutral-300">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span>Scadenza: {item.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSchoolStatus(item.id)}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-medium rounded border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      Completa
                    </button>
                    <button
                      onClick={() => deleteSchoolItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-opacity rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="notion-card py-8 text-center text-xs text-neutral-400">
                🎉 Nessuna scadenza in sospeso!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SEZIONE COMPLETATI */}
      {/* ===================================================================== */}
      {activeTab === 'completati' && (
        <div className="space-y-3 animate-fade-in w-full">
          <div className="space-y-2 w-full">
            {completedItems.length > 0 ? (
              completedItems.map(item => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/60 dark:bg-neutral-900/40 flex items-center justify-between gap-3 group text-xs w-full"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950 shrink-0" />
                    <div>
                      <div className="font-semibold text-neutral-500 dark:text-neutral-400 line-through">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                        <span className="font-semibold">{item.subject}</span>
                        <span>•</span>
                        <span>Completato</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSchoolStatus(item.id)}
                      className="p-1 text-neutral-500 hover:text-blue-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition-colors text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ripristina</span>
                    </button>

                    <button
                      onClick={() => deleteSchoolItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-opacity rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="notion-card py-8 text-center text-xs text-neutral-400">
                Nessuna attività completata nell'archivio.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SEZIONE COLLEGAMENTI DIRETTI (3 COLONNE) */}
      {/* ===================================================================== */}
      {activeTab === 'collegamenti' && (
        <div className="space-y-4 animate-fade-in w-full">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-purple-500" />
              <h2 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                Collegamenti Diretti Salvati ({directLinks.length})
              </h2>
            </div>
            <button
              onClick={() => setIsDirectLinksModalOpen(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Nuovo Link</span>
            </button>
          </div>

          {directLinks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
              {directLinks.map((item) => (
                <div 
                  key={item.id}
                  className="notion-card p-4 flex flex-col justify-between space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-700 transition-all group relative shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                          {item.url}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteLinkState({ open: true, link: item, mousePos: { x: e.clientX, y: e.clientY } });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 rounded-md transition-opacity"
                      title="Elimina collegamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        let formattedUrl = item.url;
                        if (!/^https?:\/\//i.test(formattedUrl)) {
                          formattedUrl = 'https://' + formattedUrl;
                        }
                        window.open(formattedUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="w-full py-1.5 px-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Apri Collegamento</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="notion-card p-8 text-center space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl">
              <Link2 className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto" />
              <div className="text-xs text-neutral-400">
                Nessun collegamento diretto salvato. Aggiungi il tuo primo link rapido!
              </div>
              <button
                onClick={() => setIsDirectLinksModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi Primo Link</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SEZIONE ORARIO LEZIONI (TABELLA MODIFICABILE LUN-SAB / 1ª-8ª ORA) */}
      {/* ===================================================================== */}
      {activeTab === 'orario' && (
        <div className="space-y-4 animate-fade-in w-full">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-purple-500" />
              <h2 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                Orario Settimanale delle Lezioni (Lunedì - Sabato, 1ª - 8ª Ora)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => setDeleteTimetableState({ open: true, mousePos: { x: e.clientX, y: e.clientY } })}
                className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/80 dark:hover:text-red-300 text-neutral-600 dark:text-neutral-400 text-xs font-semibold rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              >
                <span>Svuota Orario</span>
              </button>
            </div>
          </div>

          <div className="w-full notion-card p-0 overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs bg-white dark:bg-[#202020]">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100/80 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold select-none text-xs">
                    <th className="py-3 px-3 text-center w-24 border-r border-neutral-200 dark:border-neutral-800 text-neutral-400 font-mono">
                      Ora \ Giorno
                    </th>
                    {[
                      { key: 'lun', label: 'Lunedì' },
                      { key: 'mar', label: 'Martedì' },
                      { key: 'mer', label: 'Mercoledì' },
                      { key: 'gio', label: 'Giovedì' },
                      { key: 'ven', label: 'Venerdì' },
                      { key: 'sab', label: 'Sabato' }
                    ].map(d => (
                      <th key={d.key} className="py-3 px-3 text-center font-bold border-r last:border-r-0 border-neutral-200 dark:border-neutral-800">
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(hourNum => (
                    <tr key={hourNum} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                      <td className="py-3 px-3 text-center font-extrabold font-mono text-neutral-500 bg-neutral-50/50 dark:bg-neutral-900/50 border-r border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        {hourNum}ª Ora
                      </td>
                      {[
                        { key: 'lun', label: 'Lunedì' },
                        { key: 'mar', label: 'Martedì' },
                        { key: 'mer', label: 'Mercoledì' },
                        { key: 'gio', label: 'Giovedì' },
                        { key: 'ven', label: 'Venerdì' },
                        { key: 'sab', label: 'Sabato' }
                      ].map(d => {
                        const key = `${d.key}_${hourNum}`;
                        const cellVal = timetable[key];

                        return (
                          <td
                            key={d.key}
                            onClick={() => setEditingCell({ dayKey: d.key, dayName: d.label, hourNum, value: cellVal || '' })}
                            className="py-2.5 px-2.5 text-center border-r last:border-r-0 border-neutral-200/80 dark:border-neutral-800 cursor-pointer hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition-colors"
                            title="Clicca per inserire o modificare la materia"
                          >
                            {cellVal ? (
                              <div className="px-2 py-1.5 rounded-lg bg-purple-100/90 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200 border border-purple-200 dark:border-purple-800 font-bold text-xs shadow-2xs truncate">
                                {cellVal}
                              </div>
                            ) : (
                              <div className="text-[11px] text-neutral-300 dark:text-neutral-700 italic hover:text-neutral-400">
                                + Assegna
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPUP DETTAGLIO SINGOLA MATERIA */}
      <SubjectDetailModal
        subject={activeSubjectDetail}
        onClose={() => setActiveSubjectDetail(null)}
        grades={grades}
        onDeleteGrade={deleteGrade}
        onOpenAddWizard={(subj) => {
          setIsAddGradeWizardOpen(true);
        }}
      />

      {/* POPUP WIZARD PER NUOVO VOTO */}
      <AddGradeModal
        isOpen={isAddGradeWizardOpen}
        onClose={() => setIsAddGradeWizardOpen(false)}
        subjects={subjects}
        onAddGrade={addGrade}
      />

      {/* POPUP WIZARD PER NUOVA SCADENZA */}
      <AddDeadlineModal
        isOpen={isAddDeadlineWizardOpen}
        onClose={() => setIsAddDeadlineWizardOpen(false)}
        subjects={subjects}
        onAddDeadline={addSchoolItem}
      />

      {/* POPUP DETTAGLIO VOTO (Z-INDEX SUPERIORE SU TUTTO) */}
      <GradeDetailModal
        grade={selectedGradeDetail}
        onClose={() => setSelectedGradeDetail(null)}
        onDeleteGrade={(g) => {
          setSelectedGradeDetail(null);
          setGradePendingDelete(g);
        }}
      />

      {/* POPUP CONFERMA ELIMINAZIONE VOTO */}
      <DeleteConfirmModal
        isOpen={!!gradePendingDelete}
        onClose={() => setGradePendingDelete(null)}
        onConfirm={handleConfirmDeleteGrade}
        itemTitle={gradePendingDelete ? `${gradePendingDelete.subject} (${gradePendingDelete.displayGrade || gradePendingDelete.grade})` : ''}
      />

      {/* POPUP DETTAGLIO MEDIE */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white dark:bg-[#202020] w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                <span>
                  {activeModal === 'p1' && 'Medie 1° Periodo (Settembre - Dicembre)'}
                  {activeModal === 'p2' && 'Medie 2° Periodo (Gennaio - Giugno)'}
                  {activeModal === 'general' && 'Medie Generali (Tutte le Materie)'}
                </span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4 space-y-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                    <th className="py-2 px-2">Materia</th>
                    <th className="py-2 px-2 text-right">
                      {activeModal === 'p1' ? '1° Periodo' : activeModal === 'p2' ? '2° Periodo' : 'Media Generale'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {sortedSubjectData.map(item => {
                    const avgValue = activeModal === 'p1' ? item.avgP1 : activeModal === 'p2' ? item.avgP2 : item.avgTotal;

                    return (
                      <tr key={item.subject} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                        <td className="py-2 px-2 font-medium text-neutral-800 dark:text-neutral-200">
                          {item.subject}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          {avgValue ? (
                            <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                              Number(avgValue) >= 6 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                            }`}>
                              {avgValue} / 10
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">Nessun voto</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Links Modal (Form di Aggiunta) */}
      <DirectLinksModal
        isOpen={isDirectLinksModalOpen}
        onClose={() => setIsDirectLinksModalOpen(false)}
        onAddLink={addDirectLink}
      />

      {/* Popup Conferma Eliminazione Link */}
      <DeleteConfirmModal
        isOpen={deleteLinkState.open}
        onClose={() => setDeleteLinkState({ open: false, link: null, mousePos: null })}
        onConfirm={handleConfirmDeleteLink}
        mousePos={deleteLinkState.mousePos}
        itemTitle={deleteLinkState.link ? `il collegamento "${deleteLinkState.link.name}"` : ''}
      />

      {/* POPUP ASSEGNAZIONE / MODIFICA ORA DI LEZIONE */}
      {editingCell && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEditingCell(null)}
        >
          <div 
            className="bg-white dark:bg-[#202020] w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default p-5 space-y-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-purple-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {editingCell.dayName} — {editingCell.hourNum}ª Ora
                </h3>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Seleziona una delle tue materie:
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {subjects.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      updateTimetableCell(editingCell.dayKey, editingCell.hourNum, s);
                      setEditingCell(null);
                    }}
                    className={`p-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                      editingCell.value === s
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:border-purple-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  Oppure testo personalizzato (es. Aula, Laboratorio):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="es. Matematica (Aula 12)"
                    value={editingCell.value}
                    onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                    className="flex-1 text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      updateTimetableCell(editingCell.dayKey, editingCell.hourNum, editingCell.value);
                      setEditingCell(null);
                    }}
                    className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Salva
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  updateTimetableCell(editingCell.dayKey, editingCell.hourNum, '');
                  setEditingCell(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
              >
                Rimuovi Ora
              </button>
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP CONFERMA SVUOTAMENTO ORARIO */}
      <DeleteConfirmModal
        isOpen={deleteTimetableState.open}
        onClose={() => setDeleteTimetableState({ open: false, mousePos: null })}
        onConfirm={() => {
          clearTimetable();
          setDeleteTimetableState({ open: false, mousePos: null });
        }}
        mousePos={deleteTimetableState.mousePos}
        itemTitle="tutto l'orario delle lezioni"
      />
    </div>
  );
};
