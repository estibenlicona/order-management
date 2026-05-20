import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  RefreshCcw,
  Search,
} from 'lucide-react';
import { pedidosService } from '@services/pedidos.service';
import type { PageSize, PedidoFull } from '../../../types/pedido.types';
import { cn } from '@lib/cn';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Spinner } from '@components/ui/spinner';
import { Alert } from '@components/ui/alert';
import { Badge } from '@components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationStatus,
} from '@components/ui/pagination';
import { EstadoBadge } from './estado-badge';
import { CambiarEstadoModal } from './cambiar-estado-modal';

const PAGE_SIZE_OPTIONS: PageSize[] = [10, 20, 50, 100];

export type FiltroEstado = 'ACTIVO' | 'ENTREGADO' | 'todos';
type SortCol = 'fecha' | 'pendiente';
type SortDir = 'asc' | 'desc';
export type OrderBy = 'fecha_asc' | 'fecha_desc' | 'pendiente_asc' | 'pendiente_desc' | 'createdAt_desc';

function toOrderBy(col: SortCol, dir: SortDir): OrderBy {
  if (col === 'fecha') return dir === 'asc' ? 'fecha_asc' : 'fecha_desc';
  return dir === 'desc' ? 'pendiente_desc' : 'pendiente_asc';
}

function parseOrderBy(ob: OrderBy | undefined): { col: SortCol; dir: SortDir } {
  switch (ob) {
    case 'fecha_asc':     return { col: 'fecha',    dir: 'asc' };
    case 'fecha_desc':    return { col: 'fecha',    dir: 'desc' };
    case 'pendiente_asc': return { col: 'pendiente', dir: 'asc' };
    case 'pendiente_desc': return { col: 'pendiente', dir: 'desc' };
    default:              return { col: 'fecha',    dir: 'asc' };
  }
}

interface MedicamentosTableProps {
  initialFiltroEstado?: FiltroEstado;
  initialSucursal?: string;
  initialOrderBy?: OrderBy;
}

function diasDesde(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const origen = new Date(fecha + 'T00:00:00');
  return Math.floor((hoy.getTime() - origen.getTime()) / 86_400_000);
}

function criticidadClass(dias: number): string {
  if (dias <= 15) return 'bg-success-subtle text-success-subtle-foreground ring-success/20';
  if (dias <= 30) return 'bg-warning-subtle text-warning-subtle-foreground ring-warning/20';
  if (dias <= 60) return 'bg-warning-subtle text-warning-subtle-foreground ring-warning/40';
  return 'bg-destructive-subtle text-destructive-subtle-foreground ring-destructive/20';
}

function CriticidadBadge({ dias }: { dias: number }): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex min-w-[44px] items-center justify-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset tabular-nums',
        criticidadClass(dias),
      )}
      title={`${dias} días desde la solicitud`}
    >
      {dias}d
    </span>
  );
}

interface SortableHeadProps {
  col: SortCol;
  label: string;
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
  className?: string;
}

function SortableHead({ col, label, sortCol, sortDir, onSort, className }: SortableHeadProps): JSX.Element {
  const isActive = sortCol === col;
  const Icon = isActive ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead
      onClick={() => onSort(col)}
      className={cn(
        'cursor-pointer select-none transition-colors hover:bg-muted/80',
        isActive && 'text-foreground',
        className,
      )}
      aria-sort={isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        <Icon className={cn('h-3 w-3', isActive ? 'text-foreground' : 'text-muted-foreground/50')} />
      </span>
    </TableHead>
  );
}

const CRITICIDAD_LEGEND = [
  { range: '≤15 días', dot: 'bg-success' },
  { range: '16–30 días', dot: 'bg-warning' },
  { range: '31–60 días', dot: 'bg-warning ring-1 ring-warning/50' },
  { range: '>60 días', dot: 'bg-destructive' },
] as const;

export function MedicamentosTable(props: MedicamentosTableProps = {}): JSX.Element {
  const initialSort = parseOrderBy(props.initialOrderBy);
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>(props.initialFiltroEstado ?? 'ACTIVO');
  const [sucursal, setSucursal] = useState<string | undefined>(props.initialSucursal);
  const [sortCol, setSortCol] = useState<SortCol>(initialSort.col);
  const [sortDir, setSortDir] = useState<SortDir>(initialSort.dir);
  const [selectedPedido, setSelectedPedido] = useState<PedidoFull | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(inputValue.trim());
    }, 300);
    return (): void => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  useEffect(() => {
    setPage(1);
  }, [search, filtroEstado, sucursal, sortCol, sortDir]);

  function handleSort(col: SortCol): void {
    if (col === sortCol) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir(col === 'fecha' ? 'asc' : 'desc');
    }
  }

  const orderBy = toOrderBy(sortCol, sortDir);

  const { data, isLoading, isPlaceholderData, error } = useQuery({
    queryKey: ['pedidos', { page, pageSize, search, filtroEstado, sucursal, orderBy }],
    queryFn: () =>
      pedidosService.getAll({
        page,
        pageSize,
        ...(search !== '' && { search }),
        ...(filtroEstado !== 'todos' && { filtroEstado }),
        ...(sucursal !== undefined && { sucursal }),
        orderBy,
      }),
    placeholderData: keepPreviousData,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  if (isLoading && data === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Spinner /> Cargando...
      </div>
    );
  }
  if (error) {
    return <Alert variant="destructive">Error al cargar los pedidos.</Alert>;
  }

  const filterBtn = (value: FiltroEstado, label: string): JSX.Element => (
    <button
      type="button"
      onClick={() => setFiltroEstado(value)}
      className={cn(
        'inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        filtroEstado === value
          ? 'bg-background text-foreground shadow-xs ring-1 ring-inset ring-border'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Buscar por documento, paciente o código..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              aria-label="Buscar"
              className="pl-9"
            />
          </div>

          <div className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-muted/40 p-1" role="group" aria-label="Filtrar por estado">
            {filterBtn('ACTIVO', 'Activos')}
            {filterBtn('ENTREGADO', 'Entregados')}
            {filterBtn('todos', 'Todos')}
          </div>

          {sucursal !== undefined && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-border">
              Sucursal: {sucursal}
              <button
                type="button"
                onClick={() => setSucursal(undefined)}
                aria-label="Quitar filtro de sucursal"
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                ×
              </button>
            </span>
          )}

          <span className="ml-auto text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{total}</span> registros
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="font-medium uppercase tracking-wider text-foreground/70">Criticidad</span>
          {CRITICIDAD_LEGEND.map(item => (
            <span key={item.range} className="inline-flex items-center gap-1.5">
              <span className={cn('h-1.5 w-1.5 rounded-full', item.dot)} />
              <span>{item.range}</span>
            </span>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No hay pedidos que mostrar</p>
            <p className="mt-1 text-sm text-muted-foreground">Ajusta los filtros o la búsqueda para ver resultados.</p>
          </div>
        ) : (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead
                    col="fecha"
                    label="Días"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <TableHead>Documento</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden lg:table-cell">Cod. Med.</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <SortableHead
                    col="pendiente"
                    label="Pend."
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="text-center"
                  />
                  <TableHead className="hidden md:table-cell text-center">Entr.</TableHead>
                  <TableHead className="hidden xl:table-cell">Fecha</TableHead>
                  <TableHead className="hidden xl:table-cell">Sucursal</TableHead>
                  <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="sticky right-0 bg-muted/40 w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(p => (
                  <TableRow key={p.id} className="group">
                    <TableCell>
                      <CriticidadBadge dias={diasDesde(p.fecha)} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.clienteIdentificacion}</TableCell>
                    <TableCell className="max-w-[180px] truncate font-medium" title={p.clienteNombre}>
                      {p.clienteNombre}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">{p.medicamentoCodigo}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-foreground" title={p.medicamentoNombre}>
                      {p.medicamentoNombre}
                    </TableCell>
                    <TableCell className="text-center font-semibold tabular-nums text-foreground">
                      {p.cantidadPendiente}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center tabular-nums text-muted-foreground">
                      {p.cantidadEntregada}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell whitespace-nowrap text-muted-foreground tabular-nums">
                      {p.fecha}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {p.sucursal ?? '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {p.medicamentoTipoMedica === undefined ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <Badge
                          variant={p.medicamentoTipoMedica === 'POS' ? 'success' : 'info'}
                          className="min-w-[52px] justify-center"
                        >
                          {p.medicamentoTipoMedica}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <EstadoBadge estado={p.estadoActual ?? 'SIN ESTADO'} />
                    </TableCell>
                    <TableCell className="sticky right-0 bg-background group-hover:bg-muted/40 transition-colors">
                      <div className="flex items-center justify-end gap-0.5">
                        <Link
                          to={`/medicamentos-pendientes/${p.id}`}
                          aria-label="Ver detalle"
                          title="Ver detalle"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedPedido(p)}
                          aria-label="Cambiar estado"
                          title="Cambiar estado"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                        >
                          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1 || isPlaceholderData}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationStatus page={page} totalPages={totalPages} />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages || isPlaceholderData}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-muted-foreground">
              Filas:
            </label>
            <Select
              id="pageSize"
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value) as PageSize);
                setPage(1);
              }}
              className="w-auto"
            >
              {PAGE_SIZE_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <CambiarEstadoModal
        pedido={selectedPedido}
        onClose={() => setSelectedPedido(null)}
      />
    </>
  );
}
