import React, { useState } from 'react';
import { X, Package, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const AddAssetModal = ({ isOpen, onClose, onAddAsset }) => {
  const { isSidebarOpen } = useWorkspace();
  const [step, setStep] = useState(1); // 1: Nome, 2: Descrizione, 3: Valore
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setName('');
    setDescription('');
    setValue('');
    onClose();
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    const numValue = parseFloat(value) || 0;

    onAddAsset({
      name: name.trim(),
      description: description.trim(),
      value: numValue,
      dateAdded: new Date().toISOString().split('T')[0]
    });

    handleClose();
  };

  const totalSteps = 3;
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
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Passaggio {step} di {totalSteps}
              </span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {step === 1 && '1. Nome dell\'Oggetto'}
                {step === 2 && '2. Descrizione e Dettagli'}
                {step === 3 && '3. Valore Economico'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top Progress Bar in Emerald */}
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300 ease-out"
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
                Nome dell'oggetto o bene:
              </label>
              <input
                type="text"
                autoFocus
                placeholder="es. MacBook Pro, iPhone 15, PlayStation 5, Bicicletta..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    e.preventDefault();
                    setStep(2);
                  }
                }}
                className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
              />
              <p className="text-[11px] text-neutral-400">
                Inserisci il nome principale del bene di valore che vuoi aggiungere al tuo patrimonio.
              </p>
            </div>
          )}

          {/* STEP 2: Descrizione */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Descrizione o dettagli per <span className="text-emerald-600 dark:text-emerald-400 font-bold">"{name}"</span>:
              </label>
              <textarea
                autoFocus
                rows={4}
                placeholder="es. Modello 256GB, colore Grigio Siderale, acquistato nel 2024, condizioni ottime con garanzia..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    setStep(3);
                  }
                }}
                className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-normal"
              />
              <p className="text-[11px] text-neutral-400">
                Aggiungi note su modello, specifiche, stato di usura o provenienza (opzionale).
              </p>
            </div>
          )}

          {/* STEP 3: Valore */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Prezzo / Valore stimato dell'oggetto (€):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-bold text-neutral-400">
                    €
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    autoFocus
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    className="w-full text-sm font-mono font-bold p-3 pl-8 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Anteprima Riepilogo */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Riepilogo Nuovo Oggetto
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Nome:</span>
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{name}</span>
                </div>
                {description && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-neutral-500 shrink-0">Descrizione:</span>
                    <span className="text-xs text-neutral-700 dark:text-neutral-300 text-right line-clamp-2">{description}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Valore:</span>
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    € {value ? (parseFloat(value) || 0).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
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
              disabled={step === 1 && !name.trim()}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
            >
              <span>Avanti</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aggiungi al Patrimonio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
