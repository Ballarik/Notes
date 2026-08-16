import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext();

const INITIAL_BASE_BALANCE = 840.00;

const initialEconomyData = [
  { id: '1', date: '2026-08-15', description: 'Libri Scolastici', amount: 85.00, category: 'Scuola', type: 'uscita' },
  { id: '2', date: '2026-08-14', description: 'Stipendio Lavoretto', amount: 350.00, category: 'Stipendio', type: 'entrata' },
  { id: '3', date: '2026-08-12', description: 'Abbonamento Mezzi', amount: 35.00, category: 'Trasporti', type: 'uscita' },
  { id: '4', date: '2026-08-10', description: 'Cancelleria & Quaderni', amount: 18.50, category: 'Scuola', type: 'uscita' },
];

const initialSchoolData = [
  { id: 's1', subject: 'Matematica', title: 'Verifica Integrali e Derivate', date: '2026-09-10', status: 'da_fare', priority: 'Alta' },
  { id: 's2', subject: 'Informatica', title: 'Progetto React / Notion Web App', date: '2026-08-20', status: 'in_corso', priority: 'Media' },
  { id: 's3', subject: 'Fisica', title: 'Relazione Elettromagnetismo', date: '2026-08-18', status: 'completato', priority: 'Alta' },
  { id: 's4', subject: 'Italiano', title: 'Analisi del Testo - Divina Commedia', date: '2026-09-05', status: 'da_fare', priority: 'Bassa' },
];

const initialGradesData = [];



const initialCalendarEvents = [
  { id: 'e1', date: '2026-08-20', title: 'Consegna Progetto Notion', category: 'scuola', time: '15:00', notes: 'Completare la dashboard a 2 colonne' },
  { id: 'e2', date: '2026-08-25', title: 'Pianificazione Budget Mensile', category: 'economia', time: '18:00', notes: 'Revisione entrate e uscite' },
  { id: 'e3', date: '2026-08-30', title: 'Inizio Ripassi Settembre', category: 'scuola', time: '09:00', notes: 'Focus Matematica e Fisica' },
  { id: 'e4', date: '2026-08-18', title: 'Revisione Appunti Fisica', category: 'personale', time: '16:30', notes: '' },
];

const initialHomeStats = [
  { id: 'st1', label: 'Saldo Economico', value: '€ 211,50', change: '+€ 350 sto mese', color: 'emerald', icon: 'Wallet' },
  { id: 'st2', label: 'Prossime Scadenze Scuola', value: '3 In sospeso', change: 'Prossima: 18 Ago', color: 'blue', icon: 'GraduationCap' },
  { id: 'st3', label: 'Eventi Mese', value: '4 Registrati', change: 'Calendario aggiornato', color: 'purple', icon: 'Calendar' },
  { id: 'st4', label: 'Media Voti Attuale', value: '9.0', change: 'Ultimo voto: 9/10', color: 'amber', icon: 'BookOpen' },
];

const initialPages = [
  {
    id: 'p1',
    title: 'Note Rapide & Obiettivi',
    icon: '📌',
    cover: null,
    updatedAt: 'Oggi 14:15',
    blocks: [
      { id: 'b1', type: 'h2', content: 'Benvenuto nel tuo spazio personale!' },
      { id: 'b2', type: 'paragraph', content: 'Questo è un editor minimal stile Notion. Puoi aggiungere pagine, organizzare compiti, gestire finanze e tenere traccia di tutto.' },
      { id: 'b3', type: 'todo', content: 'Configurare la struttura iniziale delle pagine', checked: true },
      { id: 'b4', type: 'todo', content: 'Fornire le statistiche personalizzate per la Home', checked: false },
      { id: 'b5', type: 'todo', content: 'Personalizzare la sezione Scuola ed Economia', checked: false },
    ]
  }
];

export const WorkspaceProvider = ({ children }) => {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('notion_activeTab') || 'home');
  const [activePageId, setActivePageId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('notion_darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // App Data (with LocalStorage)
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('notion_transactions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.filter(t => t.description !== 'Saldo Iniziale');
    }
    return initialEconomyData;
  });

  const [schoolItems, setSchoolItems] = useState(() => {
    const saved = localStorage.getItem('notion_school');
    return saved ? JSON.parse(saved) : initialSchoolData;
  });

  const [grades, setGrades] = useState(() => {
    const saved = localStorage.getItem('notion_grades');
    return saved ? JSON.parse(saved) : initialGradesData;
  });

  const [calendarEvents, setCalendarEvents] = useState(() => {
    const saved = localStorage.getItem('notion_calendar');
    return saved ? JSON.parse(saved) : initialCalendarEvents;
  });

  const [homeStats, setHomeStats] = useState(() => {
    const saved = localStorage.getItem('notion_homeStats');
    return saved ? JSON.parse(saved) : initialHomeStats;
  });

  const [customPages, setCustomPages] = useState(() => {
    const saved = localStorage.getItem('notion_customPages');
    return saved ? JSON.parse(saved) : initialPages;
  });

  const [quickNotes, setQuickNotes] = useState(() => {
    return localStorage.getItem('notion_quickNotes') || '• Rivedere appunti di matematica\n• Controllare spese del mese\n• Preparare la lista delle statistiche della Home';
  });

  // Sync effect for Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('notion_darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Sync effect for LocalStorage
  useEffect(() => {
    localStorage.setItem('notion_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('notion_school', JSON.stringify(schoolItems));
  }, [schoolItems]);

  useEffect(() => {
    localStorage.setItem('notion_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('notion_calendar', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('notion_homeStats', JSON.stringify(homeStats));
  }, [homeStats]);

  useEffect(() => {
    localStorage.setItem('notion_customPages', JSON.stringify(customPages));
  }, [customPages]);

  useEffect(() => {
    localStorage.setItem('notion_quickNotes', quickNotes);
  }, [quickNotes]);

  const [economyCategories, setEconomyCategories] = useState(() => {
    const saved = localStorage.getItem('notion_economy_categories');
    return saved ? JSON.parse(saved) : ['Stipendio', 'Alimentari', 'Trasporti', 'Intrattenimento', 'Abbonamenti', 'Salute & Cura', 'Shopping', 'Scuola', 'Altro'];
  });

  useEffect(() => {
    localStorage.setItem('notion_economy_categories', JSON.stringify(economyCategories));
  }, [economyCategories]);

  const addEconomyCategory = (newCat) => {
    if (newCat && !economyCategories.includes(newCat)) {
      setEconomyCategories(prev => [...prev, newCat]);
    }
  };

  const deleteEconomyCategory = (catToDelete) => {
    setEconomyCategories(prev => prev.filter(c => c !== catToDelete));
  };

  // Global Handlers
  const addTransaction = (newTx) => {
    setTransactions(prev => [{ ...newTx, id: Date.now().toString() }, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addSchoolItem = (item) => {
    setSchoolItems(prev => [{ ...item, id: Date.now().toString() }, ...prev]);
  };

  const toggleSchoolStatus = (id) => {
    setSchoolItems(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'completato' ? 'da_fare' : 'completato';
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const deleteSchoolItem = (id) => {
    setSchoolItems(prev => prev.filter(i => i.id !== id));
  };

  const addGrade = (gradeObj) => {
    setGrades(prev => [{ ...gradeObj, id: Date.now().toString() }, ...prev]);
  };

  const deleteGrade = (id) => {
    setGrades(prev => prev.filter(g => g.id !== id));
  };

  const addCalendarEvent = (event) => {
    setCalendarEvents(prev => [{ ...event, id: Date.now().toString() }, ...prev]);
  };

  const deleteCalendarEvent = (id) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  const createCustomPage = () => {
    const newPage = {
      id: 'p_' + Date.now(),
      title: 'Nuova Pagina',
      icon: '📄',
      cover: null,
      updatedAt: 'Adesso',
      blocks: [
        { id: 'b_' + Date.now(), type: 'paragraph', content: 'Inizia a scrivere qui...' }
      ]
    };
    setCustomPages(prev => [...prev, newPage]);
    setActiveTab('custom_page');
    setActivePageId(newPage.id);
  };

  const updatePage = (pageId, updatedFields) => {
    setCustomPages(prev => prev.map(p => p.id === pageId ? { ...p, ...updatedFields } : p));
  };

  const deleteCustomPage = (pageId) => {
    setCustomPages(prev => prev.filter(p => p.id !== pageId));
    if (activePageId === pageId) {
      setActiveTab('home');
      setActivePageId(null);
    }
  };

  const navigateTo = (tab, pageId = null) => {
    setActiveTab(tab);
    setActivePageId(pageId);
  };

  return (
    <WorkspaceContext.Provider value={{
      activeTab,
      activePageId,
      isSidebarOpen,
      setIsSidebarOpen,
      isDarkMode,
      setIsDarkMode,
      isSearchOpen,
      setIsSearchOpen,
      initialBaseBalance: INITIAL_BASE_BALANCE,
      transactions,
      addTransaction,
      deleteTransaction,
      economyCategories,
      addEconomyCategory,
      deleteEconomyCategory,
      schoolItems,
      addSchoolItem,
      toggleSchoolStatus,
      deleteSchoolItem,
      grades,
      addGrade,
      deleteGrade,
      calendarEvents,
      addCalendarEvent,
      deleteCalendarEvent,
      homeStats,
      setHomeStats,
      customPages,
      createCustomPage,
      updatePage,
      deleteCustomPage,
      quickNotes,
      setQuickNotes,
      navigateTo
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
