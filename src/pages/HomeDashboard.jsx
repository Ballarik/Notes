import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { TenDayEconomyChart } from '../components/TenDayEconomyChart';
import { 
  Wallet, 
  GraduationCap, 
  ChevronRight,
  Award,
  Calendar as CalendarIcon,
  Clock,
  X,
  CalendarDays,
  CalendarClock,
  Smartphone
} from 'lucide-react';

export const HomeDashboard = () => {
  const { 
    transactions, 
    schoolItems, 
    grades,
    holidays = [],
    topUps = [],
    timetable = {},
    initialBaseBalance = 840.00,
    userName = 'Riccardo',
    quickNotes, 
    setQuickNotes,
    navigateTo,
    isSidebarOpen
  } = useWorkspace();

  const [selectedHomeEvent, setSelectedHomeEvent] = useState(null);

  // Home Timetable Day Selector
  const dayKeyMap = { 1: 'lun', 2: 'mar', 3: 'mer', 4: 'gio', 5: 'ven', 6: 'sab' };
  const todayDayIdx = new Date().getDay();
  const defaultDayKey = dayKeyMap[todayDayIdx] || 'lun';
  const [homeTimetableDay, setHomeTimetableDay] = useState(defaultDayKey);

  const timetableHomeDays = [
    { key: 'lun', label: 'Lun' },
    { key: 'mar', label: 'Mar' },
    { key: 'mer', label: 'Mer' },
    { key: 'gio', label: 'Gio' },
    { key: 'ven', label: 'Ven' },
    { key: 'sab', label: 'Sab' },
  ];

  const selectedDayHours = [1, 2, 3, 4, 5, 6, 7, 8].map(h => ({
    hour: h,
    subject: timetable[`${homeTimetableDay}_${h}`]
  })).filter(h => h.subject);

  // Calculated totals for financial status
  const totalEntrate = transactions
    .filter(t => t.type === 'entrata' && t.description !== 'Saldo Iniziale')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalUscite = transactions
    .filter(t => t.type === 'uscita')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalBalance = initialBaseBalance + totalEntrate - totalUscite;

  // Grade averages calculations
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

  const calcWeightedAvg = (list) => {
    const activeGrades = list.filter(g => !g.noAverage && (g.weight === undefined || g.weight > 0));
    if (!activeGrades || activeGrades.length === 0) return null;
    const totalWeight = activeGrades.reduce((acc, g) => acc + (g.weight !== undefined ? g.weight : 1.0), 0);
    const weightedSum = activeGrades.reduce((acc, g) => acc + Number(g.grade) * (g.weight !== undefined ? g.weight : 1.0), 0);
    return (weightedSum / totalWeight).toFixed(2);
  };

  const avgP1 = calcWeightedAvg(period1Grades);
  const avgP2 = calcWeightedAvg(period2Grades);
  const avgTotal = calcWeightedAvg(grades);

  const currentMonthNum = new Date().getMonth() + 1;
  const currentPeriod = [9, 10, 11, 12].includes(currentMonthNum) ? 1 : 2;
  const currentPeriodAvg = currentPeriod === 1 ? avgP1 : avgP2;

  // Last 10 grades sorted by date descending
  const last10Grades = [...grades]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 10);

  // Pending school deadlines
  const pendingSchoolItems = schoolItems
    .filter(i => i.status !== 'completato')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Current Week Days (7-day view)
  const getCurrentWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  const currentWeekDays = getCurrentWeekDays();
  const weekdayNamesShort = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const formatHomeWeekHeader = () => {
    const start = currentWeekDays[0];
    const end = currentWeekDays[6];
    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giug', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    return `Settimana in corso (${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]})`;
  };

  // Get aggregated calendar events for a specific YYYY-MM-DD date
  const getHomeEventsForDate = (dateStr) => {
    const events = [];

    // Transactions
    transactions.forEach(t => {
      if (t.date === dateStr) {
        const isEntrata = t.type === 'entrata';
        events.push({
          id: `tx-${t.id}`,
          type: 'transazione',
          categoryName: 'Transazione Economica',
          title: `${isEntrata ? '+' : '-'}€${Number(t.amount).toFixed(2)} (${t.description})`,
          badgeBg: isEntrata 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
            : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300',
          data: t
        });
      }
    });

    // School Items (Scadenze)
    schoolItems.forEach(i => {
      if (i.date === dateStr) {
        events.push({
          id: `sch-${i.id}`,
          type: 'scadenza',
          categoryName: 'Scadenza Scolastica',
          title: `📌 ${i.subject}: ${i.title}`,
          badgeBg: i.status === 'completato'
            ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 line-through opacity-70'
            : 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
          data: i
        });
      }
    });

    // Grades
    grades.forEach(g => {
      if (g.date === dateStr) {
        events.push({
          id: `grd-${g.id}`,
          type: 'voto',
          categoryName: 'Voto Scolastico',
          title: `🎓 ${g.subject}: ${g.grade}`,
          badgeBg: Number(g.grade) >= 6 
            ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200 border border-purple-300 dark:border-purple-800' 
            : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800',
          data: g
        });
      }
    });

    // Holidays
    holidays.forEach(h => {
      if (h.date === dateStr) {
        events.push({
          id: `hol-${h.id}`,
          type: 'vacanza',
          categoryName: 'Vacanza',
          title: h.name,
          badgeBg: 'bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-200 border border-orange-300 dark:border-orange-800',
          data: h
        });
      }
    });

    return events;
  };

  return (
    <div className="w-full px-4 md:px-8 pt-5 pb-16 mb-12 space-y-6 animate-fade-in">
      {/* Saluto Personalizzato */}
      <div className="pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
          <span>👋</span>
          <span>Benvenuto {userName || 'Riccardo'}</span>
        </h1>
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

          {/* 3. SPOSTATO QUI: Scadenze di Scuola in Sospeso (Sotto ad ultimi 10 voti) */}
          <div className="notion-card p-4 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                  Scadenze di Scuola in Sospeso ({pendingSchoolItems.length})
                </h3>
              </div>
              <button
                onClick={() => navigateTo('scuola')}
                className="text-[11px] text-neutral-400 hover:text-purple-500 flex items-center gap-0.5 transition-colors"
              >
                <span>Gestisci scadenze</span>
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
                        <span className="font-medium text-purple-600 dark:text-purple-400">{item.subject}</span>
                        <span>•</span>
                        <span className="font-mono">{item.date}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] rounded-full font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
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

          {/* 4. Settimana in Corso (Calendario 7 Giorni) */}
          <div className="notion-card p-4 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                  {formatHomeWeekHeader()}
                </h3>
              </div>

              <button
                onClick={() => navigateTo('calendario')}
                className="text-[11px] text-neutral-400 hover:text-orange-500 flex items-center gap-0.5 transition-colors"
              >
                <span>Calendario completo</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* 7 Columns Grid for Current Week */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {currentWeekDays.map((d, index) => {
                const formattedDate = d.toISOString().split('T')[0];
                const dayEvents = getHomeEventsForDate(formattedDate);
                const isToday = new Date().toISOString().split('T')[0] === formattedDate;
                const holidayObj = holidays.find(h => h.date === formattedDate);
                const hasHoliday = !!holidayObj;
                const otherEvents = dayEvents.filter(ev => ev.type !== 'vacanza');
                const dayTopUps = topUps.filter(t => (parseInt(t.renewalDay, 10) || 1) === d.getDate());

                return (
                  <div 
                    key={formattedDate}
                    className={`min-h-[140px] p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
                      hasHoliday
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : isToday 
                          ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-400 dark:border-orange-600' 
                          : 'bg-white dark:bg-[#191919] border-neutral-200/70 dark:border-neutral-800'
                    }`}
                  >
                    <div className={`flex items-start justify-between border-b pb-1 gap-1 overflow-visible ${hasHoliday ? 'border-white/20' : 'border-neutral-100 dark:border-neutral-800'}`}>
                      <div className={`text-[10px] font-bold uppercase ${hasHoliday ? 'text-white/80' : 'text-neutral-400'}`}>
                        {weekdayNamesShort[index]}
                      </div>
                      <div className="flex items-center gap-1 min-w-0 flex-1 justify-end flex-wrap">
                        <span className={`text-[11px] font-extrabold shrink-0 ${hasHoliday ? 'text-white drop-shadow-xs' : isToday ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                          {d.getDate()}
                        </span>

                        {/* Pallino Verde Ricarica con Hover */}
                        {dayTopUps.length > 0 && (
                          <div className="relative group/hometopup inline-flex items-center shrink-0">
                            <span 
                              className={`w-2 h-2 rounded-full bg-emerald-500 ring-2 ${hasHoliday ? 'ring-white/80' : 'ring-emerald-200 dark:ring-emerald-900'} shadow-xs cursor-pointer hover:scale-125 transition-transform`} 
                            />
                            {/* Hover Tooltip Dettagli Ricarica */}
                            <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover/hometopup:flex flex-col z-50 w-48 p-2 bg-neutral-900/95 dark:bg-black/95 text-white text-[10px] rounded-xl shadow-2xl backdrop-blur-md border border-neutral-700 pointer-events-none animate-fade-in">
                              <div className="flex items-center gap-1 pb-1 border-b border-neutral-700 font-bold text-emerald-400">
                                <Smartphone className="w-3 h-3 shrink-0" />
                                <span>Rinnovo Ricarica ({dayTopUps.length})</span>
                              </div>
                              <div className="space-y-1 pt-1">
                                {dayTopUps.map(t => (
                                  <div key={t.id} className="space-y-0.5">
                                    <div className="font-semibold text-white flex items-center justify-between">
                                      <span className="truncate">{t.name}</span>
                                      <span className="font-mono text-emerald-400 shrink-0">€{Number(t.monthlyCost).toFixed(2)}/m</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                                      <span>Saldo: €{Number(t.currentBalance).toFixed(2)}</span>
                                      <span className={Number(t.currentBalance) >= Number(t.monthlyCost) ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                        {Number(t.currentBalance) >= Number(t.monthlyCost) ? '✓ OK' : '⚠️ Ricarica'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="absolute right-2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-neutral-900/95" />
                            </div>
                          </div>
                        )}

                        {hasHoliday && (
                          <span 
                            onClick={() => setSelectedHomeEvent({
                              id: `hol-${holidayObj.id}`,
                              type: 'vacanza',
                              categoryName: 'Vacanza',
                              title: holidayObj.name,
                              data: holidayObj
                            })}
                            className="text-[10px] font-bold text-white truncate max-w-[60px] cursor-pointer hover:underline" 
                            title={holidayObj.name}
                          >
                            {holidayObj.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Day events pills for current week (transactions, etc.) */}
                    <div className="space-y-1 mt-1 overflow-y-auto max-h-24 scrollbar-none flex-1">
                      {otherEvents.length > 0 ? (
                        otherEvents.map(ev => (
                          <div 
                            key={ev.id}
                            onClick={() => setSelectedHomeEvent(ev)}
                            className={`px-1 py-0.5 rounded text-[9px] font-bold cursor-pointer truncate shadow-xs ${ev.badgeBg}`}
                            title={`${ev.title} - Clicca per i dettagli`}
                          >
                            <div className="truncate">{ev.title}</div>
                          </div>
                        ))
                      ) : (
                        <div className={`text-[9px] italic text-center py-2 ${hasHoliday ? 'text-white/70' : 'text-neutral-300 dark:text-neutral-600'}`}>
                          —
                        </div>
                      )}
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

          {/* 2. NUOVO WIDGET: Orario delle Lezioni (Sotto alla Media del Periodo) */}
          <div className="notion-card p-4 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                  Orario delle Lezioni
                </h3>
              </div>
              <button
                onClick={() => navigateTo('scuola')}
                className="text-[11px] text-neutral-400 hover:text-purple-500 flex items-center gap-0.5 transition-colors"
              >
                <span>Orario completo</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Day Switcher Pills */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg">
              {timetableHomeDays.map(d => {
                const isSelected = homeTimetableDay === d.key;
                const isTodayDay = dayKeyMap[todayDayIdx] === d.key;

                return (
                  <button
                    key={d.key}
                    onClick={() => setHomeTimetableDay(d.key)}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all text-center relative ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {d.label}
                    {isTodayDay && (
                      <span className={`absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-purple-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Class Hours List for selected day */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 pt-1">
              {selectedDayHours.length > 0 ? (
                selectedDayHours.map(item => (
                  <div 
                    key={item.hour}
                    className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-[10px] font-bold font-mono text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/80 px-1 py-0.5 rounded text-center">
                        {item.hour}ª
                      </span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {item.subject}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {item.hour}ª Ora
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-neutral-400 italic">
                  Nessuna lezione registrata per questo giorno.
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
                {selectedHomeEvent.type === 'scadenza' && <Clock className="w-5 h-5 text-purple-500" />}
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

            {/* Content */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Titolo / Descrizione</span>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  {selectedHomeEvent.data.name || selectedHomeEvent.data.title || selectedHomeEvent.data.description || selectedHomeEvent.data.subject}
                </div>
              </div>

              {selectedHomeEvent.data.subject && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-400">Materia:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{selectedHomeEvent.data.subject}</span>
                </div>
              )}

              {selectedHomeEvent.data.grade && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-400">Voto Conseguito:</span>
                  <span className="font-mono font-extrabold text-purple-600 dark:text-purple-400 text-sm">
                    {selectedHomeEvent.data.grade} / 10
                  </span>
                </div>
              )}

              {selectedHomeEvent.data.amount && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-400">Importo Transazione:</span>
                  <span className={`font-mono font-extrabold text-sm ${selectedHomeEvent.data.type === 'entrata' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selectedHomeEvent.data.type === 'entrata' ? '+' : '-'}€{Number(selectedHomeEvent.data.amount).toFixed(2)}
                  </span>
                </div>
              )}

              {selectedHomeEvent.data.date && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-400">Data Evento:</span>
                  <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{selectedHomeEvent.data.date}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedHomeEvent(null)}
                className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
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
