import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Search, 
  Home, 
  Wallet, 
  GraduationCap, 
  Calendar, 
  FileText, 
  Plus, 
  X, 
  ArrowRight 
} from 'lucide-react';

export const CommandMenu = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    navigateTo, 
    customPages, 
    createCustomPage 
  } = useWorkspace();

  const [query, setQuery] = useState('');

  // Handle keyboard shortcut ⌘K / Ctrl+K & Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const items = [
    { id: 'home', title: 'Home Dashboard', type: 'sezione', icon: <Home className="w-4 h-4 text-blue-500" />, action: () => navigateTo('home') },
    { id: 'economia', title: 'Gestione Economia & Finanze', type: 'sezione', icon: <Wallet className="w-4 h-4 text-emerald-500" />, action: () => navigateTo('economia') },
    { id: 'scuola', title: 'Scuola & Studio', type: 'sezione', icon: <GraduationCap className="w-4 h-4 text-amber-500" />, action: () => navigateTo('scuola') },
    { id: 'calendario', title: 'Calendario Eventi', type: 'sezione', icon: <Calendar className="w-4 h-4 text-purple-500" />, action: () => navigateTo('calendario') },
    ...customPages.map(p => ({
      id: p.id,
      title: p.title || 'Pagina Senza Titolo',
      type: 'pagina',
      icon: <span className="text-sm">{p.icon || '📄'}</span>,
      action: () => navigateTo('custom_page', p.id)
    }))
  ];

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fade-in cursor-pointer"
      onClick={() => setIsSearchOpen(false)}
    >
      <div 
        className="bg-white dark:bg-[#202020] w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="flex items-center px-3 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Digita per cercare sezioni o pagine..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full py-3 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsSearchOpen(false);
                  setQuery('');
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <div>
                    <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      {item.type}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-neutral-400">
              Nessuna pagina trovata per "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <button
            onClick={() => {
              createCustomPage();
              setIsSearchOpen(false);
              setQuery('');
            }}
            className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>Crea nuova pagina</span>
          </button>
          <span>Premi <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded text-[10px]">ESC</kbd> per chiudere</span>
        </div>
      </div>
    </div>
  );
};
