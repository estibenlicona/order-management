import { Cliente } from '@domain/entities/cliente.entity';

export interface UpsertClienteData {
  identificacion: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
}

export interface IClienteRepository {
  upsertByIdentificacion(data: UpsertClienteData): Promise<Cliente>;
  findByIdentificacion(identificacion: string): Promise<Cliente | null>;
  existsByIdentificacion(identificacion: string): Promise<boolean>;
}
