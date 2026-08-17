import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { HolidaysManagementModal } from '../components/HolidaysManagementModal';
import { 
  Settings, 
  User, 
  Wallet, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  Sun, 
  Moon, 
  Palette, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Download,
  Upload,
  FileText,
  AlertTriangle
} from 'lucide-react';

export const ImpostazioniSection = () => {
  const { 
    userName, 
    setUserName, 
    initialBaseBalance, 
    setInitialBaseBalance,
    transactions,
    isDarkMode,
    setIsDarkMode,
    subjects,
    addSubject,
    deleteSubject,
    updateSubject,
    holidays = [],
    updateHoliday,
    deleteHoliday,
    saveProjectFile,
    saveStatus,
    lastSaveTime,
    exportWorkspaceData,
    importWorkspaceData
  } = useWorkspace();

  const [inputName, setInputName] = useState(userName || 'Riccardo');
  const [inputBalance, setInputBalance] = useState(initialBaseBalance.toString());
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isHolidaysModalOpen, setIsHolidaysModalOpen] = useState(false);

  // Subjects state for editing
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [editingSubject, setEditingSubject] = useState(null); // { oldName: '', newName: '' }
  const [deleteSubjectState, setDeleteSubjectState] = useState({ open: false, subjectName: null, mousePos: null });

  // Import state
  const [importStatus, setImportStatus] = useState(null); // null | 'success' | 'error'
  const [importError, setImportError] = useState('');
  const [pendingImportData, setPendingImportData] = useState(null); // holds parsed JSON awaiting confirmation
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const importFileRef = React.useRef(null);

  // Calculated totals for preview
  const totalEntrate = transactions
    .filter(t => t.type === 'entrata' && t.description !== 'Saldo Iniziale')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalUscite = transactions
    .filter(t => t.type === 'uscita')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const parsedBase = isNaN(parseFloat(inputBalance)) ? 0 : parseFloat(inputBalance);
  const calculatedTotal = parsedBase + totalEntrate - totalUscite;

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setUserName(inputName.trim() || 'Riccardo');
    setInitialBaseBalance(parsedBase);
    
    await saveProjectFile();
    
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);
  };

  const handleAddSubjectSubmit = (e) => {
    e.preventDefault();
    if (!newSubjectInput.trim()) return;
    addSubject(newSubjectInput.trim());
    setNewSubjectInput('');
  };

  const handleConfirmRenameSubject = (oldName) => {
    if (editingSubject && editingSubject.newName.trim()) {
      updateSubject(oldName, editingSubject.newName.trim());
      setEditingSubject(null);
    }
  };

  const handleConfirmDeleteSubject = () => {
    if (deleteSubjectState.subjectName) {
      deleteSubject(deleteSubjectState.subjectName);
      setDeleteSubjectState({ open: false, subjectName: null, mousePos: null });
    }
  };

  // Import handlers
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        setPendingImportData(parsed);
        setShowImportConfirm(true);
      } catch {
        setImportStatus('error');
        setImportError('Il file selezionato non è un JSON valido.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  const confirmImport = async () => {
    if (!pendingImportData) return;
    const result = importWorkspaceData(pendingImportData);
    setShowImportConfirm(false);
    setPendingImportData(null);
    if (result.success) {
      setImportStatus('success');
      // Sync the local form inputs with newly imported values
      if (typeof pendingImportData?.userName === 'string') setInputName(pendingImportData.userName);
      if (typeof pendingImportData?.initialBaseBalance === 'number') setInputBalance(pendingImportData.initialBaseBalance.toString());
      setTimeout(() => setImportStatus(null), 4000);
    } else {
      setImportStatus('error');
      setImportError(result.error || 'Errore sconosciuto durante l\'importazione.');
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  return (
    <div className="w-full px-4 md:px-8 pt-5 pb-16 mb-12 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-500" />
            <span>Impostazioni Workspace</span>
          </h1>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Gestisci il tuo nome utente, il saldo base, le materie scolastiche, il tema dell'app e il salvataggio.
          </p>
        </div>

        {showSavedToast && (
          <div className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Impostazioni salvate nel progetto!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Settings Form */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-7 space-y-6">
          {/* Card 1: Nome Utente */}
          <div className="notion-card p-5 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <User className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Nome Utente e Saluto
              </h2>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Nome da visualizzare nella Home Dashboard:
              </label>
              <input
                type="text"
                required
                placeholder="es. Riccardo"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
              />
              <p className="text-[11px] text-neutral-400">
                Questo nome comparirà nel titolo principale della tua schermata iniziale (es. 👋 Benvenuto {inputName || 'Riccardo'}).
              </p>
            </div>
          </div>

          {/* Card 2: Saldo Economico Base */}
          <div className="notion-card p-5 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Saldo Economico Iniziale (Base)
              </h2>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Saldo Iniziale / Base di Partenza (€):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">
                  €
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="840.00"
                  value={inputBalance}
                  onChange={(e) => setInputBalance(e.target.value)}
                  className="w-full text-xs p-2.5 pl-7 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Questo importo è il tuo patrimonio di base di partenza. Le entrate salvate verranno sommate a questo importo e le uscite verranno sottratte.
              </p>
            </div>
          </div>

          {/* Card 3: Gestione Materie Scolastiche */}
          <div className="notion-card p-5 space-y-4 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Materie Scolastiche ({subjects.length})
                </h2>
              </div>
            </div>

            {/* Input per aggiungere nuova materia */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Aggiungi nuova materia (es. Diritto, Economia...)"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubjectSubmit(e);
                  }
                }}
                className="flex-1 text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddSubjectSubmit}
                disabled={!newSubjectInput.trim()}
                className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi</span>
              </button>
            </div>

            {/* Elenco Materie Esistenti */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {subjects.map((s) => {
                const isEditing = editingSubject?.oldName === s;

                return (
                  <div
                    key={s}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs font-semibold group hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1 mr-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingSubject.newName}
                          onChange={(e) => setEditingSubject({ ...editingSubject, newName: e.target.value })}
                          className="flex-1 text-xs p-1.5 rounded border border-purple-400 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleConfirmRenameSubject(s)}
                          className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          title="Conferma rinomina"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSubject(null)}
                          className="p-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded hover:bg-neutral-300 transition-colors"
                          title="Annulla"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-neutral-800 dark:text-neutral-200 font-semibold truncate">
                        {s}
                      </span>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setEditingSubject({ oldName: s, newName: s })}
                          className="p-1 text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400 rounded transition-colors"
                          title="Rinomina materia"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => setDeleteSubjectState({ open: true, subjectName: s, mousePos: { x: e.clientX, y: e.clientY } })}
                          className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                          title="Elimina materia"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Gestione Vacanze & Festività */}
          <div className="notion-card p-5 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Vacanze & Festività ({holidays.length})
                </h2>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Visualizza l'elenco completo delle vacanze salvate, modifica i loro nomi o rimuovile dal calendario.
              </p>
              <button
                type="button"
                onClick={() => setIsHolidaysModalOpen(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Gestisci Vacanze ({holidays.length})</span>
              </button>
            </div>
          </div>

          {/* Card 4: Tema Chiaro / Scuro */}
          <div className="notion-card p-5 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <Palette className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Tema Applicazione
              </h2>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-purple-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    {isDarkMode ? 'Modalità Scura (Dark Mode)' : 'Modalità Chiara (Light Mode)'}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Cambia l'aspetto visivo dell'intera piattaforma
                  </div>
                </div>
              </div>

              <div className="flex items-center p-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setIsDarkMode(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${
                    !isDarkMode
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chiaro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDarkMode(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${
                    isDarkMode
                      ? 'bg-[#202020] text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Scuro</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Button: Salva nel Progetto */}
          <div className="notion-card p-5 space-y-3 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Save className="w-4 h-4 text-blue-500" />
                  <span>Salvataggio File Progetto</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                  File fisico: <span className="text-emerald-500 font-semibold">project_data/workspace_data.json ({lastSaveTime})</span>
                </p>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Salvataggio...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salva Impostazioni & Progetto</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 5: Esporta / Importa Dati */}
          <div className="notion-card p-5 space-y-4 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <FileText className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Esporta / Importa Dati
              </h2>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Scarica un backup completo dei tuoi dati in formato <span className="font-semibold text-neutral-600 dark:text-neutral-300">.json</span>, oppure importa un backup esistente per ripristinare materie, voti, pagine, saldo, patrimonio/oggetti, ricariche, categorie, transazioni, scadenze, vacanze, collegamenti e orario.
            </p>

            {/* Toast feedback */}
            {importStatus === 'success' && (
              <div className="px-3 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Dati importati con successo!</span>
              </div>
            )}
            {importStatus === 'error' && (
              <div className="px-3 py-2 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs font-bold rounded-lg border border-red-300 dark:border-red-800 flex items-center gap-1.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>{importError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Export Button */}
              <button
                type="button"
                onClick={exportWorkspaceData}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Esporta Backup (.json)</span>
              </button>

              {/* Import Button */}
              <input
                ref={importFileRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => importFileRef.current?.click()}
                className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-neutral-300/80 dark:border-neutral-700 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Importa Backup (.json)</span>
              </button>
            </div>

            <div className="text-[10px] text-neutral-400 leading-relaxed space-y-0.5">
              <div>📦 <strong>Esporta</strong> — Scarica: materie, voti, pagine personali, saldo, patrimonio/beni, ricariche, categorie, transazioni (ultimi 90gg), scadenze in sospeso, vacanze, collegamenti diretti, orario lezioni.</div>
              <div>📥 <strong>Importa</strong> — Carica un file <code>.json</code> precedentemente esportato per ripristinare tutti i dati.</div>
            </div>
          </div>
        </form>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="notion-card p-5 space-y-4 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800 pb-2">
              Anteprima in Tempo Reale
            </h2>

            {/* Preview Banner */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                Saluto Home Dashboard
              </span>
              <div className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>👋</span> Benvenuto {inputName.trim() || 'Riccardo'}
              </div>
            </div>

            {/* Preview Balance */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Calcolo Saldo Totale Attuale
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-neutral-500">Saldo Iniziale Base:</span>
                <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                  € {parsedBase.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-emerald-600 dark:text-emerald-400">+ Entrate registrate:</span>
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  +€ {totalEntrate.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-red-500">- Uscite registrate:</span>
                <span className="text-xs font-mono font-semibold text-red-500">
                  -€ {totalUscite.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Saldo Finale risultante:</span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  € {calculatedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Preview Holidays */}
            <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
                  Vacanze Registrate
                </span>
                <span className="text-xs font-bold font-mono text-orange-600 dark:text-orange-400">
                  {holidays.length}
                </span>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-300">
                {holidays.length === 0 ? 'Nessuna vacanza salvata' : `${holidays.length} ${holidays.length === 1 ? 'giorno festivo' : 'giorni festivi'} impostati`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Conferma Eliminazione Materia */}
      <DeleteConfirmModal
        isOpen={deleteSubjectState.open}
        onClose={() => setDeleteSubjectState({ open: false, subjectName: null, mousePos: null })}
        onConfirm={handleConfirmDeleteSubject}
        mousePos={deleteSubjectState.mousePos}
        itemTitle={deleteSubjectState.subjectName ? `la materia "${deleteSubjectState.subjectName}"` : ''}
      />

      {/* Modal Gestione Vacanze */}
      <HolidaysManagementModal
        isOpen={isHolidaysModalOpen}
        onClose={() => setIsHolidaysModalOpen(false)}
        holidays={holidays}
        onUpdateHoliday={updateHoliday}
        onDeleteHoliday={deleteHoliday}
      />
      {/* Import confirmation modal */}
      {showImportConfirm && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
          onClick={() => { setShowImportConfirm(false); setPendingImportData(null); }}
        >
          <div 
            className="bg-white dark:bg-[#202020] w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default p-5 space-y-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-950">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Conferma Importazione</h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">I dati attuali verranno sovrascritti</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Stai per importare un backup che sovrascriverà le materie, i voti, le pagine, il saldo, il patrimonio/oggetti, le ricariche, le categorie, le transazioni, le scadenze, le vacanze, i collegamenti e l'orario attualmente salvati. Vuoi continuare?
            </p>

            {pendingImportData?._meta?.exportedAt && (
              <div className="text-[10px] font-mono text-neutral-400 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                Backup del: {new Date(pendingImportData._meta.exportedAt).toLocaleString('it-IT')}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowImportConfirm(false); setPendingImportData(null); }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={confirmImport}
                className="flex-1 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Importa e Sovrascrivi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
