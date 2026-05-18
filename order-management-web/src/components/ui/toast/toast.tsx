import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@lib/cn';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: ReactNode;
  durationMs: number;
}

interface ToastApi {
  success: (message: ReactNode, opts?: { durationMs?: number }) => void;
  error: (message: ReactNode, opts?: { durationMs?: number }) => void;
  info: (message: ReactNode, opts?: { durationMs?: number }) => void;
  warning: (message: ReactNode, opts?: { durationMs?: number }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const MAX_STACK = 3;
const DEFAULT_DURATION_MS = 4_000;

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (ctx === null) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number): void => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: ReactNode, durationMs: number): void => {
      idRef.current += 1;
      const item: ToastItem = { id: idRef.current, variant, message, durationMs };
      setToasts(prev => {
        const next = [...prev, item];
        return next.length > MAX_STACK ? next.slice(next.length - MAX_STACK) : next;
      });
    },
    [],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m, o): void => push('success', m, o?.durationMs ?? DEFAULT_DURATION_MS),
      error: (m, o): void => push('error', m, o?.durationMs ?? DEFAULT_DURATION_MS),
      info: (m, o): void => push('info', m, o?.durationMs ?? DEFAULT_DURATION_MS),
      warning: (m, o): void => push('warning', m, o?.durationMs ?? DEFAULT_DURATION_MS),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

function ToastViewport({ toasts, onDismiss }: ToastViewportProps): JSX.Element | null {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-end gap-2 p-4 sm:inset-x-auto sm:right-0"
    >
      {toasts.map(t => (
        <ToastView key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-success/20 bg-background text-foreground',
  error: 'border-destructive/20 bg-background text-foreground',
  warning: 'border-warning/20 bg-background text-foreground',
  info: 'border-primary/20 bg-background text-foreground',
};

const VARIANT_ICON: Record<ToastVariant, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const VARIANT_ICON_COLOR: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-primary',
};

interface ToastViewProps {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}

function ToastView({ toast, onDismiss }: ToastViewProps): JSX.Element {
  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(toast.id), toast.durationMs);
    return (): void => window.clearTimeout(t);
  }, [toast.durationMs, toast.id, onDismiss]);

  const Icon = VARIANT_ICON[toast.variant];

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto w-full sm:w-auto sm:min-w-[320px] sm:max-w-md',
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
        'animate-toast-in',
        VARIANT_STYLES[toast.variant],
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', VARIANT_ICON_COLOR[toast.variant])} aria-hidden="true" />
      <div className="flex-1 leading-snug">{toast.message}</div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
