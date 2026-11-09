'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  title?: string;
  duration?: number;
}

export function showToast(toast: Omit<ToastItem, 'id'>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('hd:toast', {
      detail: toast,
    })
  );
}

export default function ToastManager() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const startTimesRef = useRef<Record<string, number>>({});
  const remainingTimesRef = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
    delete startTimesRef.current[id];
    delete remainingTimesRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pauseToast = useCallback((id: string) => {
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      const elapsed = Date.now() - (startTimesRef.current[id] || Date.now());
      const currentRemaining = remainingTimesRef.current[id] ?? 5000;
      remainingTimesRef.current[id] = Math.max(0, currentRemaining - elapsed);
    }
  }, []);

  const resumeToast = useCallback(
    (id: string) => {
      const remaining = remainingTimesRef.current[id] ?? 5000;
      if (remaining <= 0) {
        removeToast(id);
        return;
      }
      startTimesRef.current[id] = Date.now();
      timeoutsRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, remaining);
    },
    [removeToast]
  );

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Omit<ToastItem, 'id'>>;
      const detail = customEvent.detail;
      if (!detail || !detail.message) return;

      const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now() + Math.random());
      const duration = detail.duration || 5000;

      const newToast: ToastItem = {
        id,
        type: detail.type || 'info',
        message: detail.message,
        title: detail.title,
        duration,
      };

      setToasts((prev) => {
        // Keep maximum 3 stacked
        const updated = [...prev, newToast];
        if (updated.length > 3) {
          const removed = updated.shift();
          if (removed && timeoutsRef.current[removed.id]) {
            clearTimeout(timeoutsRef.current[removed.id]);
          }
        }
        return updated;
      });

      startTimesRef.current[id] = Date.now();
      remainingTimesRef.current[id] = duration;
      timeoutsRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);
    };

    window.addEventListener('hd:toast', handleToastEvent);
    return () => {
      window.removeEventListener('hd:toast', handleToastEvent);
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="hd-toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? AlertCircle
            : Info;

        return (
          <div
            key={toast.id}
            className={`hd-toast hd-toast-${toast.type}`}
            onMouseEnter={() => pauseToast(toast.id)}
            onMouseLeave={() => resumeToast(toast.id)}
            onFocus={() => pauseToast(toast.id)}
            onBlur={() => resumeToast(toast.id)}
            tabIndex={0}
          >
            <div className="hd-toast-content">
              <span className="hd-toast-icon-wrap" aria-hidden="true">
                <Icon size={18} />
              </span>
              <div className="hd-toast-text">
                {toast.title && <strong className="hd-toast-title">{toast.title}</strong>}
                <p className="hd-toast-message">{toast.message}</p>
              </div>
              <button
                type="button"
                className="hd-toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
            <div
              className="hd-toast-progress-bar"
              style={{ animationDuration: `${toast.duration || 5000}ms` }}
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
}
