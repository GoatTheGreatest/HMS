'use client';

import { useState, useCallback, useEffect, createContext, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';

/* ── Context ─────────────────────────────────────────────── */
const ToastCtx = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, type = 'info') => {
    const id = ++_id;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <Toasts items={toasts} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/* ── Toasts portal ───────────────────────────────────────── */
const ICON = { success: '✅', error: '❌', info: 'ℹ️' };
const STYLE = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-slate-700',
};

function Toasts({ items }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  if (!mounted || items.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-9999 flex flex-col gap-2 pointer-events-none"
    >
      {items.map(t => (
        <div
          key={t.id}
          className={`${STYLE[t.type]} text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in pointer-events-auto max-w-xs`}
        >
          <span>{ICON[t.type]}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>,
    document.body
  );
}
