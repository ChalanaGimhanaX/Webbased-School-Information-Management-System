import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Icon from '../ui/Icon';
import Markdown from './Markdown';
import { ASSISTANT_LIMITS, useAssistantChat } from './useAssistantChat';
import { CAPABILITIES, SUGGESTIONS } from './suggestions';

export const BotAvatar = ({ size = 'h-8 w-8', pulse = false }) => (
  <div className={`relative flex ${size} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary-container to-secondary-container text-on-primary shadow-md`}>
    <Icon name="smart_toy" size={18} filled />
    {pulse && (
      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-tertiary-fixed-dim" />
        <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed-dim" />
      </span>
    )}
  </div>
);

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true)).catch(() => {})}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-outline opacity-0 transition-all hover:bg-surface-container hover:text-primary group-hover:opacity-100 focus:opacity-100"
      aria-label="Copy reply"
    >
      <Icon name={copied ? 'check' : 'content_copy'} size={13} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

/**
 * Study Buddy chat UI. `variant="page"` is the full-screen /assistant view, `variant="widget"` the floating panel.
 * `initialPrompt` (from dashboard shortcuts) is sent once on mount.
 */
const ChatPanel = ({ variant = 'widget', onClose, initialPrompt, onInitialPromptConsumed }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { messages, sending, status, send, retry, clear } = useAssistantChat(user?.username);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const promptSent = useRef(false);
  const isPage = variant === 'page';

  useEffect(() => {
    if (initialPrompt && !promptSent.current) {
      promptSent.current = true;
      send(initialPrompt);
      onInitialPromptConsumed?.();
    }
  }, [initialPrompt, send, onInitialPromptConsumed]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length, sending]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // auto-grow the textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [draft]);

  const submit = async (text = draft) => {
    if (!text.trim() || sending) return;
    setDraft('');
    await send(text);
    inputRef.current?.focus();
  };

  const offline = status.enabled === false;
  const remaining = ASSISTANT_LIMITS.MAX_MESSAGE_CHARS - draft.length;

  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden bg-surface-container-lowest ${isPage ? 'rounded-xl border border-outline-variant/40 shadow-sm' : ''}`}>
      {/* Header */}
      <div className="relative flex items-center gap-3 overflow-hidden border-b border-outline-variant/40 bg-gradient-to-r from-primary to-primary-container px-4 py-3 text-on-primary">
        <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full border-[14px] border-white/10 animate-float" />
        <BotAvatar pulse={!offline} />
        <div className="relative min-w-0 flex-1">
          <p className="text-headline-sm font-bold leading-tight">Study Buddy</p>
          <p className="truncate text-label-md text-on-primary-container">
            {status.loading ? 'Connecting…' : offline ? 'Offline · not configured' : 'AI Academic Tutor · Online'}
          </p>
        </div>
        <div className="relative flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clear}
              disabled={sending}
              title="Start a new chat"
              aria-label="Start a new chat"
              className="rounded-lg p-1.5 text-on-primary/80 transition-all hover:rotate-[-8deg] hover:bg-white/15 hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="restart_alt" size={18} />
            </button>
          )}
          {!isPage && (
            <button
              type="button"
              onClick={() => navigate('/assistant')}
              title="Open full screen"
              aria-label="Open full screen"
              className="rounded-lg p-1.5 text-on-primary/80 transition-all hover:scale-110 hover:bg-white/15 hover:text-on-primary"
            >
              <Icon name="open_in_full" size={18} />
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close"
              aria-label="Close assistant"
              className="rounded-lg p-1.5 text-on-primary/80 transition-all hover:rotate-90 hover:bg-white/15 hover:text-on-primary"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>
      </div>

      {offline && (
        <div className="flex items-start gap-2 border-b border-error-container bg-error-container/50 px-4 py-2 text-body-sm text-on-error-container animate-fade-in">
          <Icon name="cloud_off" size={18} className="mt-0.5" />
          <span>The AI assistant isn&apos;t configured on the server yet. Ask the system administrator to set <code className="font-mono">GEMINI_API_KEY</code>.</span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="thin-scroll min-h-0 flex-1 space-y-4 overflow-y-auto bg-surface-container-low/40 px-4 py-4" aria-live="polite">
        {messages.length === 0 ? (
          <div className="animate-fade-up">
            <div className="flex flex-col items-center pb-4 pt-2 text-center">
              <div className="animate-float"><BotAvatar size="h-14 w-14" /></div>
              <h3 className="mt-3 text-headline-sm font-bold text-on-surface">Hi {user?.username}! I&apos;m your Study Buddy 👋</h3>
              <p className="mt-1 max-w-sm text-body-sm text-on-surface-variant">
                Ask me about your timetable, results or attendance — or get help understanding any subject.
              </p>
            </div>
            {isPage && (
              <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CAPABILITIES.map((c, i) => (
                  <div key={c.title} style={{ '--d': `${i * 70}ms` }} className="card-lift flex items-start gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 animate-fade-up stagger">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-fixed/60 text-primary"><Icon name={c.icon} size={18} /></div>
                    <div>
                      <p className="text-label-lg font-semibold text-on-surface">{c.title}</p>
                      <p className="text-body-sm text-on-surface-variant">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mb-2 px-1 text-label-sm uppercase tracking-wider text-outline">Try asking</p>
            <div className={`grid gap-2 ${isPage ? 'sm:grid-cols-2' : ''}`}>
              {SUGGESTIONS.slice(0, isPage ? 6 : 4).map((s, i) => (
                <button
                  key={s.text}
                  type="button"
                  disabled={sending || offline}
                  onClick={() => submit(s.text)}
                  style={{ '--d': `${120 + i * 60}ms` }}
                  className="group flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-left text-body-sm text-on-surface-variant transition-all animate-fade-up stagger hover:-translate-y-0.5 hover:border-primary-container hover:text-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name={s.icon} size={18} className="text-primary transition-transform group-hover:scale-110" />
                  <span className="flex-1">{s.text}</span>
                  <Icon name="arrow_forward" size={16} className="-translate-x-1 text-outline opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="flex justify-end animate-fade-up">
                <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-primary-container to-primary px-3.5 py-2 text-body-md text-on-primary shadow-sm">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="group flex items-start gap-2 animate-fade-up">
                <BotAvatar size="h-7 w-7" />
                <div className="min-w-0 max-w-[88%]">
                  {m.error ? (
                    <div className="rounded-2xl rounded-tl-md border border-error/30 bg-error-container/60 px-3.5 py-2 text-body-md text-on-error-container">
                      <div className="flex items-start gap-2">
                        <Icon name="error" size={18} className="mt-0.5" />
                        <span>{m.content}</span>
                      </div>
                      {m.retryText && (
                        <button
                          type="button"
                          onClick={() => retry(m)}
                          disabled={sending}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-error px-2.5 py-1 text-label-sm font-semibold text-on-error transition-all hover:bg-error/90 disabled:opacity-50"
                        >
                          <Icon name="refresh" size={14} /> Try again
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl rounded-tl-md border border-outline-variant/40 bg-surface-container-lowest px-3.5 py-2.5 text-body-md text-on-surface-variant shadow-sm">
                        <Markdown text={m.content} />
                      </div>
                      <div className="mt-0.5 pl-1"><CopyButton text={m.content} /></div>
                    </>
                  )}
                </div>
              </div>
            ),
          )
        )}
        {sending && (
          <div className="flex items-start gap-2 animate-fade-in">
            <BotAvatar size="h-7 w-7" />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-primary shadow-sm" role="status" aria-label="Study Buddy is typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="border-t border-outline-variant/40 bg-surface-container-lowest p-3">
        <div className="flex items-end gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-low/60 p-1.5 transition-all focus-within:border-primary-container focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary-container/25">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={ASSISTANT_LIMITS.MAX_MESSAGE_CHARS}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={offline ? 'Assistant offline' : 'Ask about your classes, results or any topic…'}
            aria-label="Message Study Buddy"
            disabled={offline}
            className="thin-scroll max-h-36 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-body-md text-on-surface placeholder:text-outline focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending || offline}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary shadow-sm transition-all hover:scale-105 hover:bg-primary active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-outline disabled:shadow-none"
          >
            <Icon name={sending ? 'progress_activity' : 'send'} size={18} filled className={sending ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-outline">
          <span>AI can make mistakes — double-check important info with your teacher.</span>
          {remaining < 300 && <span className={remaining < 50 ? 'font-semibold text-error' : ''}>{remaining}</span>}
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;

