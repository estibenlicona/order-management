import { Request, Response, NextFunction } from 'express';
import { prisma } from '@infrastructure/database/prisma.client';
import { CsvBulkRepository } from '@infrastructure/repositories/csv-bulk.repository';
import { ValidateCsvBatchUseCase } from '@application/use-cases/validate-csv-batch.use-case';
import { ProcessCsvBatchUseCase } from '@application/use-cases/process-csv-batch.use-case';
import { CargaCsvBodySchema } from '@presentation/validators/carga-csv.validator';
import { ValidationError } from '@domain/errors/app-error';

const csvBulkRepo     = new CsvBulkRepository(prisma);
const validateUseCase = new ValidateCsvBatchUseCase(csvBulkRepo);
const processUseCase  = new ProcessCsvBatchUseCase(csvBulkRepo);

export async function validarCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = CargaCsvBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError(parsed.error.errors.map(e => e.message).join(', ')));
    }
    const result = await validateUseCase.execute(parsed.data.rows);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function confirmarCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = CargaCsvBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError(parsed.error.errors.map(e => e.message).join(', ')));
    }
    const result = await processUseCase.execute(parsed.data.rows);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}
