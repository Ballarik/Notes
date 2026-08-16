import React, { useState } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const CategoryManagementModal = ({ 
  isOpen, 
  onClose, 
  categories, 
  onAddCategory, 
  onDeleteCategory 
}) => {
  const { isSidebarOpen } = useWorkspace();
  const [newCatName, setNewCatName] = useState('');
  const [deleteCatState, setDeleteCatState] = useState({ open: false, cat: null, mousePos: null });

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
  };

  const handleConfirmDeleteCat = () => {
    if (deleteCatState.cat) {
      onDeleteCategory(deleteCatState.cat);
      setDeleteCatState({ open: false, cat: null, mousePos: null });
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
          className="bg-white dark:bg-[#202020] w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col p-5 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Gestione Categorie Economia
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Add New Category Form */}
          <form onSubmit={handleAdd} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="es. Palestra, Viaggi, Hobby"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi</span>
            </button>
          </form>

          {/* Categories List */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pt-1">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Categorie Esistenti ({categories.length})
            </div>
            {categories.map((cat) => (
              <div 
                key={cat}
                className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs font-medium text-neutral-800 dark:text-neutral-200 group"
              >
                <span>{cat}</span>
                <button
                  onClick={(e) => setDeleteCatState({ open: true, cat, mousePos: { x: e.clientX, y: e.clientY } })}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 rounded transition-opacity"
                  title="Elimina categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
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

      {/* Delete Confirmation Modal for Categories */}
      <DeleteConfirmModal
        isOpen={deleteCatState.open}
        onClose={() => setDeleteCatState({ open: false, cat: null, mousePos: null })}
        onConfirm={handleConfirmDeleteCat}
        mousePos={deleteCatState.mousePos}
        itemTitle={deleteCatState.cat ? `la categoria "${deleteCatState.cat}"` : ''}
      />
    </>
  );
};
