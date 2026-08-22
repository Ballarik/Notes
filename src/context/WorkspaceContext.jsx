import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const WorkspaceContext = createContext();

// Mock Initial Data
const initialTransactions = [
  { id: '1', date: '2026-08-14', description: 'Libri Scolastici', amount: 84.50, type: 'uscita', category: 'Scuola', notes: 'Manuali di matematica e fisica' },
  { id: '2', date: '2026-08-12', description: 'Paghetta Settimanale', amount: 50.00, type: 'entrata', category: 'Altro', notes: 'Lavori estivi in giardino' },
  { id: '3', date: '2026-08-10', description: 'Spesa Cancelleria', amount: 22.30, type: 'uscita', category: 'Scuola', notes: 'Quaderni, penne e cartelle' },
  { id: '4', date: '2026-08-08', description: 'Pizza con Amici', amount: 18.00, type: 'uscita', category: 'Svago', notes: 'Uscita del venerdì sera' },
  { id: '5', date: '2026-08-05', description: 'Regalo Compleanno Nonna', amount: 100.00, type: 'entrata', category: 'Altro', notes: 'Regalo per il compleanno' },
];

const initialSchoolItems = [
  { id: 's1', title: 'Esercizi Matematica - Limiti e Derivate', subject: 'Matematica', date: '2026-08-18', status: 'in_corso', priority: 'alta', notes: 'Pagina 240, numeri dal 15 al 30' },
  { id: 's2', title: 'Saggio Breve Italiano - Il Romanticismo', subject: 'Italiano', date: '2026-08-22', status: 'da_fare', priority: 'media', notes: 'Minimo 3 colonne, citare Leopardi' },
  { id: 's3', title: 'Relazione di Fisica sul Pendolo', subject: 'Fisica', date: '2026-08-25', status: 'completato', priority: 'bassa', notes: 'Con grafici e calcolo errore' },
  { id: 's4', title: 'Vocaboli Inglese - Unit 4', subject: 'Inglese', date: '2026-08-19', status: 'da_fare', priority: 'alta', notes: 'Ripassare phrasal verbs' }
];

const initialGradesData = [
  { id: 'g1', subject: 'Matematica', grade: 8.5, weight: 1.0, title: 'Verifica Trigonometria', date: '2026-10-15', notes: 'Ottima prova scritta', noAverage: false },
  { id: 'g2', subject: 'Matematica', grade: 7.0, weight: 0.5, title: 'Interrogazione Orale', date: '2026-11-20', notes: 'Buona preparazione', noAverage: false },
  { id: 'g3', subject: 'Fisica', grade: 9.0, weight: 1.0, title: 'Test Termodinamica', date: '2026-10-28', notes: 'Eccellente risoluzione problemi', noAverage: false },
  { id: 'g4', subject: 'Italiano', grade: 7.5, weight: 1.0, title: 'Tema sul Decadentismo', date: '2026-11-05', notes: 'Buon contenuto, curare la sintassi', noAverage: false },
  { id: 'g5', subject: 'Inglese', grade: 9.5, weight: 1.0, title: 'Reading & Listening Comprehension', date: '2026-12-02', notes: 'Fluente e preciso', noAverage: false },
  { id: 'g6', subject: 'Storia', grade: 8.0, weight: 1.0, title: 'Verifica Prima Guerra Mondiale', date: '2026-11-12', notes: 'Quadro storico completo', noAverage: false }
];

const initialAssets = [
  { id: 'a1', name: 'Computer / Laptop', description: 'MacBook per studio e sviluppo', value: 1200.00, dateAdded: '2026-08-01' },
  { id: 'a2', name: 'Smartphone', description: 'iPhone principale', value: 750.00, dateAdded: '2026-08-05' },
  { id: 'a3', name: 'Bicicletta', description: 'Bici da città per spostamenti', value: 250.00, dateAdded: '2026-08-10' }
];

// Helper: Process top-up renewals (deduct monthly cost when renewalDay arrives)
export const processRenewals = (list) => {
  if (!Array.isArray(list) || list.length === 0) return { hasChanged: false, updated: list };
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const currentCycle = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  let hasChanged = false;
  const updated = list.map(item => {
    const renewalDay = parseInt(item.renewalDay, 10) || 1;
    // If today's day is on or after the renewal day and this month hasn't been deducted yet
    if (currentDay >= renewalDay && item.lastDeductionMonth !== currentCycle) {
      hasChanged = true;
      const cost = parseFloat(item.monthlyCost) || 0;
      const newBalance = Math.round(((parseFloat(item.currentBalance) || 0) - cost) * 100) / 100;
      const renewalDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(Math.min(currentDay, renewalDay)).padStart(2, '0')}`;
      const historyEntry = {
        id: 'ren_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: renewalDateStr,
        amount: -cost,
        type: 'rinnovo',
        note: `Rinnovo mensile automatico (-€${cost.toFixed(2)})`
      };
      return {
        ...item,
        currentBalance: newBalance,
        lastDeductionMonth: currentCycle,
        history: [historyEntry, ...(item.history || [])]
      };
    }
    return item;
  });

  return { hasChanged, updated };
};

const initialTopUps = [
  {
    id: 'r1',
    name: 'SIM Telefono (Iliad)',
    currentBalance: 15.98,
    monthlyCost: 7.99,
    renewalDay: 24,
    lastDeductionMonth: '2026-07',
    history: [
      { id: 'h1', date: '2026-07-24', amount: -7.99, type: 'rinnovo', note: 'Rinnovo mensile automatico' },
      { id: 'h2', date: '2026-08-01', amount: 15.00, type: 'ricarica', note: 'Ricarica conto' }
    ]
  }
];

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
    id: 'page_1',
    title: 'Obiettivi 2026',
    icon: '🎯',
    cover: null,
    updatedAt: '2 ore fa',
    blocks: [
      { id: 'b1', type: 'heading2', content: 'Obiettivi Scolastici' },
      { id: 'b2', type: 'todo', content: 'Mantenere la media sopra l\'8.0 in tutte le materie', checked: false },
      { id: 'b3', type: 'todo', content: 'Consegnare tutti i progetti entro le scadenze', checked: true },
      { id: 'b4', type: 'heading2', content: 'Obiettivi Personali & Finanziari' },
      { id: 'b5', type: 'todo', content: 'Risparmiare 50€ al mese', checked: true },
      { id: 'b6', type: 'todo', content: 'Leggere 1 libro extra al mese', checked: false }
    ]
  }
];

const initialHolidays = [
  { id: 'h_capodanno', name: 'Capodanno', date: '2026-01-01' },
  { id: 'h_epifania', name: 'Epifania', date: '2026-01-06' },
  { id: 'h_pasquetta', name: 'Lunedì dell\'Angelo', date: '2026-04-06' },
  { id: 'h_liberazione', name: 'Festa della Liberazione', date: '2026-04-25' },
  { id: 'h_lavoro', name: 'Festa del Lavoro', date: '2026-05-01' },
  { id: 'h_repubblica', name: 'Festa della Repubblica', date: '2026-06-02' },
  { id: 'h_ferragosto', name: 'Ferragosto', date: '2026-08-15' },
  { id: 'h_tutti_santi', name: 'Tutti i Santi', date: '2026-11-01' },
  { id: 'h_immacolata', name: 'Immacolata Concezione', date: '2026-12-08' },
  { id: 'h_natale', name: 'Natale', date: '2026-12-25' },
  { id: 'h_santo_stefano', name: 'Santo Stefano', date: '2026-12-26' }
];

export const WorkspaceProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'scuola', 'economia', 'calendario', 'impostazioni', 'custom_page'
  const [activePageId, setActivePageId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('notion_darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Core Data States with localStorage persistence
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('notion_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [schoolItems, setSchoolItems] = useState(() => {
    const saved = localStorage.getItem('notion_school');
    return saved ? JSON.parse(saved) : initialSchoolItems;
  });

  const [grades, setGrades] = useState(() => {
    const saved = localStorage.getItem('notion_grades');
    return saved ? JSON.parse(saved) : initialGradesData;
  });

  const [calendarEvents, setCalendarEvents] = useState(() => {
    const saved = localStorage.getItem('notion_calendar');
    return saved ? JSON.parse(saved) : initialCalendarEvents;
  });

  const [holidays, setHolidays] = useState(() => {
    const saved = localStorage.getItem('notion_holidays');
    return saved ? JSON.parse(saved) : initialHolidays;
  });

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('notion_assets');
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [topUps, setTopUps] = useState(() => {
    const saved = localStorage.getItem('notion_topUps');
    const raw = saved ? JSON.parse(saved) : initialTopUps;
    const { updated } = processRenewals(raw);
    return updated;
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
    return saved ? JSON.parse(saved) : ['Scuola', 'Svago', 'Trasporti', 'Cibo', 'Altro'];
  });

  const [directLinks, setDirectLinks] = useState(() => {
    const saved = localStorage.getItem('notion_direct_links');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Registro Elettronico', url: 'https://web.spaggiari.eu', icon: 'GraduationCap' },
      { id: '2', title: 'Google Classroom', url: 'https://classroom.google.com', icon: 'BookOpen' },
      { id: '3', title: 'Drive Condiviso Classe', url: 'https://drive.google.com', icon: 'Link2' }
    ];
  });

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('notion_subjects');
    return saved ? JSON.parse(saved) : [
      'Matematica', 'Fisica', 'Italiano', 'Storia', 'Filosofia', 
      'Inglese', 'Chimica e biologia', 'Informatica', 'Scienze motorie', 
      'Disegno e storia dell\'arte', 'Religione / Alternativa'
    ];
  });

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('notion_timetable');
    return saved ? JSON.parse(saved) : {
      lun_1: 'Matematica', lun_2: 'Matematica', lun_3: 'Fisica', lun_4: 'Italiano',
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
          if (Array.isArray(data.holidays)) setHolidays(data.holidays);
          if (Array.isArray(data.assets)) setAssets(data.assets);
          if (Array.isArray(data.topUps)) {
            const { updated } = processRenewals(data.topUps);
            setTopUps(updated);
          }
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

  useEffect(() => {
    localStorage.setItem('notion_holidays', JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem('notion_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('notion_topUps', JSON.stringify(topUps));
  }, [topUps]);

  // Check and process due monthly renewals automatically & periodically
  const checkAndApplyRenewals = () => {
    setTopUps(prev => {
      const { hasChanged, updated } = processRenewals(prev);
      return hasChanged ? updated : prev;
    });
  };

  useEffect(() => {
    checkAndApplyRenewals();
    const intervalTimer = setInterval(() => {
      checkAndApplyRenewals();
    }, 10000); // checks every 10 seconds
    return () => clearInterval(intervalTimer);
  }, []);

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
      timetable,
      holidays,
      assets,
      topUps
    };

    try {
      const res = await fetch('/api/save-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        setSaveStatus('saved');
        setLastSaveTime(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSaveStatus('error');
      }
    } catch (e) {
      setSaveStatus('error');
    }
  };

  // Debounced auto-save on any data change
  useEffect(() => {
    if (!isLoadedRef.current) return;
    const timer = setTimeout(() => {
      saveProjectFile();
    }, 1000);
    return () => clearTimeout(timer);
  }, [transactions, schoolItems, grades, calendarEvents, customPages, quickNotes, economyCategories, directLinks, userName, initialBaseBalance, subjects, timetable, holidays, assets, topUps]);

  // Global Handlers
  const updateTimetableCell = (dayKey, hourNum, subjectName) => {
    setTimetable(prev => ({
      ...prev,
      [`${dayKey}_${hourNum}`]: subjectName || ''
    }));
  };

  const clearTimetable = () => {
    setTimetable({});
  };

  const addSubject = (newSubj) => {
    if (newSubj && !subjects.includes(newSubj)) {
      setSubjects(prev => [...prev, newSubj]);
    }
  };

  const deleteSubject = (subjectToDelete) => {
    setSubjects(prev => prev.filter(s => s !== subjectToDelete));
    // Cascade delete grades associated with this subject
    setGrades(prev => prev.filter(g => g.subject !== subjectToDelete));
    // Cascade delete school items associated with this subject
    setSchoolItems(prev => prev.filter(item => item.subject !== subjectToDelete));
    // Clean up timetable cells that had this subject
    setTimetable(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (updated[k] === subjectToDelete) {
          delete updated[k];
        }
      });
      return updated;
    });
  };

  const updateSubject = (oldName, newName) => {
    if (!newName || oldName === newName) return;
    setSubjects(prev => prev.map(s => s === oldName ? newName : s));
    // Cascade update in grades
    setGrades(prev => prev.map(g => g.subject === oldName ? { ...g, subject: newName } : g));
    // Cascade update in school items
    setSchoolItems(prev => prev.map(item => item.subject === oldName ? { ...item, subject: newName } : item));
    // Cascade update in timetable
    setTimetable(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (updated[k] === oldName) {
          updated[k] = newName;
        }
      });
      return updated;
    });
  };

  const addTransaction = (tx) => {
    setTransactions(prev => [{ ...tx, id: Date.now().toString() }, ...prev]);
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

  const addHoliday = (holiday) => {
    setHolidays(prev => [{ ...holiday, id: Date.now().toString() }, ...prev]);
  };

  const updateHoliday = (id, updatedFields) => {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...updatedFields } : h));
  };

  const deleteHoliday = (id) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  const isHoliday = (dateStr) => {
    if (!dateStr) return null;
    return holidays.find(h => h.date === dateStr) || null;
  };

  const addAsset = (asset) => {
    setAssets(prev => [{
      ...asset,
      id: Date.now().toString(),
      dateAdded: asset.dateAdded || new Date().toISOString().split('T')[0],
      value: parseFloat(asset.value) || 0
    }, ...prev]);
  };

  const updateAsset = (id, updatedFields) => {
    setAssets(prev => prev.map(a => a.id === id ? {
      ...a,
      ...updatedFields,
      value: updatedFields.value !== undefined ? (parseFloat(updatedFields.value) || 0) : a.value
    } : a));
  };

  const deleteAsset = (id) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addTopUp = (newTopUp) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const currentCycle = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const renewalDay = parseInt(newTopUp.renewalDay, 10) || 1;
    const lastMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const prevCycle = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const rawBal = parseFloat(newTopUp.currentBalance) || 0;
    const cost = parseFloat(newTopUp.monthlyCost) || 0;

    // Check if renewal day is due today or in the past this month
    const isDueNow = currentDay >= renewalDay;
    const finalBalance = isDueNow ? Math.round((rawBal - cost) * 100) / 100 : rawBal;
    const finalDeductionMonth = isDueNow ? currentCycle : prevCycle;

    const initialHistory = [
      {
        id: 'init_' + Date.now(),
        date: now.toISOString().split('T')[0],
        amount: rawBal,
        type: 'saldo_iniziale',
        note: 'Impostazione saldo iniziale'
      }
    ];

    if (isDueNow) {
      const renewalDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(Math.min(currentDay, renewalDay)).padStart(2, '0')}`;
      initialHistory.unshift({
        id: 'ren_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: renewalDateStr,
        amount: -cost,
        type: 'rinnovo',
        note: `Rinnovo mensile automatico (-€${cost.toFixed(2)})`
      });
    }

    const item = {
      id: Date.now().toString(),
      name: newTopUp.name.trim(),
      currentBalance: finalBalance,
      monthlyCost: cost,
      renewalDay: renewalDay,
      lastDeductionMonth: finalDeductionMonth,
      history: initialHistory
    };
    setTopUps(prev => [item, ...prev]);
  };

  const applyRenewalNow = (id) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentCycle = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const currentDateStr = now.toISOString().split('T')[0];

    setTopUps(prev => prev.map(item => {
      if (item.id !== id) return item;
      const cost = parseFloat(item.monthlyCost) || 0;
      const newBalance = Math.round(((parseFloat(item.currentBalance) || 0) - cost) * 100) / 100;
      const historyEntry = {
        id: 'ren_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: currentDateStr,
        amount: -cost,
        type: 'rinnovo',
        note: `Rinnovo canone manuale (-€${cost.toFixed(2)})`
      };
      return {
        ...item,
        currentBalance: newBalance,
        lastDeductionMonth: currentCycle,
        history: [historyEntry, ...(item.history || [])]
      };
    }));
  };

  const updateTopUp = (id, updatedFields) => {
    setTopUps(prev => {
      const updatedList = prev.map(t => t.id === id ? {
        ...t,
        ...updatedFields,
        currentBalance: updatedFields.currentBalance !== undefined ? (parseFloat(updatedFields.currentBalance) || 0) : t.currentBalance,
        monthlyCost: updatedFields.monthlyCost !== undefined ? (parseFloat(updatedFields.monthlyCost) || 0) : t.monthlyCost,
        renewalDay: updatedFields.renewalDay !== undefined ? (parseInt(updatedFields.renewalDay, 10) || 1) : t.renewalDay
      } : t);
      const { updated } = processRenewals(updatedList);
      return updated;
    });
  };

  const deleteTopUp = (id) => {
    setTopUps(prev => prev.filter(t => t.id !== id));
  };

  const rechargeTopUp = (id, amount, note = 'Ricarica manuale') => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return;
    const now = new Date();
    setTopUps(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newBal = Math.round(((parseFloat(t.currentBalance) || 0) + numAmount) * 100) / 100;
      const historyEntry = {
        id: 'rec_' + Date.now(),
        date: now.toISOString().split('T')[0],
        amount: numAmount,
        type: 'ricarica',
        note: note || 'Ricarica conto'
      };
      return {
        ...t,
        currentBalance: newBal,
        history: [historyEntry, ...(t.history || [])]
      };
    }));
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

  // --- EXPORT / IMPORT ---
  const exportWorkspaceData = () => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= ninetyDaysAgo && d <= now;
    });

    const pendingSchoolItems = schoolItems.filter(i => i.status !== 'completato');

    const exportPayload = {
      _meta: {
        appName: 'Personal Workspace',
        version: '1.0',
        exportedAt: now.toISOString(),
      },
      subjects,
      grades,
      customPages,
      initialBaseBalance,
      economyCategories,
      recentTransactions,
      pendingSchoolItems,
      directLinks,
      timetable,
      holidays,
      assets,
      topUps,
      userName,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = now.toISOString().slice(0, 10);
    a.href = url;
    a.download = `workspace_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importWorkspaceData = (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      if (Array.isArray(data.subjects)) setSubjects(data.subjects);
      if (Array.isArray(data.grades)) setGrades(data.grades);
      if (Array.isArray(data.customPages)) setCustomPages(data.customPages);
      if (typeof data.initialBaseBalance === 'number') setInitialBaseBalanceState(data.initialBaseBalance);
      if (Array.isArray(data.economyCategories)) setEconomyCategories(data.economyCategories);
      if (Array.isArray(data.recentTransactions)) setTransactions(data.recentTransactions);
      if (Array.isArray(data.pendingSchoolItems)) setSchoolItems(prev => {
        const importedIds = new Set(data.pendingSchoolItems.map(i => i.id));
        const existing = prev.filter(i => !importedIds.has(i.id));
        return [...data.pendingSchoolItems, ...existing];
      });
      if (Array.isArray(data.directLinks)) setDirectLinks(data.directLinks);
      if (Array.isArray(data.holidays)) setHolidays(data.holidays);
      if (Array.isArray(data.assets)) setAssets(data.assets);
      if (Array.isArray(data.topUps)) {
        const { updated } = processRenewals(data.topUps);
        setTopUps(updated);
      }
      if (data.timetable && typeof data.timetable === 'object') setTimetable(data.timetable);
      if (typeof data.userName === 'string') {
        setUserNameState(data.userName);
        localStorage.setItem('notion_userName', data.userName);
      }
      if (typeof data.initialBaseBalance === 'number') {
        localStorage.setItem('notion_baseBalance', data.initialBaseBalance.toString());
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
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
      holidays,
      addHoliday,
      updateHoliday,
      deleteHoliday,
      isHoliday,
      assets,
      addAsset,
      updateAsset,
      deleteAsset,
      topUps,
      addTopUp,
      updateTopUp,
      deleteTopUp,
      rechargeTopUp,
      applyRenewalNow,
      checkAndApplyRenewals,
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
      navigateTo,
      exportWorkspaceData,
      importWorkspaceData
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
