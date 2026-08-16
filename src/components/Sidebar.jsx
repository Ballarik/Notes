import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Home, 
  Wallet, 
  GraduationCap, 
  Calendar, 
  Plus, 
  Search, 
  PanelLeftClose, 
  Trash2,
  BookOpen,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    activeTab, 
    activePageId, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    customPages, 
    createCustomPage, 
    deleteCustomPage, 
    navigateTo,
    setIsSearchOpen
  } = useWorkspace();

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-60 h-screen bg-[#fbfbfa] dark:bg-[#202020] border-r border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between select-none shrink-0 transition-all duration-200 z-30">
      {/* Upper Area: Workspace Switcher & Main Links */}
      <div className="p-2 space-y-3 overflow-y-auto">
        {/* Workspace Title & Collapse */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shadow-xs">
              N
            </div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
              Notion Workspace
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            title="Chiudi menù laterale"
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-300/60 dark:hover:bg-neutral-700 text-neutral-500 transition-all"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Search */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span>Cerca rapida</span>
          </div>
          <kbd className="text-[10px] text-neutral-400 bg-neutral-200/50 dark:bg-neutral-800 px-1 rounded font-mono">⌘K</kbd>
        </button>

        {/* Main Sections Header */}
        <div className="pt-2">
          <div className="px-2 text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase mb-1">
            Sezioni Principali
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => navigateTo('home')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'home' 
                  ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Home className="w-4 h-4 text-neutral-500" />
              <span>Home Dashboard</span>
            </button>

            <button
              onClick={() => navigateTo('economia')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'economia' 
                  ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span>Economia & Finanze</span>
            </button>

            <button
              onClick={() => navigateTo('scuola')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'scuola' 
                  ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span>Scuola & Studio</span>
            </button>

            <button
              onClick={() => navigateTo('calendario')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'calendario' 
                  ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>Calendario</span>
            </button>
          </nav>
        </div>

        {/* Custom Pages Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
              Pagine Personali
            </span>
            <button
              onClick={createCustomPage}
              title="Nuova pagina"
              className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {customPages.map(page => (
              <div 
                key={page.id}
                className={`group flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                  activeTab === 'custom_page' && activePageId === page.id
                    ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                }`}
                onClick={() => navigateTo('custom_page', page.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-sm shrink-0">{page.icon || '📄'}</span>
                  <span className="truncate">{page.title || 'Senza titolo'}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCustomPage(page.id);
                  }}
                  title="Elimina pagina"
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            <button
              onClick={createCustomPage}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi una pagina</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="p-2 border-t border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-2 p-2 rounded-md bg-neutral-100 dark:bg-neutral-800/60 text-xs text-neutral-500 dark:text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Notion Workspace v1.0</span>
        </div>
      </div>
    </aside>
  );
};
