import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosService } from '@services/pedidos.service';
import type { PedidoFull } from '../../../types/pedido.types';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Select } from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { FormField } from '@components/ui/form-field';
import { Alert } from '@components/ui/alert';
import { useToast } from '@components/ui/toast/toast';
import { EstadoBadge } from './estado-badge';

const ESTADOS = ['ACTIVO', 'ENTREGADO'] as const;

interface Props {
  pedido: PedidoFull | null;
  onClose: () => void;
}

export function CambiarEstadoModal({ pedido, onClose }: Props): JSX.Element {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [estado, setEstado] = useState('ACTIVO');
  const [observacion, setObservacion] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (pedido !== null) {
      setEstado(pedido.estadoActual ?? 'ACTIVO');
      setObservacion('');
      const t = window.setTimeout(() => selectRef.current?.focus(), 50);
      return (): void => window.clearTimeout(t);
    }
    return undefined;
  }, [pedido]);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: () =>
      pedidosService.addEstado(
        pedido?.id ?? '',
        estado,
        observacion.trim() || undefined,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      if (pedido !== null) {
        void queryClient.invalidateQueries({ queryKey: ['pedido', pedido.id] });
      }
      toast.success(`Estado actualizado a "${estado}"`);
      onClose();
    },
  });

  function handleClose(): void {
    reset();
    onClose();
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (estado.trim() === '' || isPending) return;
    mutate();
  }

  const canSubmit = estado.trim() !== '' && !isPending;

  return (
    <Dialog open={pedido !== null} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={handleClose}>
          <DialogTitle>Cambiar estado</DialogTitle>
          {pedido !== null && (
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {pedido.clienteNombre} — <span className="font-mono text-xs">{pedido.medicamentoCodigo}</span>
            </p>
          )}
        </DialogHeader>

        <DialogBody className="space-y-4">
          {pedido !== null && pedido.estadoActual !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Estado actual:</span>
              <EstadoBadge estado={pedido.estadoActual} />
            </div>
          )}

          <FormField label="Nuevo estado" required>
            <Select ref={selectRef} value={estado} onChange={e => setEstado(e.target.value)}>
              {ESTADOS.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Observación" helper="Opcional. Queda en la bitácora del pedido.">
            <Textarea
              rows={3}
              value={observacion}
              onChange={e => setObservacion(e.target.value)}
              placeholder="Detalle del cambio..."
            />
          </FormField>

          {error !== null && (
            <Alert variant="destructive">
              {error instanceof Error ? error.message : 'Error al actualizar el estado.'}
            </Alert>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            isLoading={isPending}
            loadingText="Guardando..."
          >
            Guardar estado
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
