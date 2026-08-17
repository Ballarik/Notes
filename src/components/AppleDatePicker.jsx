import React, { useState, useEffect, useRef } from 'react';

const MONTH_NAMES = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic"
];

const YEARS = [2026, 2027, 2028, 2029, 2030];
const ITEM_HEIGHT = 44; // 44px height per row

export const AppleDatePicker = ({ value, onChange, themeColor = 'purple' }) => {
  const initialDate = value ? new Date(value) : new Date();
  
  const [day, setDay] = useState(initialDate.getDate());
  const [month, setMonth] = useState(initialDate.getMonth() + 1); // 1-12
  const [year, setYear] = useState(initialDate.getFullYear() >= 2026 ? initialDate.getFullYear() : 2026);

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const scrollTimeoutRef = useRef(null);

  // Days list for selected month/year
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysList = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Center scroll position helper
  const scrollToItem = (ref, index) => {
    if (ref.current) {
      ref.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth'
      });
    }
  };

  // Align scroll to center on initial render
  useEffect(() => {
    const dIdx = Math.max(0, day - 1);
    const mIdx = Math.max(0, month - 1);
    const yIdx = Math.max(0, YEARS.indexOf(year));

    setTimeout(() => {
      if (dayRef.current) dayRef.current.scrollTop = dIdx * ITEM_HEIGHT;
      if (monthRef.current) monthRef.current.scrollTop = mIdx * ITEM_HEIGHT;
      if (yearRef.current) yearRef.current.scrollTop = yIdx * ITEM_HEIGHT;
    }, 50);
  }, []);

  // Handle scroll events with snap-to-center settlement
  const handleScroll = (e, listLength, setter, ref) => {
    const scrollTop = e.target.scrollTop;
    const idx = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(idx, listLength - 1));

    setter(clampedIdx);

    // Debounced snap to exact integer center
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (ref.current) {
        ref.current.scrollTo({
          top: clampedIdx * ITEM_HEIGHT,
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  // Notify parent component whenever date changes
  useEffect(() => {
    const validDay = Math.min(day, daysInMonth);
    if (validDay !== day) setDay(validDay);

    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(validDay).padStart(2, '0');
    const isoDateString = `${year}-${formattedMonth}-${formattedDay}`;
    
    onChange(isoDateString);
  }, [day, month, year, daysInMonth]);

  // Color classes depending on page theme
  const getThemeClasses = () => {
    if (themeColor === 'emerald') {
      return {
        boxBg: 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-500 text-emerald-700 dark:text-emerald-300',
        activeText: 'text-emerald-700 dark:text-emerald-300 font-extrabold',
        indicatorText: 'text-emerald-600 dark:text-emerald-400'
      };
    }
    if (themeColor === 'blue') {
      return {
        boxBg: 'bg-blue-50/90 dark:bg-blue-950/70 border-blue-500 text-blue-700 dark:text-blue-300',
        activeText: 'text-blue-700 dark:text-blue-300 font-extrabold',
        indicatorText: 'text-blue-600 dark:text-blue-400'
      };
    }
    if (themeColor === 'orange' || themeColor === 'amber') {
      return {
        boxBg: 'bg-orange-50/90 dark:bg-orange-950/70 border-orange-500 text-orange-700 dark:text-orange-300',
        activeText: 'text-orange-700 dark:text-orange-300 font-extrabold',
        indicatorText: 'text-orange-600 dark:text-orange-400'
      };
    }
    return {
      boxBg: 'bg-purple-50/90 dark:bg-purple-950/70 border-purple-500 text-purple-700 dark:text-purple-300',
      activeText: 'text-purple-700 dark:text-purple-300 font-extrabold',
      indicatorText: 'text-purple-600 dark:text-purple-400'
    };
  };

  const colors = getThemeClasses();

  return (
    <div className="w-full bg-neutral-50 dark:bg-[#191919] rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-3 select-none">
      <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1">
        <span>Giorno</span>
        <span>Mese</span>
        <span>Anno</span>
      </div>

      {/* 3 Drum Columns with Fixed 74px Top/Bottom Padding for Perfect 44px Center Box Alignment */}
      <div className="grid grid-cols-3 gap-3 h-[192px] relative overflow-hidden rounded-2xl bg-white dark:bg-[#202020] border border-neutral-200/80 dark:border-neutral-800 p-2 shadow-inner">
        {/* Fixed Center Frame Boxes */}
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[44px] pointer-events-none z-0 grid grid-cols-3 gap-3">
          <div className={`rounded-xl border-2 shadow-xs ${colors.boxBg}`} />
          <div className={`rounded-xl border-2 shadow-xs ${colors.boxBg}`} />
          <div className={`rounded-xl border-2 shadow-xs ${colors.boxBg}`} />
        </div>

        {/* COLONNA 1: GIORNO */}
        <div 
          ref={dayRef}
          onScroll={(e) => handleScroll(e, daysList.length, (idx) => setDay(idx + 1), dayRef)}
          className="h-full overflow-y-auto scrollbar-none snap-y snap-mandatory py-[74px] z-10 text-center"
        >
          {daysList.map((d) => (
            <div
              key={d}
              onClick={() => {
                setDay(d);
                scrollToItem(dayRef, d - 1);
              }}
              style={{ scrollSnapAlign: 'center' }}
              className={`h-[44px] flex items-center justify-center cursor-pointer transition-all ${
                day === d 
                  ? `text-lg ${colors.activeText} scale-110` 
                  : 'text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              {String(d).padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* COLONNA 2: MESE */}
        <div 
          ref={monthRef}
          onScroll={(e) => handleScroll(e, MONTH_NAMES.length, (idx) => setMonth(idx + 1), monthRef)}
          className="h-full overflow-y-auto scrollbar-none snap-y snap-mandatory py-[74px] z-10 text-center"
        >
          {MONTH_NAMES.map((mName, index) => {
            const mNum = index + 1;
            return (
              <div
                key={mName}
                onClick={() => {
                  setMonth(mNum);
                  scrollToItem(monthRef, index);
                }}
                style={{ scrollSnapAlign: 'center' }}
                className={`h-[44px] flex items-center justify-center cursor-pointer transition-all ${
                  month === mNum 
                    ? `text-lg ${colors.activeText} scale-110` 
                    : 'text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                {mName}
              </div>
            );
          })}
        </div>

        {/* COLONNA 3: ANNO */}
        <div 
          ref={yearRef}
          onScroll={(e) => handleScroll(e, YEARS.length, (idx) => setYear(YEARS[idx]), yearRef)}
          className="h-full overflow-y-auto scrollbar-none snap-y snap-mandatory py-[74px] z-10 text-center"
        >
          {YEARS.map((y, index) => (
            <div
              key={y}
              onClick={() => {
                setYear(y);
                scrollToItem(yearRef, index);
              }}
              style={{ scrollSnapAlign: 'center' }}
              className={`h-[44px] flex items-center justify-center cursor-pointer transition-all ${
                year === y 
                  ? `text-lg ${colors.activeText} scale-110` 
                  : 'text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              {y}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Summary */}
      <div className="text-center font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">
        Data selezionata: <span className={colors.indicatorText}>{String(day).padStart(2, '0')} {MONTH_NAMES[month - 1]} {year}</span>
      </div>
    </div>
  );
};
