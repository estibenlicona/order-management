import { useSearchParams } from 'react-router-dom';
import { MedicamentosTable } from './components/medicamentos-table';
import { MedicamentoUpload } from './components/medicamento-upload';
import type { FiltroEstado, OrderBy } from './components/medicamentos-table';

type MainTab = 'lista' | 'agregar';

function isMainTab(v: string | null): v is MainTab {
  return v === 'lista' || v === 'agregar';
}

function isFiltroEstado(v: string | null): v is FiltroEstado {
  return v === 'ACTIVO' || v === 'ENTREGADO' || v === 'todos';
}

function isOrderBy(v: string | null): v is OrderBy {
  return (
    v === 'createdAt_desc' ||
    v === 'fecha_asc' ||
    v === 'fecha_desc' ||
    v === 'pendiente_asc' ||
    v === 'pendiente_desc'
  );
}

export function MedicamentosPendientesPage(): JSX.Element {
  const [params] = useSearchParams();
  const mainTab: MainTab = isMainTab(params.get('tab')) ? (params.get('tab') as MainTab) : 'lista';

  const initialFiltroEstado = isFiltroEstado(params.get('filtroEstado'))
    ? (params.get('filtroEstado') as FiltroEstado)
    : undefined;
  const initialSucursal = params.get('sucursal') ?? undefined;
  const initialOrderBy = isOrderBy(params.get('orderBy'))
    ? (params.get('orderBy') as OrderBy)
    : undefined;

  return mainTab === 'lista' ? (
    <MedicamentosTable
      {...(initialFiltroEstado !== undefined && { initialFiltroEstado })}
      {...(initialSucursal !== undefined && { initialSucursal })}
      {...(initialOrderBy !== undefined && { initialOrderBy })}
    />
  ) : (
    <MedicamentoUpload />
  );
}
