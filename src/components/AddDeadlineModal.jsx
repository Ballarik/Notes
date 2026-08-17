import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AppleDatePicker } from './AppleDatePicker';

export const AddDeadlineModal = ({ isOpen, onClose, subjects, onAddDeadline }) => {
  const { isSidebarOpen, isHoliday } = useWorkspace();
  const [step, setStep] = useState(1); // 1: Materia, 2: Oggetto, 3: Descrizione, 4: Data Scadenza

  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSelectSubject = (selectedSubj) => {
    setSubject(selectedSubj);
    setStep(2);
  };

  const holiday = isHoliday ? isHoliday(date) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !title || (isHoliday && isHoliday(date))) return;

    onAddDeadline({
      subject,
      title,
      description,
      date,
      status: 'da_fare'
    });

    // Reset & Close
    setStep(1);
    setSubject('');
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const totalSteps = 4;
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
        isSidebarOpen ? 'left-60' : 'left-0'
      }`}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#202020] w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Progress Bar */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Passaggio {step} di {totalSteps}
              </span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {step === 1 && '1. Seleziona la Materia'}
                {step === 2 && '2. Oggetto Scadenza'}
                {step === 3 && '3. Descrizione'}
                {step === 4 && '4. Seleziona Data Scadenza'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top Progress Bar */}
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-purple-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal Body content per Step */}
        <div className="p-5 flex-1 overflow-y-auto max-h-[380px]">
          {/* STEP 1: Selezione Materia */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Clicca sulla materia per cui desideri aggiungere la scadenza:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subjects.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSelectSubject(s)}
                    className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold text-neutral-800 dark:text-neutral-200 text-left transition-all hover:scale-[1.02]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Oggetto */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Oggetto / Titolo della scadenza
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="es. Verifica su integrali, Consegna tesina, Esercizi pag. 140"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Descrizione */}
          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Descrizione / Dettagli opzionali
              </label>
              <textarea
                autoFocus
                placeholder="es. Rivedere capitoli 4 e 5, fare tutti gli esercizi a pagina 12..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* STEP 4: Data Scadenza (Apple Scroll Wheel) */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <CalendarIcon className="w-4 h-4 text-purple-500" />
                <span>Seleziona la data di scadenza</span>
              </div>

              <AppleDatePicker
                value={date}
                onChange={setDate}
                themeColor="purple"
              />

              {holiday && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800 rounded-xl text-xs space-y-1 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-orange-800 dark:text-orange-300">
                    <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>Giorno di Vacanza: {holiday.name}</span>
                  </div>
                  <p className="text-[11px] text-orange-700 dark:text-orange-300/80">
                    Non è possibile inserire scadenze durante i giorni di vacanza. Seleziona una data diversa per continuare.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Indietro</span>
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !subject}
              className="px-4 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              <span>Avanti</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!!holiday}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salva Scadenza</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
