import { RowValidationResult } from '@application/use-cases/validate-csv-batch.use-case';

export interface ICsvBulkValidator {
  validate(batchId: string, rows: Record<string, string>[]): Promise<RowValidationResult[]>;
}
