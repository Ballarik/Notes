import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  PanelLeft, 
  Search, 
  Moon, 
  Sun, 
  Home, 
  Wallet, 
  GraduationCap, 
  Calendar as CalendarIcon,
  FileText,
  Clock
} from 'lucide-react';

export const Header = () => {
  const { 
    activeTab, 
    activePageId, 
    customPages, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    isDarkMode, 
    setIsDarkMode,
    setIsSearchOpen 
  } = useWorkspace();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'home':
        return { title: 'Home Dashboard', icon: <Home className="w-4 h-4" /> };
      case 'economia':
        return { title: 'Gestione Economia & Finanze', icon: <Wallet className="w-4 h-4" /> };
      case 'scuola':
        return { title: 'Scuola & Studio', icon: <GraduationCap className="w-4 h-4" /> };
      case 'calendario':
        return { title: 'Calendario Eventi', icon: <CalendarIcon className="w-4 h-4" /> };
      case 'custom_page':
        const page = customPages.find(p => p.id === activePageId);
        return { 
          title: page ? page.title : 'Pagina Personalizzata', 
          icon: <span className="text-sm">{page?.icon || '📄'}</span> 
        };
      default:
        return { title: 'Workspace', icon: <FileText className="w-4 h-4" /> };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-12 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md sticky top-0 z-20 px-3 flex items-center justify-between">
      {/* Left side: Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-2 overflow-hidden">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            title="Espandi menù"
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 truncate">
          <span className="text-neutral-400 dark:text-neutral-600">Personal Workspace</span>
          <span>/</span>
          <div className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 font-semibold truncate">
            {breadcrumb.icon}
            <span className="truncate">{breadcrumb.title}</span>
          </div>
        </div>
      </div>

      {/* Right side: Theme Toggle */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Passa alla modalità chiara' : 'Passa alla modalità scura'}
          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
        </button>
      </div>
    </header>
  );
};
