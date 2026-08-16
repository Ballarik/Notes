import React, { useState } from 'react';
import { X, Plus, Link2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const DirectLinksModal = ({ 
  isOpen, 
  onClose, 
  onAddLink 
}) => {
  const { isSidebarOpen } = useWorkspace();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    onAddLink({
      name: name.trim(),
      url: formattedUrl
    });

    setName('');
    setUrl('');
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
        className="bg-white dark:bg-[#202020] w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col p-5 space-y-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Aggiungi Collegamento Diretto
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form per Aggiungere Nuovo Collegamento */}
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Nome da Visualizzare
            </label>
            <input
              type="text"
              required
              placeholder="es. Registro Elettronico, Google Classroom..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
              URL Destinazione
            </label>
            <input
              type="text"
              required
              placeholder="es. www.classeviva.spaggiari.eu"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !url.trim()}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Salva Link</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
