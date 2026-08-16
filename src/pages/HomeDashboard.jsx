import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Wallet, 
  GraduationCap, 
  Calendar as CalendarIcon, 
  Plus, 
  ArrowUpRight, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';

export const HomeDashboard = () => {
  const { 
    transactions, 
    schoolItems, 
    calendarEvents, 
    homeStats, 
    setHomeStats, 
    quickNotes, 
    setQuickNotes,
    navigateTo 
  } = useWorkspace();

  const [isEditingStats, setIsEditingStats] = useState(false);

  // Calculated totals for initial view
  const totalBalance = transactions.reduce((acc, curr) => {
    return curr.type === 'entrata' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const pendingSchoolItems = schoolItems.filter(i => i.status !== 'completato');
  const upcomingEvents = calendarEvents.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>👋</span> Benvenuto nella tua Dashboard
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Panoramica in tempo reale del tuo workspace: Economia, Scuola e Calendario.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('economia')}
            className="notion-btn-ghost text-xs border border-neutral-200 dark:border-neutral-800"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Nuova Spesa</span>
          </button>
          <button
            onClick={() => navigateTo('scuola')}
            className="notion-btn-ghost text-xs border border-neutral-200 dark:border-neutral-800"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
            <span>Aggiungi Compito</span>
          </button>
          <button
            onClick={() => navigateTo('calendario')}
            className="notion-btn-ghost text-xs border border-neutral-200 dark:border-neutral-800"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-purple-500" />
            <span>Nuovo Evento</span>
          </button>
        </div>
      </div>

      {/* Info Callout Box */}
      <div className="p-3.5 rounded-lg border border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Dashboard Pronta & Configurato tutto:</span> Questa Home è divisa in 2 colonne principali. Dimmi una ad una quali statistiche e dati desideri inserire nelle card in evidenza e quali sezioni personalizzare!
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section Title & Customization Toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-200 uppercase text-[11px] text-neutral-400">
              Statistiche & Metriche Chiave
            </h2>
            <button
              onClick={() => setIsEditingStats(!isEditingStats)}
              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingStats ? 'Salva Modifiche' : 'Personalizza Statistiche'}</span>
            </button>
          </div>

          {/* 4 Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {homeStats.map((stat, idx) => (
              <div 
                key={stat.id || idx}
                className="notion-card relative group flex flex-col justify-between space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {stat.label}
                  </span>
                  <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {idx === 0 && <Wallet className="w-4 h-4 text-emerald-500" />}
                    {idx === 1 && <GraduationCap className="w-4 h-4 text-blue-500" />}
                    {idx === 2 && <CalendarIcon className="w-4 h-4 text-purple-500" />}
                    {idx === 3 && <BookOpen className="w-4 h-4 text-amber-500" />}
                  </div>
                </div>

                {isEditingStats ? (
                  <div className="space-y-1.5 pt-1">
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const updated = [...homeStats];
                        updated[idx].label = e.target.value;
                        setHomeStats(updated);
                      }}
                      className="w-full text-xs p-1 border border-neutral-200 dark:border-neutral-700 rounded bg-transparent"
                      placeholder="Nome statistica"
                    />
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const updated = [...homeStats];
                        updated[idx].value = e.target.value;
                        setHomeStats(updated);
                      }}
                      className="w-full text-xs p-1 border border-neutral-200 dark:border-neutral-700 rounded bg-transparent font-bold"
                      placeholder="Valore (es. € 250)"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                      {idx === 0 ? `€ ${totalBalance.toFixed(2)}` : stat.value}
                    </div>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {stat.change}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Scratchpad / Note Veloci Block */}
          <div className="notion-card space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <span>📝</span> Scratchpad & Note Veloci (Auto-Salvate)
              </span>
              <span className="text-[10px] text-neutral-400">Tutti i cambiamenti si salvano all'istante</span>
            </div>
            <textarea
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              placeholder="Scrivi qui appunti rapidi, promemoria o idee al volo..."
              className="w-full h-32 text-xs bg-transparent text-neutral-800 dark:text-neutral-200 resize-none focus:outline-none placeholder-neutral-400 leading-relaxed"
            />
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming School Tasks Widget */}
          <div className="notion-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                  Scuola & Prossime Scadenze
                </h3>
              </div>
              <button
                onClick={() => navigateTo('scuola')}
                className="text-[11px] text-neutral-400 hover:text-blue-500 flex items-center gap-0.5 transition-colors"
              >
                <span>Vedi tutte</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {pendingSchoolItems.length > 0 ? (
                pendingSchoolItems.slice(0, 4).map(item => (
                  <div 
                    key={item.id}
                    className="p-2.5 rounded-md bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-blue-600 dark:text-blue-400">{item.subject}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                      item.status === 'in_corso' 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                    }`}>
                      {item.status === 'in_corso' ? 'In corso' : 'Da fare'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-neutral-400">
                  Nessuna scadenza scolastica in sospeso! 🎉
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Calendar Events Widget */}
          <div className="notion-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                  Prossimi Eventi in Calendario
                </h3>
              </div>
              <button
                onClick={() => navigateTo('calendario')}
                className="text-[11px] text-neutral-400 hover:text-purple-500 flex items-center gap-0.5 transition-colors"
              >
                <span>Calendario</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div 
                    key={event.id}
                    className="p-2.5 rounded-md bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${
                        event.category === 'scuola' ? 'bg-blue-500' :
                        event.category === 'economia' ? 'bg-emerald-500' : 'bg-purple-500'
                      }`} />
                      <div>
                        <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {event.title}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {event.date} {event.time && `alle ${event.time}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-neutral-400">
                  Nessun evento in programma.
                </div>
              )}
            </div>
          </div>

          {/* Recent Economia Transactions Widget */}
          <div className="notion-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                  Ultime Movimentazioni Finanziarie
                </h3>
              </div>
              <button
                onClick={() => navigateTo('economia')}
                className="text-[11px] text-neutral-400 hover:text-emerald-500 flex items-center gap-0.5 transition-colors"
              >
                <span>Gestisci</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              {transactions.slice(0, 3).map(tx => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-xs transition-colors"
                >
                  <div>
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                      {tx.description}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {tx.category} • {tx.date}
                    </div>
                  </div>
                  <span className={`font-mono font-semibold ${
                    tx.type === 'entrata' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'
                  }`}>
                    {tx.type === 'entrata' ? '+' : '-'}€{Number(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
