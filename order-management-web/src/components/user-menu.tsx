import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth, getDisplayName } from '@contexts/auth-context';
import { authActions } from '@hooks/use-auth-actions';
import { useToast } from '@components/ui/toast/toast';
import { cn } from '@lib/cn';
import { getAvatarColor, getInitials } from '@lib/initials';

export function UserMenu(): JSX.Element | null {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent): void {
      const node = containerRef.current;
      if (node !== null && !node.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return (): void => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (user === null) return null;

  const name = getDisplayName(user);
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  async function handleSignOut(): Promise<void> {
    setOpen(false);
    const result = await authActions.signOut();
    if (!result.ok) {
      toast.error(result.error ?? 'No fue posible cerrar sesión');
      return;
    }
    toast.success('Sesión cerrada');
    void navigate('/login', { replace: true });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-2 rounded-lg pl-1 pr-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ring-inset ring-black/5',
            avatarColor,
          )}
        >
          {initials}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1.5 w-64 origin-top-right rounded-xl border border-border bg-background shadow-lg animate-scale-in"
        >
          <div className="border-b border-border px-3 py-3">
            <p className="truncate text-sm font-medium text-foreground" title={name}>
              {name}
            </p>
            {user.email !== undefined && user.email !== name && (
              <p className="truncate text-xs text-muted-foreground" title={user.email}>
                {user.email}
              </p>
            )}
          </div>
          <div className="p-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignOut()}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:bg-muted"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
