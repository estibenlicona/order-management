import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@lib/cn';

interface DialogContextValue {
  titleId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, children, className }: DialogProps): JSX.Element | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;

    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (panel === null) return;
      const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = focusables[0];
      if (first !== undefined) {
        first.focus();
      } else {
        panel.focus();
      }
    }, 0);

    return (): void => {
      window.clearTimeout(t);
      prev?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return (): void => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return (): void => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <DialogContext.Provider value={{ titleId }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div
          className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={panelRef}
          tabIndex={-1}
          className={cn(
            'relative z-10 w-full max-w-md rounded-xl border border-border bg-background shadow-xl outline-none animate-scale-in',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>,
    document.body,
  );
}

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export function DialogHeader({ className, onClose, children, ...props }: DialogHeaderProps): JSX.Element {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 border-b border-border px-6 py-4', className)}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {onClose !== undefined && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
DialogHeader.displayName = 'DialogHeader';

export function DialogTitle({ className, id, ...props }: HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  const ctx = useContext(DialogContext);
  const resolvedId = id ?? ctx?.titleId;
  return (
    <h2
      {...(resolvedId !== undefined && { id: resolvedId })}
      className={cn('text-base font-semibold leading-tight tracking-tight text-foreground', className)}
      {...props}
    />
  );
}
DialogTitle.displayName = 'DialogTitle';

export function DialogBody({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('px-6 py-5', className)} {...props} />;
}
DialogBody.displayName = 'DialogBody';

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-3 rounded-b-xl', className)}
      {...props}
    />
  );
}
DialogFooter.displayName = 'DialogFooter';
