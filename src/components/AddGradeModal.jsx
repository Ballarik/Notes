import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Calendar as CalendarIcon } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AppleDatePicker } from './AppleDatePicker';

const MONTHS = [
  { num: 9, name: "Settembre" },
  { num: 10, name: "Ottobre" },
  { num: 11, name: "Novembre" },
  { num: 12, name: "Dicembre" },
  { num: 1, name: "Gennaio" },
  { num: 2, name: "Febbraio" },
  { num: 3, name: "Marzo" },
  { num: 4, name: "Aprile" },
  { num: 5, name: "Maggio" },
  { num: 6, name: "Giugno" },
];

export const AddGradeModal = ({ isOpen, onClose, subjects, onAddGrade }) => {
  const { isSidebarOpen } = useWorkspace();
  const [step, setStep] = useState(1); // 1: Materia, 2: Oggetto, 3: Descrizione, 4: Data, 5: Voto & Opzioni

  // Step 1: Materia
  const [subject, setSubject] = useState('');

  // Step 2: Oggetto
  const [title, setTitle] = useState('');
  const [monthNum, setMonthNum] = useState(9);

  // Step 3: Descrizione
  const [description, setDescription] = useState('');

  // Step 4: Data a cui collegare il voto
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Step 5: Voto & Opzioni Speciali
  const [baseGrade, setBaseGrade] = useState(10);
  const [modifier, setModifier] = useState('full');
  const [noAverage, setNoAverage] = useState(false);
  const [isHalfWeight, setIsHalfWeight] = useState(false);

  if (!isOpen) return null;

  const handleSelectSubject = (selectedSubj) => {
    setSubject(selectedSubj);
    setStep(2);
  };

  const getNumericGrade = () => {
    const b = Number(baseGrade);
    switch (modifier) {
      case 'plus':
        return Number((b + 0.25).toFixed(2));
      case 'half':
        return Number((b + 0.50).toFixed(2));
      case 'minus':
        return Number((b - 0.25).toFixed(2));
      case 'full':
      default:
        return Number(b.toFixed(2));
    }
  };

  const getDisplayGradeString = () => {
    const b = baseGrade;
    switch (modifier) {
      case 'plus':
        return `${b}+`;
      case 'half':
        return `${b}.5`;
      case 'minus':
        return `${b}-`;
      case 'full':
      default:
        return `${b}`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject) return;

    const numericVal = getNumericGrade();
    const displayStr = getDisplayGradeString();

    // Infer month from selected date
    const dateObj = new Date(selectedDate);
    const mNum = dateObj.getMonth() + 1; // 1-12
    const monthObj = MONTHS.find(m => m.num === mNum) || MONTHS.find(m => m.num === Number(monthNum)) || MONTHS[0];

    onAddGrade({
      subject,
      title: title || 'Valutazione',
      description,
      grade: numericVal,
      displayGrade: displayStr,
      monthNum: monthObj.num,
      monthName: monthObj.name,
      noAverage,
      isHalfWeight,
      weight: noAverage ? 0.0 : (isHalfWeight ? 0.5 : 1.0),
      date: selectedDate
    });

    // Reset & Close
    setStep(1);
    setSubject('');
    setTitle('');
    setDescription('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setBaseGrade(10);
    setModifier('full');
    setNoAverage(false);
    setIsHalfWeight(false);
    onClose();
  };

  const totalSteps = 5;
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto transition-all ${
        isSidebarOpen ? 'left-60' : 'left-0'
      }`}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#202020] w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Progress Bar */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Passaggio {step} di {totalSteps}
              </span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {step === 1 && '1. Seleziona la Materia'}
                {step === 2 && '2. Oggetto'}
                {step === 3 && '3. Descrizione'}
                {step === 4 && '4. Seleziona Data'}
                {step === 5 && '5. Voto & Opzioni Speciali'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top Progress Bar */}
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-purple-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal Body content per Step */}
        <div className="p-5 flex-1 overflow-y-auto max-h-[420px]">
          {/* STEP 1: Selezione Materia */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Clicca sulla materia per cui desideri inserire la valutazione:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subjects.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSelectSubject(s)}
                    className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold text-neutral-800 dark:text-neutral-200 text-left transition-all hover:scale-[1.02]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Oggetto (Nome voto) */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Oggetto / Nome della valutazione
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="es. Verifica Integrali, Interrogazione Storia, Tema"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Descrizione */}
          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Descrizione / Dettagli opzionali
              </label>
              <textarea
                autoFocus
                placeholder="es. Prova scritta su derivate e limiti, 4 quesiti a risposta aperta..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#191919] focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* STEP 4: Seleziona Data (Apple Scroll Wheel) */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <CalendarIcon className="w-4 h-4 text-purple-500" />
                <span>Seleziona la data della valutazione</span>
              </div>

              <AppleDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                themeColor="purple"
              />
            </div>
          )}

          {/* STEP 5: Voto, Ruota & Opzioni Speciali */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-in">
              {/* Ruota / Selettore Voto Base (1 to 10) */}
              <div className="space-y-2 text-center">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Seleziona Voto Base (Default: 10)
                </span>
                
                <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-2">
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBaseGrade(val)}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                        baseGrade === val 
                          ? 'bg-purple-600 text-white scale-110 shadow-md' 
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>

                {/* Sfumatura Voto: V, V+, V.5, V- */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[
                    { id: 'full', label: `${baseGrade}`, desc: `Valore: ${baseGrade}.0` },
                    { id: 'plus', label: `${baseGrade}+`, desc: `Valore: ${(baseGrade + 0.25).toFixed(2)}` },
                    { id: 'half', label: `${baseGrade}.5`, desc: `Valore: ${(baseGrade + 0.50).toFixed(2)}` },
                    { id: 'minus', label: `${baseGrade}-`, desc: `Valore: ${(baseGrade - 0.25).toFixed(2)}` },
                  ].map(mod => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setModifier(mod.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        modifier === mod.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#191919] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50'
                      }`}
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>

                {/* Anteprima Voto Finale */}
                <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50 inline-block mt-2">
                  <div className="text-xs text-neutral-500">Voto Selezionato:</div>
                  <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                    {getDisplayGradeString()} <span className="text-xs font-normal text-neutral-400">({getNumericGrade()})</span>
                  </div>
                </div>
              </div>

              {/* Opzioni Speciali Checkbox */}
              <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                {/* Spunta 1: Non fa media */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={noAverage}
                    onChange={(e) => setNoAverage(e.target.checked)}
                    className="mt-0.5 accent-purple-600 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      Non fa media
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Se spuntato, il voto non avrà la colorazione di default ma un colore neutro e non verrà contato in nessuna delle medie.
                    </div>
                  </div>
                </label>

                {/* Spunta 2: Valore al 50% */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isHalfWeight}
                    onChange={(e) => setIsHalfWeight(e.target.checked)}
                    disabled={noAverage}
                    className="mt-0.5 accent-purple-600 w-4 h-4 disabled:opacity-50"
                  />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      Valore al 50%
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Se spuntato, questo voto ha peso 50% (peso 0.5) nel calcolo della media ponderata.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Indietro</span>
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !subject}
              className="px-4 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              <span>Avanti</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Conferma e Salva Voto</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
