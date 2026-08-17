import React, { useState } from 'react';
import { X, Smartphone, Plus, Check, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const RechargeTopUpModal = ({ isOpen, onClose, topUp, onRecharge }) => {
  const { isSidebarOpen } = useWorkspace();
  const [amount, setAmount] = useState('10');
  const [note, setNote] = useState('Ricarica conto');

  if (!isOpen || !topUp) return null;

  const handleClose = () => {
    setAmount('10');
    setNote('Ricarica conto');
    onClose();
  };

  const handleRecharge = (e) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (num <= 0) return;
    onRecharge(topUp.id, num, note.trim() || 'Ricarica conto');
    handleClose();
  };

  const quickAmounts = [5, 10, 15, 20, 30, 50];
  const numAmount = parseFloat(amount) || 0;
  const newProjectedBalance = (parseFloat(topUp.currentBalance) || 0) + numAmount;

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
        isSidebarOpen ? 'left-60' : 'left-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-[#202020] w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col p-5 space-y-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Ricarica Credito: {topUp.name}
              </h3>
              <p className="text-[11px] text-neutral-400">
                Saldo attuale: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">€{Number(topUp.currentBalance).toFixed(2)}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleRecharge} className="space-y-4">
          {/* Quick Amount Buttons */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Seleziona importo rapido:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    amount === amt.toString()
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:border-emerald-500'
                  }`}
                >
                  + € {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Oppure inserisci importo personalizzato (€):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">€</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-sm font-mono font-bold p-2.5 pl-7 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Causale / Note (opzionale):
            </label>
            <input
              type="text"
              placeholder="es. Ricarica mensile tabaccaio, Ricarica online..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Preview after recharge */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Nuovo Saldo dopo ricarica:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              € {newProjectedBalance.toFixed(2)}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={numAmount <= 0}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Conferma Ricarica</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
