import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { CategoryManagementModal } from '../components/CategoryManagementModal';
import { EconomyPieChartsModal } from '../components/EconomyPieChartsModal';
import { EconomyLastMonthModal } from '../components/EconomyLastMonthModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { EconomyChart } from '../components/EconomyChart';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Tag, 
  Calendar,
  Filter,
  PieChart as PieIcon,
  Clock
} from 'lucide-react';

export const EconomiaSection = () => {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction,
    economyCategories,
    addEconomyCategory,
    deleteEconomyCategory,
    initialBaseBalance = 840.00
  } = useWorkspace();

  const [selectedCategory, setSelectedCategory] = useState('tutti');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isPieModalOpen, setIsPieModalOpen] = useState(false);
  const [isLastMonthModalOpen, setIsLastMonthModalOpen] = useState(false);
  const [deleteTxState, setDeleteTxState] = useState({ open: false, tx: null, mousePos: null });

  // Stats Calculations
  const totalEntrate = transactions
    .filter(t => t.type === 'entrata' && t.description !== 'Saldo Iniziale')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalUscite = transactions
    .filter(t => t.type === 'uscita')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const saldoTotale = initialBaseBalance + totalEntrate - totalUscite;

  // Filtered transactions list
  const filteredTransactions = selectedCategory === 'tutti' 
    ? transactions 
    : transactions.filter(t => t.category === selectedCategory);

  const handleConfirmDeleteTx = () => {
    if (deleteTxState.tx) {
      deleteTransaction(deleteTxState.tx.id);
      setDeleteTxState({ open: false, tx: null, mousePos: null });
    }
  };

  return (
    <div className="w-full px-4 md:px-8 pt-5 pb-16 mb-12 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-500" />
            <span>Economia & Finanze</span>
          </h1>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Gestisci entrate, uscite e monitora il tuo saldo personale.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Gestisci Categorie Button */}
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-200 dark:border-neutral-700"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Gestisci Categorie</span>
          </button>

          {/* Grafici Button */}
          <button
            onClick={() => setIsPieModalOpen(true)}
            className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border border-purple-200 dark:border-purple-800"
          >
            <PieIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Grafici</span>
          </button>

          {/* Ultimo Mese Button */}
          <button
            onClick={() => setIsLastMonthModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-200 dark:border-blue-800"
          >
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ultimo Mese</span>
          </button>

          {/* Nuova Transazione Button */}
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuova Transazione</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Full Width) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        {/* Saldo Totale */}
        <div className="notion-card p-3.5 space-y-1 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold">Saldo Totale</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-bold font-mono ${saldoTotale >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            € {saldoTotale.toFixed(2)}
          </div>
        </div>

        {/* Totale Entrate */}
        <div className="notion-card p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold">Totale Entrate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            +€ {totalEntrate.toFixed(2)}
          </div>
        </div>

        {/* Totale Uscite */}
        <div className="notion-card p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold">Totale Uscite</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
            -€ {totalUscite.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Grafico Movimenti Finanziari (Ultimi 90 Giorni) */}
      <EconomyChart transactions={transactions} initialBaseBalance={initialBaseBalance} />

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none w-full">
        <span className="text-xs font-semibold text-neutral-400 mr-1 shrink-0 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Filtra:
        </span>
        
        <button
          onClick={() => setSelectedCategory('tutti')}
          className={`px-3 py-1 text-xs font-semibold rounded-md shrink-0 transition-all ${
            selectedCategory === 'tutti'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
          }`}
        >
          Tutti ({transactions.length})
        </button>

        {economyCategories.map(cat => {
          const count = transactions.filter(t => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-md shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Full-Width Transactions Table */}
      <div className="w-full notion-card p-0 overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold select-none text-xs">
                <th className="py-2 px-3 whitespace-nowrap w-auto">Tipo</th>
                <th className="py-2 px-3 whitespace-nowrap w-auto">Motivo / Oggetto</th>
                <th className="py-2 px-3 whitespace-nowrap w-auto">Categoria</th>
                <th className="py-2 px-3 whitespace-nowrap w-auto">Data</th>
                <th className="py-2 px-3 w-full">Note / Descrizione</th>
                <th className="py-2 px-3 text-right whitespace-nowrap w-auto">Importo</th>
                <th className="py-2 px-3 text-center whitespace-nowrap w-auto">Azione</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group">
                    {/* Tipo Badge */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        tx.type === 'entrata'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}>
                        {tx.type === 'entrata' ? '+ Entrata' : '− Uscita'}
                      </span>
                    </td>

                    {/* Motivo */}
                    <td className="py-2 px-3 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {tx.description}
                    </td>

                    {/* Categoria */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium">
                        {tx.category}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="py-2 px-3 text-neutral-500 whitespace-nowrap font-mono text-[11px]">
                      {tx.date}
                    </td>

                    {/* Note / Descrizione */}
                    <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400">
                      {tx.notes || '—'}
                    </td>

                    {/* Importo */}
                    <td className="py-2 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={tx.type === 'entrata' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {tx.type === 'entrata' ? '+' : '−'}€ {Number(tx.amount).toFixed(2)}
                      </span>
                    </td>

                    {/* Azione Elimina */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => setDeleteTxState({ open: true, tx, mousePos: { x: e.clientX, y: e.clientY } })}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 rounded transition-opacity"
                        title="Elimina transazione"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-neutral-400">
                    Nessuna transazione trovata per questa categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Wizard Modal */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        categories={economyCategories}
        onAddTransaction={addTransaction}
      />

      {/* Category Management Modal */}
      <CategoryManagementModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={economyCategories}
        onAddCategory={addEconomyCategory}
        onDeleteCategory={deleteEconomyCategory}
      />

      {/* Pie Charts Modal (Grafici) */}
      <EconomyPieChartsModal
        isOpen={isPieModalOpen}
        onClose={() => setIsPieModalOpen(false)}
        transactions={transactions}
        categories={economyCategories}
      />

      {/* Last Month Summary Modal (Ultimo Mese) */}
      <EconomyLastMonthModal
        isOpen={isLastMonthModalOpen}
        onClose={() => setIsLastMonthModalOpen(false)}
        transactions={transactions}
      />

      {/* Delete Confirmation Modal for Transactions */}
      <DeleteConfirmModal
        isOpen={deleteTxState.open}
        onClose={() => setDeleteTxState({ open: false, tx: null, mousePos: null })}
        onConfirm={handleConfirmDeleteTx}
        mousePos={deleteTxState.mousePos}
        itemTitle={deleteTxState.tx ? `${deleteTxState.tx.description} (€${Number(deleteTxState.tx.amount).toFixed(2)})` : ''}
      />
    </div>
  );
};
