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
  CalendarDays
} from 'lucide-react';

export const CalendarioSection = () => {
  const { grades, schoolItems, transactions, isSidebarOpen } = useWorkspace();

  const [currentDate, setCurrentDate] = useState(new Date()); // Active Date
  const [viewMode, setViewMode] = useState('mese'); // 'mese' | 'settimana'
  const [selectedCategory, setSelectedCategory] = useState('tutti'); // tutti, voti, scadenze, economia
  const [selectedEvent, setSelectedEvent] = useState(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            <span>Calendario Integrato</span>
          </h1>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Scegli tra vista mensile e settimanale per consultare i tuoi voti, scadenze scolastiche e movimenti finanziari.
          </p>
        </div>

        {/* Top Controls: View Mode Toggle & Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle Switch (Mensile / Settimanale) */}
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setViewMode('mese')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'mese'
                  ? 'bg-white dark:bg-[#202020] text-blue-600 dark:text-blue-400 shadow-xs font-bold'
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
                  ? 'bg-white dark:bg-[#202020] text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Settimana</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {[
              { id: 'tutti', label: 'Tutti' },
              { id: 'voti', label: 'Voti (Viola)' },
              { id: 'scadenze', label: 'Scadenze (Blu)' },
              { id: 'economia', label: 'Economia (Verde/Rosso)' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
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

                return (
                  <div 
                    key={dayNum} 
                    className={`min-h-24 p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isToday 
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-700' 
                        : 'bg-white dark:bg-[#191919] border-neutral-200/80 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Day events pills */}
                    <div className="space-y-1 mt-1 overflow-y-auto max-h-20 scrollbar-none">
                      {dayEvents.map(ev => (
                        <div 
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`px-1.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-transform hover:scale-[1.02] ${ev.badgeBg}`}
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

              return (
                <div 
                  key={formattedDate}
                  className={`min-h-[220px] p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                    isToday
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-700 shadow-xs'
                      : 'bg-white dark:bg-[#191919] border-neutral-200/80 dark:border-neutral-800'
                  }`}
                >
                  {/* Day Header */}
                  <div className="pb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        {weekdayNames[index]}
                      </div>
                      <div className={`text-base font-extrabold font-mono ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                        {d.getDate()} {monthNames[d.getMonth()].slice(0, 3)}
                      </div>
                    </div>
                    {dayEvents.length > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack for Weekly View */}
                  <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[260px] scrollbar-none py-1">
                    {dayEvents.length > 0 ? (
                      dayEvents.map(ev => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-transform hover:scale-[1.02] space-y-0.5 ${ev.badgeBg}`}
                        >
                          <div className="font-bold truncate">{ev.title}</div>
                          {ev.subTitle && (
                            <div className="text-[10px] opacity-80 truncate">{ev.subTitle}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-[11px] text-neutral-400 italic">
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
            <div className="flex justify-end pt-2 border-t border-neutral-200 dark:border-neutral-800">
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
    </div>
  );
};
