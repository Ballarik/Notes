import React, { useState } from 'react';
import { X, Sun, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AppleDatePicker } from './AppleDatePicker';

export const AddHolidayModal = ({ isOpen, onClose, onAddHoliday }) => {
  const { isSidebarOpen } = useWorkspace();
  const [step, setStep] = useState(1); // 1: Nome, 2: Data
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setName('');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    onAddHoliday({
      name: name.trim(),
      date
    });

    handleClose();
  };

  const totalSteps = 2;
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
        isSidebarOpen ? 'left-60' : 'left-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-[#202020] w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Progress Bar */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                Passaggio {step} di {totalSteps}
              </span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {step === 1 && '1. Nome della Vacanza'}
                {step === 2 && '2. Seleziona la Data'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top Progress Bar in Orange */}
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-orange-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal Body per Step */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* STEP 1: Nome */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Nome o descrizione della vacanza:
              </label>
              <input
                type="text"
                autoFocus
                placeholder="es. Vacanze di Natale, Pasqua, Ponte del 25 Aprile..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    e.preventDefault();
                    setStep(2);
                  }
                }}
                className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
              />
              <p className="text-[11px] text-neutral-400">
                Inserisci il nome che comparirà nel calendario nei giorni di vacanza.
              </p>
            </div>
          )}

          {/* STEP 2: Data */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Data della vacanza per <span className="text-orange-600 dark:text-orange-400 font-bold">"{name}"</span>:
                </label>
              </div>
              <AppleDatePicker
                value={date}
                onChange={setDate}
                themeColor="orange"
              />
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Indietro</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
            >
              Annulla
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!name.trim()}
              className="px-4 py-1.5 text-xs font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
            >
              <span>Avanti</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salva Vacanza</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
