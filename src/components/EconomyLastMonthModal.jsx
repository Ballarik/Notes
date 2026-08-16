import React from 'react';
import { X, Calendar, Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const EconomyLastMonthModal = ({ isOpen, onClose, transactions }) => {
  const { isSidebarOpen } = useWorkspace();

  if (!isOpen) return null;

  // Filter transactions for the last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const lastMonthTransactions = transactions.filter(t => {
    const txDate = new Date(t.date);
    return txDate >= thirtyDaysAgo;
  }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first

  // KPIs for the last 30 days
  const entrate30 = lastMonthTransactions
    .filter(t => t.type === 'entrata')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const uscite30 = lastMonthTransactions
    .filter(t => t.type === 'uscita')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const saldo30 = entrate30 - uscite30;

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
        isSidebarOpen ? 'left-60' : 'left-0'
      }`}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#202020] w-full max-w-4xl rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col p-5 space-y-4 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Riepilogo Ultimo Mese (Ultimi 30 Giorni)
              </h3>
              <p className="text-[11px] text-neutral-400">
                Resoconto dettagliato del saldo, spese, entrate e movimento degli ultimi 30 giorni
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {/* Top KPI Cards (Ultimi 30 gg) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold">Saldo (Ultimi 30 gg)</span>
                <Wallet className="w-4 h-4 text-blue-500" />
              </div>
              <div className={`text-xl font-bold font-mono ${saldo30 >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                € {saldo30.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">Entrate (Ultimi 30 gg)</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +€ {entrate30.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-red-200/60 dark:border-red-950 bg-red-50/20 dark:bg-red-950/20 space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-red-800 dark:text-red-300">Spese (Ultimi 30 gg)</span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400 font-mono">
                -€ {uscite30.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Movimenti degli Ultimi 30 Giorni (Tabella) */}
          <div className="notion-card p-0 overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                Movimenti Registrati negli Ultimi 30 Giorni ({lastMonthTransactions.length})
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold text-xs">
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Motivo / Oggetto</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3 w-full">Note / Descrizione</th>
                    <th className="py-2.5 px-3 text-right">Importo</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {lastMonthTransactions.length > 0 ? (
                    lastMonthTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            tx.type === 'entrata'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          }`}>
                            {tx.type === 'entrata' ? '+ Entrata' : '− Uscita'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                          {tx.description}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium">
                            {tx.category}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-neutral-500 whitespace-nowrap font-mono text-[11px]">
                          {tx.date}
                        </td>

                        <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                          {tx.notes || '—'}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                          <span className={tx.type === 'entrata' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                            {tx.type === 'entrata' ? '+' : '−'}€ {Number(tx.amount).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                        Nessun movimento registrato negli ultimi 30 giorni.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
