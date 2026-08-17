import React, { useState } from 'react';
import { X, Sun, Trash2, Edit2, Check } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const HolidaysManagementModal = ({ 
  isOpen, 
  onClose, 
  holidays = [], 
  onUpdateHoliday, 
  onDeleteHoliday 
}) => {
  const { isSidebarOpen } = useWorkspace();
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deleteState, setDeleteState] = useState({ open: false, holiday: null, mousePos: null });

  if (!isOpen) return null;

  // Sort holidays chronologically
  const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleStartEdit = (h) => {
    setEditingId(h.id);
    setEditingName(h.name);
  };

  const handleSaveEdit = (id) => {
    if (!editingName.trim()) return;
    onUpdateHoliday(id, { name: editingName.trim() });
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleConfirmDelete = () => {
    if (deleteState.holiday) {
      onDeleteHoliday(deleteState.holiday.id);
      setDeleteState({ open: false, holiday: null, mousePos: null });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('it-IT', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
          isSidebarOpen ? 'left-60' : 'left-0'
        }`}
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-[#202020] w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col p-5 space-y-4 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Gestione Vacanze ({holidays.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: List of Holidays */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {sortedHolidays.length > 0 ? (
              sortedHolidays.map((h) => {
                const isEditing = editingId === h.id;

                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs transition-all group hover:border-orange-300 dark:hover:border-orange-800"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <span className="font-mono text-[11px] font-semibold text-neutral-400 shrink-0">
                          {h.date}:
                        </span>
                        <input
                          type="text"
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(h.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="flex-1 text-xs p-1.5 rounded-lg border border-orange-400 dark:border-orange-600 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(h.id)}
                          disabled={!editingName.trim()}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors cursor-pointer"
                          title="Salva modifiche"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors cursor-pointer"
                          title="Annulla"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-mono text-[11px] font-bold shrink-0">
                          {formatDate(h.date)}
                        </span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate">
                          {h.name}
                        </span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(h)}
                          className="p-1.5 text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer"
                          title="Modifica nome vacanza"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => setDeleteState({ open: true, holiday: h, mousePos: { x: e.clientX, y: e.clientY } })}
                          className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Elimina vacanza"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-neutral-400 italic bg-neutral-50 dark:bg-neutral-900/30 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                Nessuna vacanza registrata. Puoi aggiungerne dalla pagina Calendario.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal for Holidays */}
      <DeleteConfirmModal
        isOpen={deleteState.open}
        onClose={() => setDeleteState({ open: false, holiday: null, mousePos: null })}
        onConfirm={handleConfirmDelete}
        mousePos={deleteState.mousePos}
        itemTitle={deleteState.holiday ? `la vacanza "${deleteState.holiday.name}" (${deleteState.holiday.date})` : ''}
      />
    </>
  );
};
