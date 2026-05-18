import { ICsvBulkProcessor } from '@application/ports/i-csv-bulk-processor';

export type RowStatus = 'created' | 'skipped' | 'error';

export interface BatchRowResult {
  rowIndex: number;
  status: RowStatus;
  formula?: string;
  reason?: string;
}

export interface BatchProcessResult {
  rows: BatchRowResult[];
  totalCreated: number;
  totalSkipped: number;
  totalErrors: number;
}

export class ProcessCsvBatchUseCase {
  constructor(private readonly csvBulkProcessor: ICsvBulkProcessor) {}

  async execute(rawRows: Record<string, unknown>[]): Promise<BatchProcessResult> {
    const batchId = crypto.randomUUID();

    // Cast all values to strings — frontend already sends strings,
    // but body parsing may produce nulls/numbers for empty fields
    const rows = rawRows.map(r =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, v != null ? String(v) : ''])
      )
    ) as Record<string, string>[];

    const results = rows.length > 0
      ? await this.csvBulkProcessor.process(batchId, rows)
      : [];

    return {
      rows: results,
      totalCreated: results.filter(r => r.status === 'created').length,
      totalSkipped: results.filter(r => r.status === 'skipped').length,
      totalErrors:  results.filter(r => r.status === 'error').length,
    };
  }
}
