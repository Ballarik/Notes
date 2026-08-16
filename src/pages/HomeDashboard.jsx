import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { TenDayEconomyChart } from '../components/TenDayEconomyChart';
import { 
  Wallet, 
  GraduationCap, 
  ChevronRight,
  Award,
  Calendar as CalendarIcon,
  ChevronLeft,
  Clock,
  X
} from 'lucide-react';

export const HomeDashboard = () => {
  const { 
    transactions, 
    schoolItems, 
    grades,
    initialBaseBalance = 840.00,
    quickNotes, 
    setQuickNotes,
    navigateTo,
    isSidebarOpen
  } = useWorkspace();

  const [currentDate, setCurrentDate] = useState(new Date()); // Current Month
  const [selectedHomeEvent, setSelectedHomeEvent] = useState(null);

  // Calculated totals for financial status
  const totalEntrate = transactions
    .filter(t => t.type === 'entrata' && t.description !== 'Saldo Iniziale')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalUscite = transactions
    .filter(t => t.type === 'uscita')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalBalance = initialBaseBalance + totalEntrate - totalUscite;

  const pendingSchoolItems = schoolItems.filter(i => i.status !== 'completato');

  // Last 10 school grades sorted by date (most recent first)
  const last10Grades = [...grades]
    .sort((a, b) => new Date(b.date || '2026-01-01') - new Date(a.date || '2026-01-01'))
    .slice(0, 10);

  // Active School Period Average Calculation
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

  const period1Grades = grades.filter(g => getGradePeriod(g) === 1);
  const period2Grades = grades.filter(g => getGradePeriod(g) === 2);

  const avgP1 = calcAvg(period1Grades);
  const avgP2 = calcAvg(period2Grades);
  const avgTotal = calcAvg(grades);

  // Current active period: Sept-Dec = Period 1, Jan-June = Period 2
  const currentMonthIdx = new Date().getMonth() + 1;
  const currentPeriod = [9, 10, 11, 12].includes(currentMonthIdx) ? 1 : 2;
  const currentPeriodAvg = currentPeriod === 1 ? avgP1 : avgP2;

  // Calendar calculations for left column
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDayOfMonth + 6) % 7; // Monday start

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Helper to get aggregated events for date (Voti, Scadenze, Transazioni)
  const getHomeEventsForDate = (isoDate) => {
    const events = [];

    // Voti
    grades.filter(g => g.date === isoDate).forEach(g => {
      events.push({
        id: 'g_' + g.id,
        type: 'voto',
        categoryName: 'Voto Scuola',
        title: `Voto ${g.grade} - ${g.subject}`,
        subTitle: g.title,
        date: g.date,
        badgeBg: 'bg-purple-100 text-purple-900 dark:bg-purple-950/90 dark:text-purple-200 border border-purple-200 dark:border-purple-800',
        raw: g
      });
    });

    // Scadenze
    schoolItems.filter(s => s.date === isoDate).forEach(s => {
      events.push({
        id: 's_' + s.id,
        type: 'scadenza',
        categoryName: 'Scadenza Scuola',
        title: `${s.subject}: ${s.title}`,
        subTitle: s.status === 'fatto' ? 'Completata' : 'In Sospeso',
        date: s.date,
        badgeBg: 'bg-blue-100 text-blue-900 dark:bg-blue-950/90 dark:text-blue-200 border border-blue-200 dark:border-blue-800',
        raw: s
      });
    });

    // Transazioni
    transactions.filter(t => t.description !== 'Saldo Iniziale' && t.date === isoDate).forEach(t => {
      events.push({
        id: 't_' + t.id,
        type: 'transazione',
        categoryName: 'Economia',
        title: `${t.type === 'entrata' ? '+' : '−'}€${Number(t.amount).toFixed(2)} (${t.description})`,
        subTitle: t.category,
        date: t.date,
        badgeBg: t.type === 'entrata'
          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
          : 'bg-red-100 text-red-900 dark:bg-red-950/90 dark:text-red-200 border border-red-200 dark:border-red-800',
        raw: t
      });
    });

    return events;
  };

  return (
    <div className="w-full px-4 md:px-8 pt-5 pb-16 mb-12 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>👋</span> Benvenuto Riccardo
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('economia')}
            className="notion-btn-ghost text-xs border border-neutral-200 dark:border-neutral-800"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Nuova Transazione</span>
          </button>
          <button
            onClick={() => navigateTo('scuola')}
            className="notion-btn-ghost text-xs border border-neutral-200 dark:border-neutral-800"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
            <span>Nuovo Voto / Scadenza</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLONNA DI SINISTRA (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. In alto: Note Veloci & Promemoria (Scratchpad) */}
          <div className="notion-card p-4 space-y-2 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>📝</span> Note Veloci & Promemoria
              </span>
              <span className="text-[10px] text-neutral-400">Auto-salvate</span>
            </div>
            <textarea
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              placeholder="Scrivi qui appunti rapidi, idee o promemoria al volo..."
              className="w-full h-28 text-xs bg-transparent text-neutral-800 dark:text-neutral-200 resize-none focus:outline-none placeholder-neutral-400 leading-relaxed"
            />
          </div>

          {/* 2. Sotto: Riga Orizzontale con gli ultimi 10 Voti */}
          <div className="notion-card p-4 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                  Ultimi 10 Voti Conseguiti
                </h3>
              </div>
              <button
                onClick={() => navigateTo('scuola')}
                className="text-[11px] text-neutral-400 hover:text-purple-500 flex items-center gap-0.5 transition-colors"
              >
                <span>Tutti i voti</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Scrollable Horizontal Row of 10 Grades */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {last10Grades.length > 0 ? (
                last10Grades.map((g) => (
                  <div
                    key={g.id}
                    className="p-2.5 rounded-xl border border-purple-200/70 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 shrink-0 min-w-[140px] space-y-1 hover:border-purple-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-[90px]">
                        {g.subject}
                      </span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-purple-600 text-white font-mono shadow-2xs">
                        {g.grade}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                      {g.title || 'Verifica'}
                    </div>
                    {g.date && (
                      <div className="text-[9px] font-mono text-neutral-400">
                        {g.date}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-neutral-400 italic py-2">
                  Nessun voto scolastico registrato.
                </div>
              )}
            </div>
          </div>

          {/* 3. Sotto Ancora: Calendario del Mese Corrente (Integrato con Sezione Calendario) */}
          <div className="notion-card p-4 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                  Calendario {monthNames[month]} {year}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                >
                  Oggi
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-neutral-400 uppercase">
              <div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div><div>Dom</div>
            </div>

            {/* Integrated Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Blank offset days */}
              {Array.from({ length: startOffset }).map((_, index) => (
                <div key={`blank-${index}`} className="min-h-16 p-1 bg-neutral-50/40 dark:bg-neutral-900/30 rounded-lg border border-neutral-100 dark:border-neutral-800/40 opacity-30" />
              ))}

              {/* Days of current month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNum = index + 1;
                const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = getHomeEventsForDate(formattedDate);
                const isToday = new Date().toISOString().split('T')[0] === formattedDate;

                return (
                  <div 
                    key={dayNum} 
                    className={`min-h-16 p-1 rounded-lg border flex flex-col justify-between transition-all ${
                      isToday 
                        ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-400 dark:border-purple-700' 
                        : 'bg-white dark:bg-[#191919] border-neutral-200/70 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold ${isToday ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Day events pills */}
                    <div className="space-y-0.5 mt-0.5 overflow-y-auto max-h-12 scrollbar-none">
                      {dayEvents.map(ev => (
                        <div 
                          key={ev.id}
                          onClick={() => setSelectedHomeEvent(ev)}
                          className={`px-1 py-0.5 rounded text-[9px] font-bold cursor-pointer truncate ${ev.badgeBg}`}
                          title={`${ev.title} - Clicca per i dettagli`}
                        >
                          <div className="truncate">{ev.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLONNA DI DESTRA (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Media del Periodo Scolastico Attuale */}
          <div className="notion-card p-4 space-y-3 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 border border-purple-200/60 dark:border-purple-900/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider text-[11px]">
                  Media del Periodo (Periodo {currentPeriod})
                </h3>
              </div>
              <button
                onClick={() => navigateTo('scuola')}
                className="text-[11px] text-neutral-400 hover:text-purple-500 flex items-center gap-0.5 transition-colors"
              >
                <span>Vedi materie</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
                  {currentPeriodAvg ? currentPeriodAvg : (avgTotal ? avgTotal : 'N/D')}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Media pesata del Periodo {currentPeriod}
                </div>
              </div>

              <div className="text-right space-y-1 text-xs">
                <div className="text-neutral-500 dark:text-neutral-400 font-medium">
                  Media P1: <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{avgP1 ? avgP1 : 'N/D'}</span>
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 font-medium">
                  Media P2: <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{avgP2 ? avgP2 : 'N/D'}</span>
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 font-medium">
                  Media Gen: <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{avgTotal ? avgTotal : 'N/D'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Scadenze di Scuola */}
          <div className="notion-card p-4 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                  Scadenze di Scuola ({pendingSchoolItems.length})
                </h3>
              </div>
              <button
                onClick={() => navigateTo('scuola')}
                className="text-[11px] text-neutral-400 hover:text-blue-500 flex items-center gap-0.5 transition-colors"
              >
                <span>Gestisci</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {pendingSchoolItems.length > 0 ? (
                pendingSchoolItems.slice(0, 4).map(item => (
                  <div 
                    key={item.id}
                    className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-blue-600 dark:text-blue-400">{item.subject}</span>
                        <span>•</span>
                        <span className="font-mono">{item.date}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                      In Scadenza
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-neutral-400">
                  Nessuna scadenza scolastica in sospeso.
                </div>
              )}
            </div>
          </div>

          {/* 3. Grafico dei Miei Soldi degli Ultimi 10 Giorni */}
          <TenDayEconomyChart transactions={transactions} initialBaseBalance={initialBaseBalance} />
        </div>
      </div>

      {/* Read-Only Event Detail Popup Modal for Home Calendar */}
      {selectedHomeEvent && (
        <div 
          className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
            isSidebarOpen ? 'left-60' : 'left-0'
          }`}
          onClick={() => setSelectedHomeEvent(null)}
        >
          <div 
            className="bg-white dark:bg-[#202020] w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                {selectedHomeEvent.type === 'voto' && <Award className="w-5 h-5 text-purple-500" />}
                {selectedHomeEvent.type === 'scadenza' && <Clock className="w-5 h-5 text-blue-500" />}
                {selectedHomeEvent.type === 'transazione' && <Wallet className="w-5 h-5 text-emerald-500" />}
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Dettaglio {selectedHomeEvent.categoryName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedHomeEvent(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Details Content */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Elemento
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  {selectedHomeEvent.title}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Data
                </span>
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  {selectedHomeEvent.date}
                </span>
              </div>

              {selectedHomeEvent.subTitle && (
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Dettagli
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {selectedHomeEvent.subTitle}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setSelectedHomeEvent(null)}
                className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
