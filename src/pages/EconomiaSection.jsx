import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Search, 
  Filter,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const EconomiaSection = () => {
  const { transactions, addTransaction, deleteTransaction } = useWorkspace();

  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Generale');
  const [type, setType] = useState('uscita');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState('tutti');
  const [searchQuery, setSearchQuery] = useState('');

  // Computations
  const totalIncome = transactions
    .filter(t => t.type === 'entrata')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'uscita')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    addTransaction({
      description,
      amount: parseFloat(amount),
      category,
      type,
      date
    });

    setDescription('');
    setAmount('');
    setShowAddForm(false);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'tutti' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesList = Array.from(new Set(transactions.map(t => t.category)));

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-500" />
            <span>Gestione Economia & Finanze</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Tieni traccia delle tue entrate, uscite e budget mensile.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuova Transazione</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo Netto */}
        <div className="notion-card space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Saldo Netto Totale</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            € {netBalance.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400">
            Disponibilità attuale calcolata
          </div>
        </div>

        {/* Total Entrate */}
        <div className="notion-card space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Totale Entrate</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            +€ {totalIncome.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400">
            Incassi registrati
          </div>
        </div>

        {/* Total Uscite */}
        <div className="notion-card space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Totale Uscite</span>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
            -€ {totalExpense.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400">
            Spese complessive
          </div>
        </div>
      </div>

      {/* Add Transaction Form Collapsible */}
      {showAddForm && (
        <form 
          onSubmit={handleSubmit}
          className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4 animate-fade-in"
        >
          <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
            Registra una nuova entrata o spesa
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Descrizione</label>
              <input
                type="text"
                required
                placeholder="es. Libri, Stipendio, Caffè"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Importo (€)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Categoria</label>
              <input
                type="text"
                placeholder="es. Scuola, Trasporti, Svago"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="uscita">Uscita (Spesa)</option>
                <option value="entrata">Entrata (Incasso)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700"
            >
              Aggiungi
            </button>
          </div>
        </form>
      )}

      {/* Transactions Table & Filters */}
      <div className="notion-card space-y-4">
        {/* Table Search & Category Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filtra movimentazioni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs p-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-700 dark:text-neutral-300"
            >
              <option value="tutti">Tutte le Categorie</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium">
                <th className="py-2 px-3">Data</th>
                <th className="py-2 px-3">Descrizione</th>
                <th className="py-2 px-3">Categoria</th>
                <th className="py-2 px-3 text-right">Importo</th>
                <th className="py-2 px-3 text-center">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group">
                    <td className="py-2.5 px-3 text-neutral-400 font-mono text-[11px]">{tx.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800 dark:text-neutral-200">{tx.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-700/50">
                        {tx.category}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                      tx.type === 'entrata' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-800 dark:text-neutral-200'
                    }`}>
                      {tx.type === 'entrata' ? '+' : '-'}€{Number(tx.amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        title="Elimina"
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    Nessuna transazione trovata in questa categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
