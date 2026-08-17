import React, { useState, useEffect } from 'react';
import { X, Smartphone, Check, Edit2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const EditTopUpModal = ({ isOpen, onClose, topUp, onUpdateTopUp }) => {
  const { isSidebarOpen } = useWorkspace();
  const [name, setName] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [renewalDay, setRenewalDay] = useState('1');

  useEffect(() => {
    if (topUp) {
      setName(topUp.name || '');
      setCurrentBalance(topUp.currentBalance !== undefined ? topUp.currentBalance.toString() : '0');
      setMonthlyCost(topUp.monthlyCost !== undefined ? topUp.monthlyCost.toString() : '0');
      setRenewalDay(topUp.renewalDay !== undefined ? topUp.renewalDay.toString() : '1');
    }
  }, [topUp, isOpen]);

  if (!isOpen || !topUp) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateTopUp(topUp.id, {
      name: name.trim(),
      currentBalance: parseFloat(currentBalance) || 0,
      monthlyCost: parseFloat(monthlyCost) || 0,
      renewalDay: Math.min(31, Math.max(1, parseInt(renewalDay, 10) || 1))
    });

    onClose();
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
        isSidebarOpen ? 'left-60' : 'left-0'
      }`}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#202020] w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col p-5 space-y-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Modifica Parametri Ricarica
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Nome del servizio:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Saldo Attuale (€):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                className="w-full text-sm font-mono font-bold p-2.5 pl-7 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Costo Mensile (€/mese):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(e.target.value)}
                className="w-full text-sm font-mono font-bold p-2.5 pl-7 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Giorno del mese di rinnovo (1 - 31):
            </label>
            <input
              type="number"
              min="1"
              max="31"
              required
              value={renewalDay}
              onChange={(e) => setRenewalDay(e.target.value)}
              className="w-full text-sm font-mono font-bold p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salva Modifiche</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
