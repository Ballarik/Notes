import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemTitle,
  mousePos
}) => {
  if (!isOpen) return null;

  // Calculate mouse position if provided
  let style = {};
  let isPositionedAtCursor = false;

  if (mousePos && typeof mousePos.x === 'number' && typeof mousePos.y === 'number') {
    isPositionedAtCursor = true;
    const modalWidth = 270;
    const modalHeight = 140;

    const posX = Math.min(mousePos.x + 10, window.innerWidth - modalWidth - 16);
    const posY = Math.min(mousePos.y + 10, window.innerHeight - modalHeight - 16);

    style = {
      position: 'fixed',
      left: `${Math.max(16, posX)}px`,
      top: `${Math.max(16, posY)}px`,
      zIndex: 100
    };
  }

  return (
    <div 
      className={`fixed inset-0 z-[90] bg-black/25 backdrop-blur-[1px] ${
        isPositionedAtCursor ? '' : 'flex items-center justify-center p-4'
      } cursor-pointer`}
      onClick={onClose}
    >
      <div 
        style={style}
        className={`bg-white dark:bg-[#202020] w-[270px] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default flex flex-col p-3 space-y-2.5 animate-fade-in ${
          isPositionedAtCursor ? 'fixed' : 'relative'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
              Sei sicuro di voler eliminare?
            </h4>
          </div>

          <button
            onClick={onClose}
            className="p-0.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Optional Item Title Subtext */}
        {itemTitle && (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate px-0.5">
            {itemTitle}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-neutral-100 dark:border-neutral-800/80">
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 text-[11px] font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-xs"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
};
