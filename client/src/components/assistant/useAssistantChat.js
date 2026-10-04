import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../api/axios';

// Must match backend limits in AssistantChatService / ChatTurn
const MAX_HISTORY_TURNS = 12;
const MAX_TURN_CHARS = 4000;
const MAX_MESSAGE_CHARS = 2000;
const MAX_STORED_MESSAGES = 60;

export const ASSISTANT_LIMITS = { MAX_MESSAGE_CHARS };
const SYNC_EVENT = 'sims-assistant-sync';

let idSeq = 0;
const newId = () => `${Date.now().toString(36)}-${(idSeq++).toString(36)}`;

function loadMessages(key) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant')) : [];
  } catch {
    return [];
  }
}

function saveMessages(key, messages) {
  try {
    sessionStorage.setItem(key, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  } catch {
    /* storage full / disabled – chat still works in memory */
  }
}

export function describeError(err) {
  const status = err?.response?.status;
  const detail = err?.response?.data?.detail;
  if (status === 401 || status === 403) return 'Your session has expired or you do not have access. Please sign in again as a student.';
  if (status === 400) return detail && detail !== 'Validation failed' ? detail : 'That message could not be sent. Try a shorter message.';
  if (detail) return detail;
  if (err?.code === 'ECONNABORTED') return 'The AI took too long to answer. Please try again.';
  if (!err?.response) return 'Cannot reach the SIMS server. Check your connection and try again.';
  return 'Something went wrong while contacting the AI assistant. Please try again.';
}

/** Turns stored chat messages into the bounded history payload the backend accepts. */
export function toHistory(messages) {
  return messages
    .filter((m) => !m.error && m.content.trim())
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: m.role,
      content: m.content.length > MAX_TURN_CHARS ? `${m.content.slice(0, MAX_TURN_CHARS - 2)} …` : m.content,
    }));
}

/**
 * Chat state for the student AI assistant. Conversation is kept per user in sessionStorage
 * (cleared when the browser tab closes) and shared between the floating widget and the full page.
 */
export function useAssistantChat(username) {
  const storageKey = `sims.assistant.v1.${username || 'anonymous'}`;
  const [messages, setMessages] = useState(() => loadMessages(storageKey));
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ loading: true, enabled: null, model: null });
  const messagesRef = useRef(messages);
  const sendingRef = useRef(false);
  const instanceId = useRef(newId());

  const commit = useCallback((next) => {
    messagesRef.current = next;
    saveMessages(storageKey, next);
    setMessages(next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key: storageKey, source: instanceId.current } }));
    }
  }, [storageKey]);

  // Another view (widget <-> full page) changed the conversation: pick up the stored copy.
  useEffect(() => {
    const onSync = (e) => {
      if (e.detail?.key !== storageKey || e.detail?.source === instanceId.current) return;
      const next = loadMessages(storageKey);
      messagesRef.current = next;
      setMessages(next);
    };
    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, [storageKey]);

  useEffect(() => {
    let alive = true;
    api.get('/assistant/status')
      .then((res) => alive && setStatus({ loading: false, enabled: !!res.data?.enabled, model: res.data?.model || null }))
      .catch(() => alive && setStatus({ loading: false, enabled: null, model: null }));
    return () => { alive = false; };
  }, []);

  const send = useCallback(async (rawText) => {
    const text = String(rawText ?? '').trim().slice(0, MAX_MESSAGE_CHARS);
    if (!text || sendingRef.current) return false;

    // Drop trailing error bubbles before sending a new question
    const base = messagesRef.current.filter((m) => !m.error);
    const history = toHistory(base);
    const userMsg = { id: newId(), role: 'user', content: text, at: Date.now() };
    commit([...base, userMsg]);

    sendingRef.current = true;
    setSending(true);
    try {
      const res = await api.post('/assistant/chat', { message: text, history }, { timeout: 90_000 });
      const reply = (res.data?.reply || '').trim() || 'Sorry, I could not come up with an answer. Please try rephrasing.';
      commit([...messagesRef.current, { id: newId(), role: 'assistant', content: reply, at: Date.now() }]);
      setStatus((s) => ({ ...s, enabled: true, model: res.data?.model || s.model }));
      return true;
    } catch (err) {
      if (err?.response?.status === 503) setStatus((s) => ({ ...s, enabled: false }));
      commit([...messagesRef.current, { id: newId(), role: 'assistant', content: describeError(err), error: true, retryText: text, at: Date.now() }]);
      return false;
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, [commit]);

  const retry = useCallback((errorMsg) => {
    if (!errorMsg?.retryText || sendingRef.current) return;
    // remove the failed user turn + its error bubble, then resend
    const msgs = messagesRef.current;
    const idx = msgs.findIndex((m) => m.id === errorMsg.id);
    const trimmed = idx > 0 && msgs[idx - 1].role === 'user' ? msgs.slice(0, idx - 1) : msgs.filter((m) => m.id !== errorMsg.id);
    commit(trimmed);
    send(errorMsg.retryText);
  }, [commit, send]);

  const clear = useCallback(() => commit([]), [commit]);

  return { messages, sending, status, send, retry, clear };
}
