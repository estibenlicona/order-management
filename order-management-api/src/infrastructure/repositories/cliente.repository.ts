import { PrismaClient } from '@prisma/client';
import { Cliente } from '@domain/entities/cliente.entity';
import { IClienteRepository, UpsertClienteData } from '@domain/repositories/i-cliente.repository';

type ClienteRecord = {
  id: string;
  identificacion: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function prismaToEntity(r: ClienteRecord): Cliente {
  return new Cliente({
    id: r.id,
    identificacion: r.identificacion,
    nombre: r.nombre,
    ...(r.direccion !== null && { direccion: r.direccion }),
    ...(r.telefono !== null && { telefono: r.telefono }),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  });
}

export class ClienteRepository implements IClienteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertByIdentificacion(data: UpsertClienteData): Promise<Cliente> {
    const r = await this.prisma.cliente.upsert({
      where: { identificacion: data.identificacion },
      update: {
        nombre: data.nombre,
        ...(data.direccion !== undefined && { direccion: data.direccion }),
        ...(data.telefono !== undefined && { telefono: data.telefono }),
      },
      create: {
        identificacion: data.identificacion,
        nombre: data.nombre,
        ...(data.direccion !== undefined && { direccion: data.direccion }),
        ...(data.telefono !== undefined && { telefono: data.telefono }),
      },
    });
    return prismaToEntity(r);
  }

  async findByIdentificacion(identificacion: string): Promise<Cliente | null> {
    const r = await this.prisma.cliente.findUnique({ where: { identificacion } });
    return r ? prismaToEntity(r) : null;
  }

  async existsByIdentificacion(identificacion: string): Promise<boolean> {
    const r = await this.prisma.cliente.findUnique({
      where: { identificacion },
      select: { id: true },
    });
    return r !== null;
  }
}
