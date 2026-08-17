import React, { useState } from 'react';
import { X, Smartphone, Check, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const AddTopUpModal = ({ isOpen, onClose, onAddTopUp }) => {
  const { isSidebarOpen } = useWorkspace();
  const [step, setStep] = useState(1); // 1: Nome, 2: Saldo Attuale, 3: Costo Mensile, 4: Giorno Rinnovo
  const [name, setName] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [renewalDay, setRenewalDay] = useState('1');

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setName('');
    setCurrentBalance('');
    setMonthlyCost('');
    setRenewalDay('1');
    onClose();
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    const numBal = parseFloat(currentBalance) || 0;
    const numCost = parseFloat(monthlyCost) || 0;
    const numDay = Math.min(31, Math.max(1, parseInt(renewalDay, 10) || 1));

    onAddTopUp({
      name: name.trim(),
      currentBalance: numBal,
      monthlyCost: numCost,
      renewalDay: numDay
    });

    handleClose();
  };

  const totalSteps = 4;
  const progressPercent = (step / totalSteps) * 100;

  const numBal = parseFloat(currentBalance) || 0;
  const numCost = parseFloat(monthlyCost) || 0;
  const monthsCovered = numCost > 0 ? Math.floor(numBal / numCost) : 0;

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
                {step === 1 && '1. Nome del Servizio'}
                {step === 2 && '2. Saldo Attuale'}
                {step === 3 && '3. Costo Mensile'}
                {step === 4 && '4. Giorno di Rinnovo'}
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
          {/* STEP 1: Nome Servizio */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Nome del servizio o della ricarica:
              </label>
              <input
                type="text"
                autoFocus
                placeholder="es. SIM Telefono (Iliad), Vodafone, Scheda Bus..."
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
                Inserisci l'etichetta del servizio o scheda prepagata che desideri tracciare.
              </p>
            </div>
          )}

          {/* STEP 2: Saldo Attuale */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Inserisci Saldo Attuale per <span className="text-emerald-600 dark:text-emerald-400 font-bold">"{name}"</span> (€):
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
                    placeholder="es. 15.98"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setStep(3);
                      }
                    }}
                    className="w-full text-sm font-mono font-bold p-3 pl-8 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Informative banner on separate balance */}
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Conto Indipendente:</strong> Questo saldo è gestito in un conto separato dedicato. Ogni mese il costo verrà scalato da qui e <em>non</em> dal tuo denaro principale.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Costo Mensile */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Inserisci Costo Mensile per <span className="text-emerald-600 dark:text-emerald-400 font-bold">"{name}"</span> (€/mese):
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
                    placeholder="es. 7.99"
                    value={monthlyCost}
                    onChange={(e) => setMonthlyCost(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && monthlyCost) {
                        e.preventDefault();
                        setStep(4);
                      }
                    }}
                    className="w-full text-sm font-mono font-bold p-3 pl-8 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  L'importo del canone mensile che viene scalato automaticamente ogni mese al giorno di rinnovo.
                </p>
              </div>

              {numBal > 0 && numCost > 0 && (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Saldo Attuale Impostato:</span>
                    <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">€ {numBal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Costo Mensile Canone:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">€ {numCost.toFixed(2)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between font-bold">
                    <span className="text-neutral-700 dark:text-neutral-300">Autonomia con saldo attuale:</span>
                    <span className={`font-mono ${monthsCovered > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {monthsCovered} {monthsCovered === 1 ? 'mese coperto' : 'mesi coperti'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Giorno di Rinnovo */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Inserisci Giorno di Rinnovo (Giorno del mese, 1 - 31):
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      autoFocus
                      placeholder="es. 24"
                      value={renewalDay}
                      onChange={(e) => setRenewalDay(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      className="w-full text-base font-mono font-bold p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="text-xs text-neutral-500 font-medium shrink-0">
                    di ogni mese
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Ogni mese in questo giorno specifico verrà scalato il costo mensile dal saldo della ricarica.
                </p>
              </div>

              {/* Riepilogo Completo */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Riepilogo Nuova Ricarica
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Servizio / Nome:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Saldo Iniziale:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">€ {numBal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Costo Mensile:</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">€ {numCost.toFixed(2)} / mese</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-neutral-600 dark:text-neutral-400 font-semibold">Giorno di Rinnovo:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Ogni mese il {renewalDay || 1}
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
              disabled={(step === 1 && !name.trim()) || (step === 3 && !monthlyCost)}
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
              <span>Salva Ricarica</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
