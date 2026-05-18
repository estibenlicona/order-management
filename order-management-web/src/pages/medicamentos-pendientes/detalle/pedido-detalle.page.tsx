import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { pedidosService } from '@services/pedidos.service';
import { Button } from '@components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@components/ui/alert';
import { Spinner } from '@components/ui/spinner';
import { CambiarEstadoModal } from '../components/cambiar-estado-modal';
import { ObservacionComposer } from './components/observacion-composer';
import { PedidoHeader } from './components/pedido-header';
import { Timeline } from './components/timeline';

export function PedidoDetallePage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [estadoOpen, setEstadoOpen] = useState(false);

  const enabledId = id ?? '';

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['pedido', enabledId],
    queryFn: () => pedidosService.getById(enabledId),
    enabled: enabledId !== '',
    retry: false,
  });

  const errorIsNotFound =
    error instanceof Error && /\b404\b/.test(error.message);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
          <Link
            to="/medicamentos-pendientes"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver al listado
          </Link>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
            <Spinner /> Cargando detalle del pedido...
          </div>
        )}

        {error !== null && !isLoading && (
          <Alert variant="destructive">
            <AlertTitle>{errorIsNotFound ? 'Pedido no encontrado' : 'Error al cargar el pedido'}</AlertTitle>
            <AlertDescription>
              <p className="mb-3">
                {errorIsNotFound
                  ? 'El pedido que intentas ver no existe o fue eliminado.'
                  : 'No fue posible cargar la información del pedido. Verifica tu conexión.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {!errorIsNotFound && (
                  <Button variant="outline" size="sm" onClick={() => void refetch()}>
                    Reintentar
                  </Button>
                )}
                <Link
                  to="/medicamentos-pendientes"
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted shadow-xs transition-colors"
                >
                  Volver al listado
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {data !== undefined && (
          <>
            <PedidoHeader pedido={data} />

            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3 pb-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    Trazabilidad
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Historial cronológico de observaciones y cambios de estado.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEstadoOpen(true)}>
                  <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Cambiar estado
                </Button>
              </div>

              <ObservacionComposer pedidoId={data.id} />

              <div className={isFetching && !isLoading ? 'opacity-70 transition-opacity pt-2' : 'transition-opacity pt-2'}>
                <Timeline
                  estados={data.estados}
                  comentarios={data.comentarios}
                />
              </div>
            </section>
          </>
        )}

      <CambiarEstadoModal
        pedido={estadoOpen && data !== undefined ? data : null}
        onClose={() => setEstadoOpen(false)}
      />
    </div>
  );
}
