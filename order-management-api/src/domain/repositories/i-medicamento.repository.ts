import { Medicamento } from '@domain/entities/medicamento.entity';

export interface UpsertMedicamentoData {
  codigo: string;
  nombre: string;
  tipoMedica?: string;
}

export interface IMedicamentoRepository {
  upsertByCodigo(data: UpsertMedicamentoData): Promise<Medicamento>;
  findByCodigo(codigo: string): Promise<Medicamento | null>;
  existsByCodigo(codigo: string): Promise<boolean>;
}
