import { Fragment, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Papa from 'papaparse';
import { useQueryClient } from '@tanstack/react-query';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle, ChevronDown } from 'lucide-react';
import { pedidosService } from '@services/pedidos.service';
import { REQUIRED_CSV_COLUMNS } from '../../../types/pedido.types';
import type {
  CsvRawRow,
  BatchValidationResult,
  BatchProcessResult,
} from '../../../types/pedido.types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationStatus,
} from '@components/ui/pagination';
import { useToast } from '@components/ui/toast/toast';
import { cn } from '@lib/cn';

type Step = 'idle' | 'preview' | 'validating' | 'validated' | 'confirming' | 'done';

const ROWS_PER_PAGE = 10;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeHeaders(data: Record<string, string>[]): CsvRawRow[] {
  return data.map(row => {
    const normalized: CsvRawRow = {};
    let fechaCount = 0;
    let obsCount = 0;
    let userCount = 0;

    for (const [key, val] of Object.entries(row)) {
      const k = key.trim();
      if (k === 'Fecha' && fechaCount > 0) {
        normalized[`Fecha_${fechaCount}`] = val;
        fechaCount++;
      } else if (k === 'Observacion' && obsCount > 0) {
        normalized[`Observacion_${obsCount}`] = val;
        obsCount++;
      } else if (k === 'Usuario' && userCount > 0) {
        normalized[`Usuario_${userCount}`] = val;
        userCount++;
      } else {
        normalized[k] = val;
        if (k === 'Fecha') fechaCount = 1;
        if (k === 'Observacion') obsCount = 1;
        if (k === 'Usuario') userCount = 1;
      }
    }

    return {
      identificacion:     normalized['Identificacion']      ?? '',
      paciente:           normalized['Paciente']            ?? '',
      direccion:          normalized['Direccion']           ?? '',
      telefono:           normalized['Telefono']            ?? normalized[' Telefono'] ?? '',
      formula:            normalized['Formula']             ?? '',
      fecha:              normalized['Fecha']               ?? '',
      producto:           normalized['Producto']            ?? '',
      pendiente:          normalized['Pendiente']           ?? '0',
      entregado:          normalized['Entregado']           ?? '0',
      existencia:         normalized['Existencia']          ?? '0',
      ingresoDelProducto: normalized['IngresodelProducto']  ?? '',
      codigo:             normalized['Codigo']              ?? '',
      cp:                 normalized['CP']                  ?? '',
      cl:                 normalized['CL']                  ?? '',
      estado:             normalized['Estado']              ?? '',
      sucursal:           normalized['Sucursal']            ?? '',
      tipoMedica:         normalized['TipoMedica']          ?? '',
      condicionado:       normalized['Condicionado']        ?? '',
      modalidad:          normalized['Modalidad']           ?? '',
      contrato:           normalized['Contrato']            ?? '',
      clasificacion:      normalized['Clasificacion']       ?? '',
      fecha1:             normalized['Fecha_1']             ?? '',
      observacion1:       normalized['Observacion']         ?? '',
      usuario1:           normalized['Usuario']             ?? '',
      fecha2:             normalized['Fecha_2']             ?? '',
      observacion2:       normalized['Observacion_1']       ?? '',
      usuario2:           normalized['Usuario_1']           ?? '',
      fecha3:             normalized['Fecha_3']             ?? '',
      observacion3:       normalized['Observacion_2']       ?? '',
      usuario3:           normalized['Usuario_2']           ?? '',
    };
  });
}

interface FileMeta {
  name: string;
  size: number;
}

export function MedicamentoUpload(): JSX.Element {
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('idle');
  const [parseError, setParseError] = useState<string | null>(null);
  const [rows, setRows] = useState<CsvRawRow[]>([]);
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [validation, setValidation] = useState<BatchValidationResult | null>(null);
  const [processResult, setProcessResult] = useState<BatchProcessResult | null>(null);
  const [resultsPage, setResultsPage] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  function processFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError('Solo se aceptan archivos .csv');
      return;
    }
    setParseError(null);
    setValidation(null);
    setProcessResult(null);
    setFileMeta({ name: file.name, size: file.size });
    setStep('idle');
    setResultsPage(1);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: result => {
        const headers = (result.meta.fields ?? []).map(h => h.trim());
        const missing = REQUIRED_CSV_COLUMNS.filter(col => !headers.includes(col));
        if (missing.length > 0) {
          setParseError(`Columnas requeridas faltantes: ${missing.join(', ')}`);
          return;
        }
        const normalized = normalizeHeaders(result.data);
        setRows(normalized);
        setStep('preview');
      },
      error: err => setParseError(`Error al parsear el archivo: ${err.message}`),
    });
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file !== undefined) processFile(file);
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>): void {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file !== undefined) processFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>): void {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  }

  function handleDragLeave(e: DragEvent<HTMLLabelElement>): void {
    e.preventDefault();
    setDragOver(false);
  }

  async function handleValidar(): Promise<void> {
    setStep('validating');
    try {
      const result = await pedidosService.validarCsv(rows);
      setValidation(result);
      setResultsPage(1);
      setStep('validated');
    } catch {
      setParseError('Error al conectar con el servidor. Verifica que el backend esté activo.');
      setStep('preview');
    }
  }

  async function handleConfirmar(): Promise<void> {
    if (!validation) return;
    const validRows = rows.filter((_, i) => validation.rows[i]?.valid === true);
    setStep('confirming');
    try {
      const result = await pedidosService.confirmarCsv(validRows);
      setProcessResult(result);
      setStep('done');
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast.success(`${result.totalCreated} registros creados`);
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'AbortError'
          ? 'La operación tardó demasiado. El archivo puede ser muy grande; intenta con un lote menor.'
          : 'Error al guardar los datos. Intenta nuevamente.';
      setParseError(msg);
      setStep('validated');
    }
  }

  function reset(): void {
    setStep('idle');
    setRows([]);
    setFileMeta(null);
    setValidation(null);
    setProcessResult(null);
    setParseError(null);
    setResultsPage(1);
    if (fileInputRef.current !== null) fileInputRef.current.value = '';
  }

  const isWorking = step === 'validating' || step === 'confirming';

  const validationPaged = useMemo(() => {
    if (validation === null) return { rows: [], totalPages: 1 };
    const totalPages = Math.max(1, Math.ceil(validation.rows.length / ROWS_PER_PAGE));
    const start = (resultsPage - 1) * ROWS_PER_PAGE;
    return {
      rows: validation.rows.slice(start, start + ROWS_PER_PAGE),
      totalPages,
    };
  }, [validation, resultsPage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargar archivo CSV</CardTitle>
        <CardDescription>
          Archivo exportado del sistema origen. Delimitador{' '}
          <code className="rounded bg-muted px-1 font-mono text-xs">;</code> — columnas requeridas:{' '}
          <code className="rounded bg-muted px-1 font-mono text-xs">
            Identificacion, Paciente, Formula, Fecha, Producto, Codigo, Estado
          </code>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200',
            dragOver
              ? 'border-primary bg-primary-subtle scale-[1.01]'
              : 'border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40',
            isWorking && 'pointer-events-none opacity-60',
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="sr-only"
            disabled={isWorking}
          />
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
            dragOver ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground ring-1 ring-inset ring-border group-hover:text-primary',
          )}>
            {fileMeta === null ? (
              <UploadCloud className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <FileText className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
            )}
          </div>
          {fileMeta === null ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Arrastra un CSV aquí o <span className="text-primary">haz clic para seleccionar</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Solo archivos .csv · delimitador <code className="rounded bg-muted px-1 font-mono">;</code>
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{fileMeta.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(fileMeta.size)} · Haz clic o suelta otro archivo para reemplazar
              </p>
            </div>
          )}
        </label>

        {isWorking && (
          <div className="space-y-1.5">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="absolute inset-y-0 w-1/3 rounded-full bg-primary animate-progress-indeterminate" />
            </div>
            <p className="text-xs text-muted-foreground">
              {step === 'validating' ? 'Validando contra la base de datos...' : 'Guardando registros...'}
            </p>
          </div>
        )}

        {parseError !== null && <Alert variant="destructive">{parseError}</Alert>}

        {(step === 'preview' || step === 'validating') && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-foreground">
                <span className="font-semibold text-primary tabular-nums">{rows.length}</span> filas detectadas
              </p>
              <Button
                onClick={() => void handleValidar()}
                isLoading={step === 'validating'}
                loadingText="Validando..."
              >
                Validar contra base de datos
              </Button>
            </div>
            <PreviewTable rows={rows.slice(0, 10)} />
            {rows.length > 10 && (
              <p className="text-xs text-muted-foreground">Mostrando 10 de {rows.length} filas.</p>
            )}
          </div>
        )}

        {(step === 'validated' || step === 'confirming') && validation !== null && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                {validation.totalValid} válidas
              </Badge>
              {validation.totalWarnings > 0 && (
                <Badge variant="warning" className="gap-1">
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  {validation.totalWarnings} con advertencias
                </Badge>
              )}
              {validation.totalInvalid > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" aria-hidden="true" />
                  {validation.totalInvalid} inválidas
                </Badge>
              )}
            </div>

            <div className="overflow-hidden rounded-md border border-border">
              <div className="max-h-[30rem] overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
                    <tr>
                      {['#', 'Documento', 'Paciente', 'Medicamento', 'Estado', ''].map((h, i) => (
                        <th key={i} className={cn(
                          'px-3 py-2 text-left font-medium uppercase tracking-wider text-muted-foreground',
                          i === 5 && 'w-10 text-center',
                          i === 4 && 'w-16 text-center',
                        )}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {validationPaged.rows.map(r => {
                      const hasErrors = r.errors.length > 0;
                      const hasWarnings = r.warnings.length > 0;
                      const hasIssues = hasErrors || hasWarnings;
                      const isExpanded = expandedRow === r.rowIndex;
                      const rowBg = r.valid
                        ? hasWarnings
                          ? 'bg-warning-subtle/40'
                          : 'bg-success-subtle/20'
                        : 'bg-destructive-subtle/40';
                      return (
                        <Fragment key={r.rowIndex}>
                          <tr className={rowBg}>
                            <td className="px-3 py-1.5 text-muted-foreground tabular-nums">{r.rowIndex + 1}</td>
                            <td className="px-3 py-1.5 font-mono">{r.identificacion ?? '—'}</td>
                            <td className="px-3 py-1.5 max-w-[140px] truncate" title={r.paciente ?? ''}>{r.paciente ?? '—'}</td>
                            <td className="px-3 py-1.5 max-w-[160px] truncate" title={r.producto ?? ''}>{r.producto ?? '—'}</td>
                            <td className="px-3 py-1.5 text-center">
                              {r.valid ? (
                                hasWarnings ? (
                                  <AlertTriangle className="inline h-4 w-4 text-warning-subtle-foreground" aria-label="Advertencias" />
                                ) : (
                                  <CheckCircle2 className="inline h-4 w-4 text-success-subtle-foreground" aria-label="Válida" />
                                )
                              ) : (
                                <XCircle className="inline h-4 w-4 text-destructive-subtle-foreground" aria-label="Inválida" />
                              )}
                            </td>
                            <td className="px-2 py-1 text-center">
                              {hasIssues ? (
                                <button
                                  type="button"
                                  onClick={() => setExpandedRow(prev => prev === r.rowIndex ? null : r.rowIndex)}
                                  aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                                  aria-expanded={isExpanded}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  <ChevronDown
                                    className={cn(
                                      'h-3.5 w-3.5 transition-transform duration-150',
                                      isExpanded && 'rotate-180',
                                    )}
                                    aria-hidden="true"
                                  />
                                </button>
                              ) : (
                                <span aria-hidden="true" className="text-muted-foreground/40">·</span>
                              )}
                            </td>
                          </tr>
                          {isExpanded && hasIssues && (
                            <tr className={rowBg}>
                              <td colSpan={6} className="px-3 pb-3 pt-0">
                                <div className="ml-6 space-y-1.5 border-l-2 border-border pl-3">
                                  {r.errors.map((e, i) => (
                                    <div key={`e-${i}`} className="flex items-start gap-1.5 text-xs">
                                      <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-destructive-subtle-foreground" aria-hidden="true" />
                                      <span className="text-destructive-subtle-foreground">{e}</span>
                                    </div>
                                  ))}
                                  {r.warnings.map((w, i) => (
                                    <div key={`w-${i}`} className="flex items-start gap-1.5 text-xs">
                                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning-subtle-foreground" aria-hidden="true" />
                                      <span className="text-warning-subtle-foreground">{w}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {validationPaged.totalPages > 1 && (
                <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-3 py-2">
                  <span className="text-xs text-muted-foreground">
                    Mostrando {(resultsPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(resultsPage * ROWS_PER_PAGE, validation.rows.length)} de {validation.rows.length}
                  </span>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => {
                            setExpandedRow(null);
                            setResultsPage(p => Math.max(1, p - 1));
                          }}
                          disabled={resultsPage === 1}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationStatus page={resultsPage} totalPages={validationPaged.totalPages} />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            setExpandedRow(null);
                            setResultsPage(p => Math.min(validationPaged.totalPages, p + 1));
                          }}
                          disabled={resultsPage === validationPaged.totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => void handleConfirmar()}
                isLoading={step === 'confirming'}
                loadingText="Guardando..."
                disabled={validation.totalValid === 0}
              >
                Confirmar carga ({validation.totalValid} filas válidas)
              </Button>
              <Button onClick={reset} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && processResult !== null && (
          <Alert variant="success">
            <AlertTitle>Carga completada</AlertTitle>
            <AlertDescription>
              <ul className="mt-1 space-y-1">
                <li>✓ {processResult.totalCreated} registros creados</li>
                {processResult.totalSkipped > 0 && (
                  <li>⟳ {processResult.totalSkipped} ya existían (saltados)</li>
                )}
                {processResult.totalErrors > 0 && (
                  <li className="text-destructive-subtle-foreground">
                    ✗ {processResult.totalErrors} errores
                  </li>
                )}
              </ul>
              <div className="mt-3">
                <Button onClick={reset} variant="outline" size="sm">
                  Cargar otro archivo
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function PreviewTable({ rows }: { rows: CsvRawRow[] }): JSX.Element {
  if (rows.length === 0) return <></>;
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="min-w-full text-xs">
        <thead className="bg-muted/60">
          <tr>
            {['Documento', 'Paciente', 'Fórmula', 'Fecha', 'Medicamento', 'Código', 'Pendiente', 'Estado'].map(h => (
              <th key={h} className="px-3 py-2 text-left font-medium uppercase tracking-wider text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="px-3 py-1.5 font-mono">{r['identificacion']}</td>
              <td className="px-3 py-1.5 max-w-[140px] truncate">{r['paciente']}</td>
              <td className="px-3 py-1.5 font-mono text-xs">{r['formula']}</td>
              <td className="px-3 py-1.5">{r['fecha']}</td>
              <td className="px-3 py-1.5 max-w-[160px] truncate">{r['producto']}</td>
              <td className="px-3 py-1.5 font-mono">{r['codigo']}</td>
              <td className="px-3 py-1.5 text-center">{r['pendiente']}</td>
              <td className="px-3 py-1.5">{r['estado']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
