import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Calendar as CalendarIcon } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AppleDatePicker } from './AppleDatePicker';

export const AddTransactionModal = ({ isOpen, onClose, categories, onAddTransaction }) => {
  const { isSidebarOpen } = useWorkspace();
  const [step, setStep] = useState(1); // 1: Categoria, 2: Motivo, 3: Descrizione, 4: Data, 5: Importo & Segno

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountInput, setAmountInput] = useState('');
  const [isPositive, setIsPositive] = useState(false); // Default: false (-) per Uscita / spesa

  if (!isOpen) return null;

  const handleSelectCategory = (cat) => {
    setCategory(cat);
    setStep(2);
  };

  const toggleSign = () => {
    setIsPositive(prev => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !title || !amountInput) return;

    const numericAmount = Math.abs(parseFloat(amountInput.replace(',', '.'))) || 0;
    const finalType = isPositive ? 'entrata' : 'uscita';

    onAddTransaction({
      description: title,
      notes: description,
      category,
      amount: numericAmount,
      type: finalType,
      date: selectedDate
    });

    // Reset & Close
    setStep(1);
    setCategory('');
    setTitle('');
    setDescription('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setAmountInput('');
    setIsPositive(false);
    onClose();
  };

  const totalSteps = 5;
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
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Passaggio {step} di {totalSteps}
              </span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {step === 1 && '1. Seleziona la Categoria'}
                {step === 2 && '2. Motivo Transazione'}
                {step === 3 && '3. Descrizione'}
                {step === 4 && '4. Seleziona Data'}
                {step === 5 && '5. Importo & Segno (+ / -)'}
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
              className="bg-emerald-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal Body content per Step */}
        <div className="p-5 flex-1 overflow-y-auto max-h-[420px]">
          {/* STEP 1: Selezione Categoria */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Clicca su una categoria per proseguire:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => handleSelectCategory(c)}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold text-neutral-800 dark:text-neutral-200 text-left transition-all hover:scale-[1.02]"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Motivo */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Motivo / Titolo della transazione
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="es. Spesa Esselunga, Stipendio Lavoretto, Ricarica Mezzi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                placeholder="es. Acquisto alimentari per la settimana, ricevuta N. 481..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* STEP 4: Seleziona Data (Apple Scroll Wheel) */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                <span>Seleziona la data della transazione</span>
              </div>

              <AppleDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                themeColor="emerald"
              />
            </div>
          )}

          {/* STEP 5: Importo & Toggle Segno (+ / -) */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-in text-center">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Inserisci l'importo e imposta il segno (+ Entrata / - Uscita)
              </span>

              {/* Input dell'Importo con Toggle Segno (+) / (-) */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={toggleSign}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-xl shadow-md transition-all scale-105 active:scale-95 ${
                    isPositive
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={isPositive ? 'Entrata (+) - Clicca per cambiare in Uscita (-)' : 'Uscita (-) - Clicca per cambiare in Entrata (+)'}
                >
                  {isPositive ? '+' : '−'}
                </button>

                <div className="relative flex-1 max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                    €
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    autoFocus
                    placeholder="0.00"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full text-lg font-bold font-mono pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Indicatore visivo */}
              <div className={`p-3 rounded-xl border inline-block text-xs font-bold ${
                isPositive 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
              }`}>
                Tipo: {isPositive ? '+ ENTRATA (Guadagno)' : '− USCITA (Spesa)'}
              </div>
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
              disabled={step === 1 && !category}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              <span>Avanti</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!amountInput}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salva Transazione</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
