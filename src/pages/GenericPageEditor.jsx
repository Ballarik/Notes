import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Plus, Trash2, CheckSquare, Square, Type, Heading1, Heading2, MessageSquare } from 'lucide-react';

export const GenericPageEditor = () => {
  const { activePageId, customPages, updatePage } = useWorkspace();

  const page = customPages.find(p => p.id === activePageId);

  if (!page) {
    return (
      <div className="p-8 text-center text-xs text-neutral-400">
        Pagina non trovata o eliminata.
      </div>
    );
  }

  const handleTitleChange = (e) => {
    updatePage(page.id, { title: e.target.value });
  };

  const handleIconChange = (icon) => {
    updatePage(page.id, { icon });
  };

  const addBlock = (type = 'paragraph') => {
    const newBlock = {
      id: 'b_' + Date.now(),
      type,
      content: '',
      checked: false
    };
    updatePage(page.id, { blocks: [...(page.blocks || []), newBlock] });
  };

  const updateBlock = (blockId, fields) => {
    const updatedBlocks = page.blocks.map(b => b.id === blockId ? { ...b, ...fields } : b);
    updatePage(page.id, { blocks: updatedBlocks });
  };

  const deleteBlock = (blockId) => {
    const updatedBlocks = page.blocks.filter(b => b.id !== blockId);
    updatePage(page.id, { blocks: updatedBlocks });
  };

  const emojis = ['📄', '📌', '🚀', '💡', '📚', '🎯', '⚙️', '📝', '✨', '🔥'];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Icon Picker & Cover header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative group">
            <span className="text-3xl p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 cursor-pointer inline-block">
              {page.icon || '📄'}
            </span>
            <div className="absolute top-12 left-0 hidden group-hover:flex bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 rounded-lg shadow-lg gap-1.5 z-20">
              {emojis.map(e => (
                <button
                  key={e}
                  onClick={() => handleIconChange(e)}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={page.title || ''}
            onChange={handleTitleChange}
            placeholder="Senza titolo..."
            className="w-full text-3xl font-extrabold bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder-neutral-300 dark:placeholder-neutral-600"
          />
        </div>

        <div className="text-xs text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-3 flex items-center justify-between">
          <span>Ultima modifica: {page.updatedAt || 'Di recente'}</span>
          <span>Editor a blocchi Notion</span>
        </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-3 min-h-[300px]">
        {page.blocks && page.blocks.map(block => (
          <div key={block.id} className="group flex items-start gap-2">
            {/* Block Icon / Type */}
            {block.type === 'todo' && (
              <button
                onClick={() => updateBlock(block.id, { checked: !block.checked })}
                className="mt-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {block.checked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
            )}

            {block.type === 'h2' ? (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Intestazione 2..."
                className="w-full text-lg font-bold bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder-neutral-300"
              />
            ) : block.type === 'todo' ? (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Elemento della lista..."
                className={`w-full text-sm bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-none ${
                  block.checked ? 'line-through text-neutral-400' : ''
                }`}
              />
            ) : (
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Scrivi qualcosa o usa i pulsanti sotto..."
                rows={1}
                className="w-full text-sm bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-none resize-none leading-relaxed"
              />
            )}

            <button
              onClick={() => deleteBlock(block.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-opacity rounded"
              title="Elimina blocco"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Block Toolbar */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 text-xs">
        <span className="text-neutral-400 font-medium mr-1">Aggiungi blocco:</span>
        <button
          onClick={() => addBlock('paragraph')}
          className="notion-btn-ghost text-xs border border-neutral-200 dark:border-neutral-800"
        >
          <Type className="w-3.5 h-3.5" />
          <span>Testo</span>
        </button>
        <button
          onClick={() => addBlock('h2')}
          className="notion-btn-ghost text-xs border border-neutral-200 dark:border-neutral-800"
        >
          <Heading2 className="w-3.5 h-3.5" />
          <span>Titolo</span>
        </button>
        <button
          onClick={() => addBlock('todo')}
          className="notion-btn-ghost text-xs border border-neutral-200 dark:border-neutral-800"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Checklist</span>
        </button>
      </div>
    </div>
  );
};
