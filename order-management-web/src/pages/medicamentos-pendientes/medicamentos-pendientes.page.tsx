import { useSearchParams } from 'react-router-dom';
import { MedicamentosTable } from './components/medicamentos-table';
import { MedicamentoUpload } from './components/medicamento-upload';

type MainTab = 'lista' | 'agregar';

function isMainTab(v: string | null): v is MainTab {
  return v === 'lista' || v === 'agregar';
}

export function MedicamentosPendientesPage(): JSX.Element {
  const [params] = useSearchParams();
  const mainTab: MainTab = isMainTab(params.get('tab')) ? (params.get('tab') as MainTab) : 'lista';

  return mainTab === 'lista' ? <MedicamentosTable /> : <MedicamentoUpload />;
}
