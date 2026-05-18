import { BatchRowResult } from '@application/use-cases/process-csv-batch.use-case';

export interface ICsvBulkProcessor {
  process(batchId: string, rows: Record<string, string>[]): Promise<BatchRowResult[]>;
}
