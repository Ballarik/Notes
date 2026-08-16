import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  // Navigation & UI State (Always defaults to Home on page open)
  const [activeTab, setActiveTab] = useState('home');
  const [activePageId, setActivePageId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('notion_darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // App Data (with LocalStorage fallback)
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('notion_transactions');
    return saved ? JSON.parse(saved).filter(t => t.description !== 'Saldo Iniziale') : initialEconomyData;
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

  const [quickNotes, setQuickNotesState] = useState(() => {
    const saved = localStorage.getItem('notion_quickNotes');
    return saved !== null ? saved : '• Rivedere appunti di matematica\n• Controllare spese del mese';
  });

  const setQuickNotes = (val) => {
    setQuickNotesState(val);
    localStorage.setItem('notion_quickNotes', val);
  };

  const [economyCategories, setEconomyCategories] = useState(() => {
    const saved = localStorage.getItem('notion_economy_categories');
    return saved ? JSON.parse(saved) : ['Stipendio', 'Alimentari', 'Trasporti', 'Intrattenimento', 'Abbonamenti', 'Salute & Cura', 'Shopping', 'Scuola', 'Altro'];
  });

  const [directLinks, setDirectLinks] = useState(() => {
    const saved = localStorage.getItem('notion_direct_links');
    return saved ? JSON.parse(saved) : [
      { id: 'l1', name: 'Registro Elettronico (ClasseViva)', url: 'https://www.classeviva.spaggiari.eu' },
      { id: 'l2', name: 'Google Classroom', url: 'https://classroom.google.com' }
    ];
  });

  const defaultSubjects = [
    "Chimica e biologia",
    "Disegno e storia dell'arte",
    "Filosofia",
    "Fisica",
    "Informatica",
    "Inglese",
    "Italiano",
    "Matematica",
    "Religione / Alternativa",
    "Scienze motorie",
    "Storia"
  ];

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('notion_subjects');
    return saved ? JSON.parse(saved) : defaultSubjects;
  });

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('notion_timetable');
    return saved ? JSON.parse(saved) : {
      lun_1: 'Matematica', lun_2: 'Fisica', lun_3: 'Italiano', lun_4: 'Inglese',
      mar_1: 'Informatica', mar_2: 'Informatica', mar_3: 'Chimica e biologia', mar_4: 'Storia',
      mer_1: 'Matematica', mer_2: 'Filosofia', mer_3: 'Disegno e storia dell\'arte', mer_4: 'Scienze motorie',
      gio_1: 'Fisica', gio_2: 'Italiano', gio_3: 'Italiano', gio_4: 'Inglese',
      ven_1: 'Informatica', ven_2: 'Matematica', ven_3: 'Filosofia', ven_4: 'Religione / Alternativa'
    };
  });

  const [userName, setUserNameState] = useState(() => {
    const saved = localStorage.getItem('notion_userName');
    return saved !== null ? saved : 'Riccardo';
  });

  const setUserName = (val) => {
    setUserNameState(val);
    localStorage.setItem('notion_userName', val);
  };

  const [initialBaseBalance, setInitialBaseBalanceState] = useState(() => {
    const saved = localStorage.getItem('notion_baseBalance');
    return saved !== null ? parseFloat(saved) : 840.00;
  });

  const setInitialBaseBalance = (val) => {
    const num = isNaN(parseFloat(val)) ? 0 : parseFloat(val);
    setInitialBaseBalanceState(num);
    localStorage.setItem('notion_baseBalance', num.toString());
  };

  // Load from project file on initial mount ONCE
  const isLoadedRef = useRef(false);
  useEffect(() => {
    const loadFromProjectFile = async () => {
      try {
        const res = await fetch('/api/load-workspace');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.transactions)) setTransactions(data.transactions.filter(t => t.description !== 'Saldo Iniziale'));
          if (Array.isArray(data.schoolItems)) setSchoolItems(data.schoolItems);
          if (Array.isArray(data.grades)) setGrades(data.grades);
          if (Array.isArray(data.calendarEvents)) setCalendarEvents(data.calendarEvents);
          if (Array.isArray(data.customPages)) setCustomPages(data.customPages);
          if (typeof data.quickNotes === 'string') setQuickNotesState(data.quickNotes);
          if (Array.isArray(data.economyCategories)) setEconomyCategories(data.economyCategories);
          if (Array.isArray(data.directLinks)) setDirectLinks(data.directLinks);
          if (Array.isArray(data.subjects)) setSubjects(data.subjects);
          if (data.timetable && typeof data.timetable === 'object') setTimetable(data.timetable);
          if (typeof data.userName === 'string') setUserNameState(data.userName);
          if (typeof data.initialBaseBalance === 'number') setInitialBaseBalanceState(data.initialBaseBalance);
          else if (typeof data.baseBalance === 'number') setInitialBaseBalanceState(data.baseBalance);
        }
      } catch (e) {
        // Fallback silently to localStorage
      } finally {
        isLoadedRef.current = true;
      }
    };
    loadFromProjectFile();
  }, []);

  // Sync effects for LocalStorage
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
    localStorage.setItem('notion_economy_categories', JSON.stringify(economyCategories));
  }, [economyCategories]);

  useEffect(() => {
    localStorage.setItem('notion_direct_links', JSON.stringify(directLinks));
  }, [directLinks]);

  useEffect(() => {
    localStorage.setItem('notion_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('notion_timetable', JSON.stringify(timetable));
  }, [timetable]);

  // Direct Save to Project Directory File (/project_data/workspace_data.json)
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'
  const [lastSaveTime, setLastSaveTime] = useState(() => new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));

  const saveProjectFile = async () => {
    setSaveStatus('saving');
    const projectData = {
      appName: 'Personal Workspace',
      version: '1.0',
      savedAt: new Date().toISOString(),
      userName,
      initialBaseBalance,
      baseBalance: initialBaseBalance,
      transactions,
      schoolItems,
      grades,
      calendarEvents,
      homeStats,
      customPages,
      quickNotes,
      economyCategories,
      directLinks,
      subjects,
      timetable
    };

    try {
      const res = await fetch('/api/save-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData, null, 2)
      });
      if (res.ok) {
        setSaveStatus('saved');
        setLastSaveTime(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSaveStatus('saved');
      }
    } catch (err) {
      setSaveStatus('saved');
    }
  };

  // Debounced auto-save to project file on data changes (prevents rapid POST loop)
  useEffect(() => {
    if (!isLoadedRef.current) return;
    const timer = setTimeout(() => {
      saveProjectFile();
    }, 1000);
    return () => clearTimeout(timer);
  }, [transactions, schoolItems, grades, calendarEvents, customPages, quickNotes, economyCategories, directLinks, userName, initialBaseBalance, subjects, timetable]);

  // Global Handlers
  const updateTimetableCell = (dayKey, hourNum, subjectName) => {
    const key = `${dayKey}_${hourNum}`;
    setTimetable(prev => {
      const copy = { ...prev };
      if (!subjectName) {
        delete copy[key];
      } else {
        copy[key] = subjectName;
      }
      return copy;
    });
  };

  const clearTimetable = () => {
    setTimetable({});
  };
  const addSubject = (name) => {
    const trimmed = name.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects(prev => [...prev, trimmed].sort());
    }
  };

  const deleteSubject = (name) => {
    setSubjects(prev => prev.filter(s => s !== name));
  };

  const updateSubject = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSubjects(prev => prev.map(s => s === oldName ? trimmed : s));
    setGrades(prev => prev.map(g => g.subject === oldName ? { ...g, subject: trimmed } : g));
    setSchoolItems(prev => prev.map(i => i.subject === oldName ? { ...i, subject: trimmed } : i));
  };
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

  const addEconomyCategory = (newCat) => {
    if (newCat && !economyCategories.includes(newCat)) {
      setEconomyCategories(prev => [...prev, newCat]);
    }
  };

  const deleteEconomyCategory = (catToDelete) => {
    setEconomyCategories(prev => prev.filter(c => c !== catToDelete));
  };

  const addDirectLink = (link) => {
    setDirectLinks(prev => [{ ...link, id: Date.now().toString() }, ...prev]);
  };

  const deleteDirectLink = (id) => {
    setDirectLinks(prev => prev.filter(l => l.id !== id));
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
    if (pageId) setActivePageId(pageId);
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
      userName,
      setUserName,
      initialBaseBalance,
      setInitialBaseBalance,
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
      subjects,
      addSubject,
      deleteSubject,
      updateSubject,
      timetable,
      updateTimetableCell,
      clearTimetable,
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
      directLinks,
      addDirectLink,
      deleteDirectLink,
      saveProjectFile,
      saveStatus,
      lastSaveTime,
      navigateTo
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
