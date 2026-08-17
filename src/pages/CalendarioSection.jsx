import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Award,
  Clock,
  Wallet,
  X,
  Filter,
  Grid,
  CalendarDays,
  Sun,
  Trash2,
  Smartphone
} from 'lucide-react';
import { AddHolidayModal } from '../components/AddHolidayModal';

export const CalendarioSection = () => {
  const { grades, schoolItems, transactions, holidays = [], topUps = [], addHoliday, deleteHoliday, isSidebarOpen } = useWorkspace();

  const [currentDate, setCurrentDate] = useState(new Date()); // Active Date
  const [viewMode, setViewMode] = useState('mese'); // 'mese' | 'settimana'
  const [selectedCategory, setSelectedCategory] = useState('tutti'); // tutti, voti, scadenze, economia, vacanze
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);

  // Month View calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const weekdayNames = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  const weekdayShort = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDayOfMonth + 6) % 7; // Monday start

  // Week View calculations
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const currentMonday = getMonday(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentMonday);
    day.setDate(currentMonday.getDate() + i);
    return day;
  });

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'mese') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prevWk = new Date(currentDate);
      prevWk.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWk);
    }
  };

  const handleNext = () => {
    if (viewMode === 'mese') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const nextWk = new Date(currentDate);
      nextWk.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWk);
    }
  };

  // Helper to compile all events for a specific ISO date (YYYY-MM-DD)
  const getEventsForDate = (isoDate) => {
    const events = [];

    // 1. Voti di Scuola
    if (selectedCategory === 'tutti' || selectedCategory === 'voti') {
      grades
        .filter(g => g.date === isoDate)
        .forEach(g => {
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
    }

    // 2. Scadenze di Scuola
    if (selectedCategory === 'tutti' || selectedCategory === 'scadenze') {
      schoolItems
        .filter(s => s.date === isoDate)
        .forEach(s => {
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
    }

    // 3. Transazioni di Economia
    if (selectedCategory === 'tutti' || selectedCategory === 'economia') {
      transactions
        .filter(t => t.description !== 'Saldo Iniziale' && t.date === isoDate)
        .forEach(t => {
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
    }

    // 4. Vacanze
    if (selectedCategory === 'tutti' || selectedCategory === 'vacanze') {
      holidays
        .filter(h => h.date === isoDate)
        .forEach(h => {
          events.push({
            id: 'h_' + h.id,
            type: 'vacanza',
            categoryName: 'Vacanza',
            title: h.name,
            subTitle: 'Giorno di vacanza',
            date: h.date,
            badgeBg: 'bg-orange-100 text-orange-900 dark:bg-orange-950/90 dark:text-orange-200 border border-orange-300 dark:border-orange-800',
            raw: h
          });
        });
    }

    return events;
  };

  const formatWeekRangeHeader = () => {
    const startStr = `${weekDays[0].getDate()} ${monthNames[weekDays[0].getMonth()].slice(0, 3)}`;
    const endStr = `${weekDays[6].getDate()} ${monthNames[weekDays[6].getMonth()].slice(0, 3)} ${weekDays[6].getFullYear()}`;
    return `Settimana ${startStr} - ${endStr}`;
  };

  return (
    <div className="w-full px-4 md:px-8 pt-5 pb-16 mb-12 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-orange-500" />
            <span>Calendario Integrato</span>
          </h1>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Scegli tra vista mensile e settimanale per consultare i tuoi voti, scadenze scolastiche e movimenti finanziari.
          </p>
        </div>

        {/* Top Controls: View Mode Toggle & Category Filter & Add Holiday */}
        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 shrink-0 sm:ml-auto">
          {/* Add Holiday Button */}
          <button
            onClick={() => setIsAddHolidayModalOpen(true)}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Nuova Vacanza</span>
          </button>

          {/* View Mode Toggle Switch (Mensile / Settimanale) */}
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
            <button
              onClick={() => setViewMode('mese')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'mese'
                  ? 'bg-white dark:bg-[#202020] text-orange-600 dark:text-orange-400 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Mese</span>
            </button>
            <button
              onClick={() => setViewMode('settimana')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'settimana'
                  ? 'bg-white dark:bg-[#202020] text-orange-600 dark:text-orange-400 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Settimana</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none justify-end">
            {[
              { id: 'tutti', label: 'Tutti' },
              { id: 'voti', label: 'Voti (Viola)' },
              { id: 'scadenze', label: 'Scadenze (Blu)' },
              { id: 'economia', label: 'Economia (Verde/Rosso)' },
              { id: 'vacanze', label: 'Vacanze (Arancione)' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-800'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calendar View Container */}
      <div className="notion-card p-4 space-y-4 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        {/* Navigation & Period Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            {viewMode === 'mese' ? `${monthNames[month]} ${year}` : formatWeekRangeHeader()}
          </h2>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
              title={viewMode === 'mese' ? 'Mese precedente' : 'Settimana precedente'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-xs font-semibold rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            >
              Oggi
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
              title={viewMode === 'mese' ? 'Mese successivo' : 'Settimana successiva'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. VISTA MENSILE */}
        {viewMode === 'mese' && (
          <div className="space-y-2">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider py-1">
              {weekdayShort.map(day => <div key={day}>{day}</div>)}
            </div>

            {/* Monthly Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Blank offset days */}
              {Array.from({ length: startOffset }).map((_, index) => (
                <div key={`blank-${index}`} className="min-h-24 p-1.5 bg-neutral-50/40 dark:bg-neutral-900/30 rounded-xl border border-neutral-100 dark:border-neutral-800/40 opacity-30" />
              ))}

              {/* Days of current month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNum = index + 1;
                const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = getEventsForDate(formattedDate);
                const isToday = new Date().toISOString().split('T')[0] === formattedDate;
                const holidayObj = holidays.find(h => h.date === formattedDate);
                const hasHoliday = !!holidayObj;
                const otherEvents = dayEvents.filter(ev => ev.type !== 'vacanza');
                const dayTopUps = topUps.filter(t => (parseInt(t.renewalDay, 10) || 1) === dayNum);

                return (
                  <div 
                    key={dayNum} 
                    className={`min-h-24 p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
                      hasHoliday
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : isToday 
                          ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-400 dark:border-orange-600' 
                          : 'bg-white dark:bg-[#191919] border-neutral-200/80 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 overflow-visible">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                        <span className={`text-xs font-extrabold shrink-0 ${
                          hasHoliday 
                            ? 'text-white drop-shadow-xs' 
                            : isToday 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-neutral-700 dark:text-neutral-300'
                        }`}>
                          {dayNum}
                        </span>

                        {/* Pallino Verde Ricarica con Dettagli al Passaggio del Mouse */}
                        {dayTopUps.length > 0 && (
                          <div className="relative group/topup inline-flex items-center shrink-0">
                            <span 
                              className={`w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ${hasHoliday ? 'ring-white/80' : 'ring-emerald-200 dark:ring-emerald-900'} shadow-xs cursor-pointer hover:scale-125 transition-transform`} 
                            />
                            
                            {/* Hover Tooltip Dettagli Ricarica */}
                            <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/topup:flex flex-col z-50 w-52 p-2.5 bg-neutral-900/95 dark:bg-black/95 text-white text-[11px] rounded-xl shadow-2xl backdrop-blur-md border border-neutral-700 pointer-events-none animate-fade-in">
                              <div className="flex items-center gap-1.5 pb-1.5 border-b border-neutral-700 font-bold text-emerald-400">
                                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                                <span>Rinnovo Ricarica ({dayTopUps.length})</span>
                              </div>
                              <div className="space-y-2 pt-1.5">
                                {dayTopUps.map(t => (
                                  <div key={t.id} className="space-y-0.5">
                                    <div className="font-semibold text-white flex items-center justify-between">
                                      <span className="truncate">{t.name}</span>
                                      <span className="font-mono text-emerald-400 shrink-0 ml-1">€{Number(t.monthlyCost).toFixed(2)}/m</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                                      <span>Saldo: €{Number(t.currentBalance).toFixed(2)}</span>
                                      <span className={Number(t.currentBalance) >= Number(t.monthlyCost) ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                        {Number(t.currentBalance) >= Number(t.monthlyCost) ? '✓ Coperto' : '⚠️ Ricaricare'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="absolute left-2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-neutral-900/95" />
                            </div>
                          </div>
                        )}

                        {hasHoliday && (
                          <span 
                            onClick={() => setSelectedEvent({
                              id: 'h_' + holidayObj.id,
                              type: 'vacanza',
                              categoryName: 'Vacanza',
                              title: holidayObj.name,
                              subTitle: 'Giorno di vacanza',
                              date: holidayObj.date,
                              raw: holidayObj
                            })}
                            className="text-[11px] font-bold text-white leading-tight truncate cursor-pointer hover:underline"
                            title={`${holidayObj.name} - Clicca per dettagli`}
                          >
                            {holidayObj.name}
                          </span>
                        )}
                      </div>
                      {otherEvents.length > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                          hasHoliday
                            ? 'bg-black/20 text-white border border-white/20'
                            : isToday 
                              ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' 
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                        }`}>
                          {otherEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Day events pills (transactions, etc.) */}
                    <div className="space-y-1 mt-1 overflow-y-auto max-h-20 scrollbar-none">
                      {otherEvents.map(ev => (
                        <div 
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`px-1.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-transform hover:scale-[1.02] shadow-xs ${ev.badgeBg}`}
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
        )}

        {/* 2. VISTA SETTIMANALE */}
        {viewMode === 'settimana' && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 pt-1">
            {weekDays.map((d, index) => {
              const formattedDate = d.toISOString().split('T')[0];
              const dayEvents = getEventsForDate(formattedDate);
              const isToday = new Date().toISOString().split('T')[0] === formattedDate;
              const holidayObj = holidays.find(h => h.date === formattedDate);
              const hasHoliday = !!holidayObj;
              const otherEvents = dayEvents.filter(ev => ev.type !== 'vacanza');
              const dayTopUps = topUps.filter(t => (parseInt(t.renewalDay, 10) || 1) === d.getDate());

              return (
                <div 
                  key={formattedDate} 
                  className={`min-h-[220px] p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                    hasHoliday
                      ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                      : isToday
                        ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-400 dark:border-orange-600 shadow-xs'
                        : 'bg-white dark:bg-[#191919] border-neutral-200/80 dark:border-neutral-800'
                  }`}
                >
                  {/* Day Header */}
                  <div className={`pb-2 border-b flex items-center justify-between ${hasHoliday ? 'border-white/20' : 'border-neutral-100 dark:border-neutral-800'}`}>
                    <div className="min-w-0 flex-1 pr-1">
                      <div className={`text-[11px] font-bold uppercase tracking-wider ${hasHoliday ? 'text-white/80' : 'text-neutral-400'}`}>
                        {weekdayNames[index]}
                      </div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className={`text-base font-extrabold font-mono shrink-0 ${
                          hasHoliday 
                            ? 'text-white drop-shadow-xs' 
                            : isToday 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-neutral-800 dark:text-neutral-200'
                        }`}>
                          {d.getDate()} {monthNames[d.getMonth()].slice(0, 3)}
                        </span>

                        {/* Pallino Verde Ricarica Settimana con Hover */}
                        {dayTopUps.length > 0 && (
                          <div className="relative group/topup inline-flex items-center shrink-0">
                            <span 
                              className={`w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ${hasHoliday ? 'ring-white/80' : 'ring-emerald-200 dark:ring-emerald-900'} shadow-xs cursor-pointer hover:scale-125 transition-transform`} 
                            />
                            
                            {/* Hover Tooltip Dettagli Ricarica */}
                            <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/topup:flex flex-col z-50 w-52 p-2.5 bg-neutral-900/95 dark:bg-black/95 text-white text-[11px] rounded-xl shadow-2xl backdrop-blur-md border border-neutral-700 pointer-events-none animate-fade-in">
                              <div className="flex items-center gap-1.5 pb-1.5 border-b border-neutral-700 font-bold text-emerald-400">
                                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                                <span>Rinnovo Ricarica ({dayTopUps.length})</span>
                              </div>
                              <div className="space-y-2 pt-1.5">
                                {dayTopUps.map(t => (
                                  <div key={t.id} className="space-y-0.5">
                                    <div className="font-semibold text-white flex items-center justify-between">
                                      <span className="truncate">{t.name}</span>
                                      <span className="font-mono text-emerald-400 shrink-0 ml-1">€{Number(t.monthlyCost).toFixed(2)}/m</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                                      <span>Saldo: €{Number(t.currentBalance).toFixed(2)}</span>
                                      <span className={Number(t.currentBalance) >= Number(t.monthlyCost) ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                        {Number(t.currentBalance) >= Number(t.monthlyCost) ? '✓ Coperto' : '⚠️ Ricaricare'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="absolute left-2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-neutral-900/95" />
                            </div>
                          </div>
                        )}

                        {hasHoliday && (
                          <span 
                            onClick={() => setSelectedEvent({
                              id: 'h_' + holidayObj.id,
                              type: 'vacanza',
                              categoryName: 'Vacanza',
                              title: holidayObj.name,
                              subTitle: 'Giorno di vacanza',
                              date: holidayObj.date,
                              raw: holidayObj
                            })}
                            className="text-xs font-bold text-white truncate cursor-pointer hover:underline"
                            title={`${holidayObj.name} - Clicca per dettagli`}
                          >
                            {holidayObj.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {otherEvents.length > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        hasHoliday
                          ? 'bg-black/20 text-white border border-white/20'
                          : isToday
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}>
                        {otherEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack for Weekly View */}
                  <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[260px] scrollbar-none py-1">
                    {otherEvents.length > 0 ? (
                      otherEvents.map(ev => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-transform hover:scale-[1.02] shadow-xs space-y-0.5 ${ev.badgeBg}`}
                        >
                          <div className="font-bold truncate">{ev.title}</div>
                          {ev.subTitle && (
                            <div className="text-[10px] opacity-80 truncate">{ev.subTitle}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className={`h-full flex items-center justify-center text-[11px] italic ${hasHoliday ? 'text-white/70' : 'text-neutral-400'}`}>
                        Nessun evento
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Read-Only Event Detail Popup Modal */}
      {selectedEvent && (
        <div 
          className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
            isSidebarOpen ? 'left-60' : 'left-0'
          }`}
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white dark:bg-[#202020] w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                {selectedEvent.type === 'voto' && <Award className="w-5 h-5 text-purple-500" />}
                {selectedEvent.type === 'scadenza' && <Clock className="w-5 h-5 text-blue-500" />}
                {selectedEvent.type === 'transazione' && <Wallet className="w-5 h-5 text-emerald-500" />}
                {selectedEvent.type === 'vacanza' && <Sun className="w-5 h-5 text-orange-500" />}
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Dettaglio {selectedEvent.categoryName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
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
                  {selectedEvent.title}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Data
                </span>
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  {selectedEvent.date}
                </span>
              </div>

              {selectedEvent.subTitle && (
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Dettagli
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {selectedEvent.subTitle}
                  </span>
                </div>
              )}

              {selectedEvent.type === 'voto' && selectedEvent.raw.notes && (
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Note</span>
                  <p className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    {selectedEvent.raw.notes}
                  </p>
                </div>
              )}

              {selectedEvent.type === 'scadenza' && selectedEvent.raw.description && (
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Descrizione Scadenza</span>
                  <p className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    {selectedEvent.raw.description}
                  </p>
                </div>
              )}

              {selectedEvent.type === 'transazione' && selectedEvent.raw.notes && (
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Note Transazione</span>
                  <p className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    {selectedEvent.raw.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
              {selectedEvent.type === 'vacanza' ? (
                <button
                  type="button"
                  onClick={() => {
                    deleteHoliday(selectedEvent.raw.id);
                    setSelectedEvent(null);
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Elimina Vacanza</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aggiungi Vacanza */}
      <AddHolidayModal
        isOpen={isAddHolidayModalOpen}
        onClose={() => setIsAddHolidayModalOpen(false)}
        onAddHoliday={addHoliday}
      />
    </div>
  );
};
