import { PrismaClient } from '@prisma/client';
import { Medicamento } from '@domain/entities/medicamento.entity';
import { IMedicamentoRepository, UpsertMedicamentoData } from '@domain/repositories/i-medicamento.repository';

type MedicamentoRecord = {
  id: string;
  codigo: string;
  nombre: string;
  tipoMedica: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function prismaToEntity(r: MedicamentoRecord): Medicamento {
  return new Medicamento({
    id: r.id,
    codigo: r.codigo,
    nombre: r.nombre,
    ...(r.tipoMedica !== null && { tipoMedica: r.tipoMedica }),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  });
}

export class MedicamentoRepository implements IMedicamentoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertByCodigo(data: UpsertMedicamentoData): Promise<Medicamento> {
    const r = await this.prisma.medicamento.upsert({
      where: { codigo: data.codigo },
      update: {
        nombre: data.nombre,
        ...(data.tipoMedica !== undefined && { tipoMedica: data.tipoMedica }),
      },
      create: {
        codigo: data.codigo,
        nombre: data.nombre,
        ...(data.tipoMedica !== undefined && { tipoMedica: data.tipoMedica }),
      },
    });
    return prismaToEntity(r);
  }

  async findByCodigo(codigo: string): Promise<Medicamento | null> {
    const r = await this.prisma.medicamento.findUnique({ where: { codigo } });
    return r ? prismaToEntity(r) : null;
  }

  async existsByCodigo(codigo: string): Promise<boolean> {
    const r = await this.prisma.medicamento.findUnique({
      where: { codigo },
      select: { id: true },
    });
    return r !== null;
  }
}
