import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import ChatPanel from './ChatPanel';

const HINT_KEY = 'sims.assistant.hintSeen';

const hintSeen = () => {
  try { return !!sessionStorage.getItem(HINT_KEY); } catch { return true; }
};
const markHintSeen = () => {
  try { sessionStorage.setItem(HINT_KEY, '1'); } catch { /* storage unavailable */ }
};

/** Floating "Study Buddy" launcher shown to students on every page except /assistant. */
const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // keep panel (and its scroll/draft) after first open
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (hintSeen()) return undefined;
    const t = setTimeout(() => setShowHint(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const toggle = () => {
    setOpen((o) => !o);
    setMounted(true);
    setShowHint(false);
    markHintSeen();
  };

  return (
    <>
      {mounted && (
        <div
          role="dialog"
          aria-label="Study Buddy AI assistant"
          aria-hidden={!open}
          className={`fixed bottom-24 right-4 z-50 h-[min(620px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-[400px] overflow-hidden rounded-2xl border border-outline-variant/50 shadow-2xl sm:right-6 ${
            open ? 'animate-panel-in' : 'pointer-events-none invisible opacity-0'
          }`}
        >
          <ChatPanel variant="widget" onClose={() => setOpen(false)} />
        </div>
      )}

      {showHint && !open && (
        <div className="fixed bottom-[5.5rem] right-6 z-50 max-w-[220px] animate-fade-up rounded-xl rounded-br-sm border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-body-sm text-on-surface shadow-xl">
          <button
            type="button"
            onClick={() => { setShowHint(false); markHintSeen(); }}
            className="float-right -mr-1 -mt-0.5 ml-1 text-outline hover:text-on-surface"
            aria-label="Dismiss"
          >
            <Icon name="close" size={14} />
          </button>
          <span className="font-semibold text-primary">Need help?</span> Ask your AI Study Buddy about classes, results or homework.
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Close Study Buddy' : 'Open Study Buddy AI assistant'}
        aria-expanded={open}
        className="group fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-container to-secondary-container bg-[length:200%_200%] text-on-primary shadow-lg shadow-primary/30 transition-all duration-300 animate-gradient hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0 sm:right-6"
      >
        {!open && <span className="absolute inset-0 animate-ping-slow rounded-2xl bg-primary-container" aria-hidden="true" />}
        <Icon
          name={open ? 'close' : 'smart_toy'}
          size={26}
          filled
          className={`relative transition-transform duration-300 ${open ? 'rotate-90' : 'group-hover:-rotate-6 group-hover:scale-110'}`}
        />
        {!open && (
          <span className="absolute -right-1 -top-1 rounded-full bg-tertiary-fixed px-1.5 py-0.5 text-[9px] font-bold text-on-tertiary-fixed shadow">AI</span>
        )}
      </button>
    </>
  );
};

export default ChatWidget;

