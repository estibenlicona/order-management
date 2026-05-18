import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { pedidosService } from '@services/pedidos.service';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { Alert } from '@components/ui/alert';
import { useToast } from '@components/ui/toast/toast';
import { useAuth, getDisplayName } from '@contexts/auth-context';
import { cn } from '@lib/cn';
import { getAvatarColor, getInitials } from '@lib/initials';

interface Props {
  pedidoId: string;
}

export function ObservacionComposer({ pedidoId }: Props): JSX.Element {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();
  const [contenido, setContenido] = useState('');

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => pedidosService.addComentario(pedidoId, contenido.trim()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedido', pedidoId] });
      toast.success('Observación agregada');
      setContenido('');
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (contenido.trim() === '' || isPending) return;
    mutate();
  }

  const displayName = getDisplayName(user);
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);
  const canSubmit = contenido.trim() !== '' && !isPending;
  const charCount = contenido.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-background shadow-xs transition-all focus-within:border-border-strong focus-within:shadow-sm"
    >
      <div className="flex gap-3 p-4">
        <div
          aria-hidden="true"
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-inset ring-black/5',
            avatarColor,
          )}
          title={displayName}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <Textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            placeholder="Deja una observación..."
            rows={2}
            maxLength={2000}
            disabled={isPending}
            className="resize-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:border-none min-h-[3rem] text-sm"
          />

          {error !== null && (
            <Alert variant="destructive">
              {error instanceof Error ? error.message : 'Error al guardar la observación.'}
            </Alert>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-2.5 rounded-b-xl">
        <span className="text-xs text-muted-foreground truncate" title={displayName}>
          Publicando como <span className="font-medium text-foreground">{displayName}</span>
        </span>

        <div className="flex items-center gap-3">
          {charCount > 0 && (
            <span className={cn(
              'text-xs tabular-nums',
              charCount > 1800 ? 'text-warning-subtle-foreground' : 'text-muted-foreground',
            )}>
              {charCount}/2000
            </span>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!canSubmit}
            isLoading={isPending}
            loadingText="Publicando..."
          >
            <Send className="h-3 w-3" aria-hidden="true" />
            Publicar
          </Button>
        </div>
      </div>
    </form>
  );
}
