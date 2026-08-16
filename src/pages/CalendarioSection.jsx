import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Info,
  Clock,
  Tag,
  Link2
} from 'lucide-react';

export const CalendarioSection = () => {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent } = useWorkspace();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [selectedCategory, setSelectedCategory] = useState('tutti');
  const [showEventForm, setShowEventForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-08-20');
  const [time, setTime] = useState('10:00');
  const [category, setCategory] = useState('scuola');
  const [notes, setNotes] = useState('');

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Adjust for Monday starting calendar (0 = Sun -> 6, 1 = Mon -> 0)
  const startOffset = (firstDayOfMonth + 6) % 7;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !eventDate) return;

    addCalendarEvent({
      title,
      date: eventDate,
      time,
      category,
      notes
    });

    setTitle('');
    setNotes('');
    setShowEventForm(false);
  };

  const filteredEvents = calendarEvents.filter(e => {
    return selectedCategory === 'tutti' || e.category === selectedCategory;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-500" />
            <span>Calendario Eventi & Scadenze</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Visualizzazione mensile interattiva per scuola, finanze e vita personale.
          </p>
        </div>

        <button
          onClick={() => setShowEventForm(!showEventForm)}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Aggiungi Evento</span>
        </button>
      </div>

      {/* Info Callout about Calendar APIs */}
      <div className="p-3.5 rounded-lg border border-purple-200/70 bg-purple-50/50 dark:border-purple-900/40 dark:bg-purple-950/20 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Nota sulle API Calendario:</span> Al momento il calendario funziona al 100% in locale e salva tutti gli eventi direttamente nel browser. Se in futuro vorrai sincronizzarlo automaticamente con **Google Calendar** o **iCal/Outlook**, basta collegare l'API key (Google Cloud Console Client ID OAuth).
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
        <span className="text-neutral-400 font-medium mr-1">Filtra:</span>
        {['tutti', 'scuola', 'economia', 'personale'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full capitalize font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Event Modal/Form */}
      {showEventForm && (
        <form 
          onSubmit={handleSubmit}
          className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 space-y-4 animate-fade-in"
        >
          <div className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
            Crea un nuovo evento in calendario
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Titolo Evento</label>
              <input
                type="text"
                required
                placeholder="es. Riunione, Consegna Progetto, Pagamento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Data</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Ora (Opzionale)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="scuola">Scuola</option>
                <option value="economia">Economia</option>
                <option value="personale">Personale</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Note / Dettagli</label>
              <input
                type="text"
                placeholder="Aggiungi una breve nota..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowEventForm(false)}
              className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700"
            >
              Salva Evento
            </button>
          </div>
        </form>
      )}

      {/* Main Calendar View Container */}
      <div className="notion-card p-4 space-y-4">
        {/* Month Controls Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-1 text-xs rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              Oggi
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400">
          <div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div><div>Dom</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Blank offset days */}
          {Array.from({ length: startOffset }).map((_, index) => (
            <div key={`blank-${index}`} className="min-h-20 p-1.5 bg-neutral-50/50 dark:bg-neutral-900/30 rounded border border-neutral-100 dark:border-neutral-800/40 opacity-40" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayEvents = filteredEvents.filter(e => e.date === formattedDate);

            return (
              <div 
                key={dayNum} 
                className="min-h-24 p-1.5 bg-white dark:bg-neutral-800/40 rounded border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {dayNum}
                  </span>
                  <button
                    onClick={() => {
                      setEventDate(formattedDate);
                      setShowEventForm(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-purple-600 hover:underline"
                  >
                    +
                  </button>
                </div>

                {/* Day events pills */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-16">
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id}
                      className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium flex items-center justify-between ${
                        ev.category === 'scuola' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300' 
                          : ev.category === 'economia'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                      }`}
                      title={`${ev.title} (${ev.time || 'Tutto il giorno'}) - ${ev.notes}`}
                    >
                      <span className="truncate">{ev.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCalendarEvent(ev.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 shrink-0 ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
