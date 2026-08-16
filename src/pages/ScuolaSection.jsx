import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Award,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const ScuolaSection = () => {
  const { schoolItems, addSchoolItem, toggleSchoolStatus, deleteSchoolItem } = useWorkspace();

  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [grade, setGrade] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !title) return;

    addSchoolItem({
      subject,
      title,
      date,
      status: 'da_fare',
      grade: grade || null
    });

    setSubject('');
    setTitle('');
    setGrade('');
    setShowForm(false);
  };

  const pendingCount = schoolItems.filter(i => i.status !== 'completato').length;
  const completedCount = schoolItems.filter(i => i.status === 'completato').length;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-500" />
            <span>Sezione Scuola & Studio</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Organizza esami, verifiche, consegne e voti scolastici.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuova Scadenza Scuola</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="notion-card space-y-1">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Da Completare</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {pendingCount}
          </div>
          <div className="text-[11px] text-neutral-400">Verifiche / Consegne aperte</div>
        </div>

        <div className="notion-card space-y-1">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Completati</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {completedCount}
          </div>
          <div className="text-[11px] text-neutral-400">Attività portate a termine</div>
        </div>

        <div className="notion-card space-y-1">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-500" />
            <span>Media Voti</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            9.0 / 10
          </div>
          <div className="text-[11px] text-neutral-400">Media scolastica ponderata</div>
        </div>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <form 
          onSubmit={handleSubmit}
          className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-4 animate-fade-in"
        >
          <div className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
            Aggiungi Verifica, Compito o Progetto
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Materia</label>
              <input
                type="text"
                required
                placeholder="es. Matematica, Fisica, Storia"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Titolo / Argomento</label>
              <input
                type="text"
                required
                placeholder="es. Verifica su Integrali"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Data Scadenza</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Voto (Opzionale)</label>
              <input
                type="text"
                placeholder="es. 8.5 / 10"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              Salva
            </button>
          </div>
        </form>
      )}

      {/* School Items Table */}
      <div className="notion-card space-y-3">
        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
          Registro Attività & Consegne
        </div>

        <div className="space-y-2">
          {schoolItems.length > 0 ? (
            schoolItems.map(item => (
              <div 
                key={item.id}
                className="p-3 rounded-lg border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleSchoolStatus(item.id)}
                    className="mt-0.5 text-neutral-400 hover:text-blue-500 transition-colors"
                    title="Cambia stato"
                  >
                    {item.status === 'completato' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : item.status === 'in_corso' ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
                    )}
                  </button>

                  <div>
                    <div className={`text-xs font-semibold ${item.status === 'completato' ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{item.subject}</span>
                      <span>•</span>
                      <span>Scadenza: {item.date}</span>
                      {item.grade && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">Voto: {item.grade}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => toggleSchoolStatus(item.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      item.status === 'completato'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : item.status === 'in_corso'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                        : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {item.status === 'completato' ? 'Completato' : item.status === 'in_corso' ? 'In corso' : 'Da fare'}
                  </button>

                  <button
                    onClick={() => deleteSchoolItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-opacity rounded"
                    title="Elimina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-neutral-400">
              Nessun impegno scolastico inserito. Clicca su "Nuova Scadenza Scuola" per aggiungerne uno.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
