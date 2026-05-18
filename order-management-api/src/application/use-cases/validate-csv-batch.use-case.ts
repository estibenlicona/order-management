import { ICsvBulkValidator } from '@application/ports/i-csv-bulk-validator';

export interface RowValidationResult {
  rowIndex: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
  formula?: string;
  identificacion?: string;
  paciente?: string;
  producto?: string;
}

export interface BatchValidationResult {
  rows: RowValidationResult[];
  totalValid: number;
  totalInvalid: number;
  totalWarnings: number;
}

export class ValidateCsvBatchUseCase {
  constructor(private readonly csvBulkValidator: ICsvBulkValidator) {}

  async execute(rawRows: Record<string, unknown>[]): Promise<BatchValidationResult> {
    const batchId = crypto.randomUUID();

    // Cast all values to strings — body parser may produce nulls/numbers for empty cells
    const rows = rawRows.map(r =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, v != null ? String(v) : ''])
      )
    ) as Record<string, string>[];

    const results = rows.length > 0
      ? await this.csvBulkValidator.validate(batchId, rows)
      : [];

    return {
      rows: results,
      totalValid:    results.filter(r => r.valid).length,
      totalInvalid:  results.filter(r => !r.valid).length,
      totalWarnings: results.filter(r => r.valid && r.warnings.length > 0).length,
    };
  }
}
